import { format } from 'date-fns';
import { compact, get } from 'lodash';
import React, { useCallback } from 'react';
import { Linking } from 'react-native';
import { css } from 'styled-components/primitives';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import TransactionTypes from '../../helpers/transactionTypes';
import { useAccountSettings } from '../../hooks';
import { useNavigation } from '../../navigation/Navigation';
import { abbreviations, ethereumUtils } from '../../utils';
import { showActionSheetWithOptions } from '../../utils/actionsheet';
import { ButtonPressAnimation } from '../animations';
import { FlexItem, Row, RowWithMargins } from '../layout';
import BalanceText from './BalanceText';
import BottomRowText from './BottomRowText';
import CoinName from './CoinName';
import CoinRow from './CoinRow';
import TransactionStatusBadge from './TransactionStatusBadge';
import Routes from '@rainbow-me/routes';
import { colors } from '@rainbow-me/styles';

const containerStyles = css`
  padding-left: 19;
`;

const BottomRow = ({ description, native, status, type }) => {
  const isFailed = status === TransactionStatusTypes.failed;
  const isReceived =
    status === TransactionStatusTypes.received ||
    status === TransactionStatusTypes.purchased;
  const isSent = status === TransactionStatusTypes.sent;

  const isOutgoingSwap = status === TransactionStatusTypes.swapped;
  const isIncomingSwap =
    status === TransactionStatusTypes.received &&
    type === TransactionTypes.trade;

  let coinNameColor = colors.dark;
  if (isOutgoingSwap) coinNameColor = colors.alpha(colors.blueGreyDark, 0.5);

  let balanceTextColor = colors.alpha(colors.blueGreyDark, 0.5);
  if (isReceived) balanceTextColor = colors.green;
  if (isSent) balanceTextColor = colors.dark;
  if (isIncomingSwap) balanceTextColor = colors.swapPurple;
  if (isOutgoingSwap) balanceTextColor = colors.dark;

  const nativeDisplay = get(native, 'display');
  const balanceText = nativeDisplay
    ? compact([isFailed || isSent ? '-' : null, nativeDisplay]).join(' ')
    : '';

  return (
    <Row align="center" justify="space-between">
      <FlexItem flex={1}>
        <CoinName color={coinNameColor}>{description}</CoinName>
      </FlexItem>
      <BalanceText
        color={balanceTextColor}
        weight={isReceived ? 'medium' : null}
      >
        {balanceText}
      </BalanceText>
    </Row>
  );
};

const TopRow = ({ balance, pending, status, title }) => (
  <RowWithMargins align="center" justify="space-between" margin={19}>
    <TransactionStatusBadge pending={pending} status={status} title={title} />
    <Row align="center" flex={1} justify="end">
      <BottomRowText align="right">{get(balance, 'display', '')}</BottomRowText>
    </Row>
  </RowWithMargins>
);

export default function TransactionCoinRow({ item, ...props }) {
  const { contact } = item;
  const { network } = useAccountSettings();
  const { navigate } = useNavigation();

  const onPressTransaction = useCallback(async () => {
    const { hash, from, minedAt, pending, to, status, type } = item;

    const calculateTimestampOfToday = () => {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
    const calculateTimestampOfYesterday = () => {
      var d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
    const calculateTimestampOfThisYear = () => {
      var d = new Date();
      d.setFullYear(d.getFullYear(), 0, 1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
    const todayTimestamp = calculateTimestampOfToday();
    const yesterdayTimestamp = calculateTimestampOfYesterday();
    const thisYearTimestamp = calculateTimestampOfThisYear();

    const timestamp = new Date(minedAt * 1000);
    const date = format(
      timestamp,
      timestamp > todayTimestamp
        ? `'Today'`
        : timestamp > yesterdayTimestamp
        ? `'Yesterday'`
        : `'on' MMM d${timestamp > thisYearTimestamp ? '' : ' yyyy'}`
    );

    const hasAddableContact =
      (status === TransactionStatusTypes.received &&
        type !== TransactionTypes.trade) ||
      status === TransactionStatusTypes.receiving ||
      status === TransactionStatusTypes.sending ||
      status === TransactionStatusTypes.sent;
    const isSent =
      status === TransactionStatusTypes.sending ||
      status === TransactionStatusTypes.sent;

    const headerInfo = {
      address: '',
      divider: isSent ? 'to' : 'from',
      type: status.charAt(0).toUpperCase() + status.slice(1),
    };

    const contactAddress = isSent ? to : from;
    let contactColor = 0;

    if (contact) {
      headerInfo.address = contact.nickname;
      contactColor = contact.color;
    } else {
      headerInfo.address = abbreviations.address(contactAddress, 4, 10);
      contactColor = Math.floor(Math.random() * colors.avatarColor.length);
    }

    if (hash) {
      let buttons = ['View on Etherscan', 'Cancel'];
      if (hasAddableContact) {
        buttons.unshift(contact ? 'View Contact' : 'Add to Contacts');
      }

      showActionSheetWithOptions(
        {
          cancelButtonIndex: hasAddableContact ? 2 : 1,
          options: buttons,
          title: pending
            ? `${headerInfo.type}${
                hasAddableContact
                  ? ' ' + headerInfo.divider + ' ' + headerInfo.address
                  : ''
              }`
            : hasAddableContact
            ? `${headerInfo.type} ${date} ${headerInfo.divider} ${headerInfo.address}`
            : `${headerInfo.type} ${date}`,
        },
        buttonIndex => {
          if (hasAddableContact && buttonIndex === 0) {
            navigate(Routes.MODAL_SCREEN, {
              address: contactAddress,
              asset: item,
              color: contactColor,
              contact,
              type: 'contact',
            });
          } else if (
            (!hasAddableContact && buttonIndex === 0) ||
            (hasAddableContact && buttonIndex === 1)
          ) {
            const normalizedHash = hash.replace(/-.*/g, '');
            const etherscanHost = ethereumUtils.getEtherscanHostFromNetwork(
              network
            );
            Linking.openURL(`https://${etherscanHost}/tx/${normalizedHash}`);
          }
        }
      );
    }
  }, [contact, item, navigate, network]);

  return (
    <ButtonPressAnimation onPress={onPressTransaction} scaleTo={0.96}>
      <CoinRow
        {...item}
        {...props}
        bottomRowRender={BottomRow}
        containerStyles={containerStyles}
        topRowRender={TopRow}
      />
    </ButtonPressAnimation>
  );
}
