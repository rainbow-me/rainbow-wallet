import Clipboard from '@react-native-community/clipboard';
import analytics from '@segment/analytics-react-native';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, requireNativeComponent } from 'react-native';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/primitives';
import useExperimentalFlag, {
  AVATAR_PICKER,
} from '../../config/experimentalHooks';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import TransactionTypes from '../../helpers/transactionTypes';
import { isENSAddressFormat } from '../../helpers/validators';
import { useAccountProfile } from '../../hooks';
import { useNavigation } from '../../navigation/Navigation';
import { removeRequest } from '../../redux/requests';
import { abbreviations, ethereumUtils } from '../../utils';
import { showActionSheetWithOptions } from '../../utils/actionsheet';
import { FloatingEmojis } from '../floating-emojis';
import Routes from '@rainbow-me/routes';
import { colors } from '@rainbow-me/styles';
const NativeTransactionListView = requireNativeComponent('TransactionListView');

const Container = styled.View`
  flex: 1;
  margin-top: 0;
`;

const FloatingEmojisRegion = styled(FloatingEmojis).attrs({
  distance: 250,
  duration: 500,
  fadeOut: false,
  scaleTo: 0,
  size: 50,
  wiggleFactor: 0,
})`
  height: 0;
  left: ${({ tapTarget }) => tapTarget[0] - 24};
  position: absolute;
  top: ${({ tapTarget }) => tapTarget[1] - tapTarget[3]};
  width: ${({ tapTarget }) => tapTarget[2]};
`;

const TransactionList = ({
  addCashAvailable,
  contacts,
  initialized,
  isLoading,
  network,
  requests,
  transactions,
}) => {
  const [tapTarget, setTapTarget] = useState([0, 0, 0, 0]);
  const onNewEmoji = useRef();
  const setOnNewEmoji = useCallback(
    newOnNewEmoji => (onNewEmoji.current = newOnNewEmoji),
    []
  );
  const dispatch = useDispatch();
  const { navigate, isFocused } = useNavigation();
  const {
    accountAddress,
    accountColor,
    accountSymbol,
    accountName,
  } = useAccountProfile();

  const onAddCashPress = useCallback(() => {
    navigate(Routes.ADD_CASH_FLOW);
    analytics.track('Tapped Add Cash', {
      category: 'add cash',
    });
  }, [navigate]);

  const onAvatarPress = useCallback(() => {
    navigate(Routes.AVATAR_BUILDER, {
      accountColor,
      accountName,
    });
  }, [accountColor, accountName, navigate]);

  const onReceivePress = useCallback(() => {
    navigate(Routes.RECEIVE_MODAL);
  }, [navigate]);

  const onRequestExpire = useCallback(
    e => {
      const { index } = e.nativeEvent;
      const item = requests[index];
      item && item.requestId && dispatch(removeRequest(item.requestId));
    },
    [dispatch, requests]
  );

  const onRequestPress = useCallback(
    e => {
      const { index } = e.nativeEvent;
      const item = requests[index];
      navigate(Routes.CONFIRM_REQUEST, { transactionDetails: item });
      return;
    },
    [navigate, requests]
  );

  const onTransactionPress = useCallback(
    e => {
      const { index } = e.nativeEvent;
      const item = transactions[index];
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
      const contact = contacts[contactAddress];
      let contactColor = 0;

      if (contact) {
        headerInfo.address = contact.nickname;
        contactColor = contact.color;
      } else {
        headerInfo.address = isENSAddressFormat(contactAddress)
          ? contactAddress
          : abbreviations.address(contactAddress, 4, 10);
        contactColor = colors.getRandomColor();
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
    },
    [contacts, navigate, network, transactions]
  );

  const onCopyAddressPress = useCallback(
    e => {
      const { x, y, width, height } = e.nativeEvent;
      setTapTarget([x, y, width, height]);
      if (onNewEmoji && onNewEmoji.current) {
        onNewEmoji.current();
      }
      Clipboard.setString(accountAddress);
    },
    [accountAddress]
  );

  const onAccountNamePress = useCallback(() => {
    navigate(Routes.CHANGE_WALLET_SHEET);
  }, [navigate]);

  const data = useMemo(
    () => ({
      requests,
      transactions,
    }),
    [requests, transactions]
  );

  const loading = useMemo(() => (!initialized && !isFocused()) || isLoading, [
    initialized,
    isLoading,
    isFocused,
  ]);

  const isAvatarPickerAvailable = useExperimentalFlag(AVATAR_PICKER);

  return (
    <Container>
      <Container
        accountAddress={accountName}
        accountColor={colors.avatarColor[accountColor]}
        accountName={accountSymbol}
        addCashAvailable={addCashAvailable}
        as={NativeTransactionListView}
        data={data}
        isAvatarPickerAvailable={isAvatarPickerAvailable}
        onAccountNamePress={onAccountNamePress}
        onAddCashPress={onAddCashPress}
        onAvatarPress={onAvatarPress}
        onCopyAddressPress={onCopyAddressPress}
        onReceivePress={onReceivePress}
        onRequestExpire={onRequestExpire}
        onRequestPress={onRequestPress}
        onTransactionPress={onTransactionPress}
        isLoading={loading}
      />
      <FloatingEmojisRegion
        setOnNewEmoji={setOnNewEmoji}
        tapTarget={tapTarget}
      />
    </Container>
  );
};

TransactionList.propTypes = {
  addCashAvailable: PropTypes.bool,
  contacts: PropTypes.array,
  initialized: PropTypes.bool,
  isLoading: PropTypes.bool,
  network: PropTypes.string,
  requests: PropTypes.array,
  transactions: PropTypes.array,
};

export default TransactionList;
