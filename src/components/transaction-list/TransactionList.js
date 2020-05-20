import Clipboard from '@react-native-community/clipboard';
import analytics from '@segment/analytics-react-native';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, requireNativeComponent, StyleSheet } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch } from 'react-redux';
import { isAvatarPickerAvailable } from '../../config/experimental';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import { useAccountProfile } from '../../hooks';
import { removeRequest } from '../../redux/requests';
import Routes from '../../screens/Routes/routesNames';
import { colors } from '../../styles';
import { abbreviations, ethereumUtils } from '../../utils';
import { showActionSheetWithOptions } from '../../utils/actionsheet';
import LoadingState from '../activity-list/LoadingState';
import { FloatingEmojis } from '../floating-emojis';
import { Row } from '../layout';
const NativeTransactionListView = requireNativeComponent('TransactionListView');

const sx = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

const TransactionList = ({
  addCashAvailable,
  contacts,
  header,
  initialized,
  isLoading,
  navigation,
  network,
  requests,
  style,
  transactions,
}) => {
  const [tapTarget, setTapTarget] = useState([0, 0, 0, 0]);
  const onNewEmoji = useRef();
  const setOnNewEmoji = useCallback(
    newOnNewEmoji => (onNewEmoji.current = newOnNewEmoji),
    []
  );
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const {
    accountAddress,
    accountSymbol,
    accountColor,
    accountName,
  } = useAccountProfile();

  const onAddCashPress = useCallback(() => {
    navigation.navigate(Routes.ADD_CASH_SHEET);
    analytics.track('Tapped Add Cash', {
      category: 'add cash',
    });
  }, [navigation]);

  const onAvatarPress = useCallback(() => {
    navigation.navigate(Routes.AVATAR_BUILDER, {
      accountColor,
      accountName,
    });
  }, [accountColor, accountName, navigation]);

  const onReceivePress = useCallback(() => {
    navigation.navigate(Routes.RECEIVE_MODAL);
  }, [navigation]);

  const onRequestExpire = useCallback(
    e => {
      const { index } = e.nativeEvent;
      const item = requests[index];
      dispatch(removeRequest(item.requestId));
    },
    [dispatch, requests]
  );

  const onRequestPress = useCallback(
    e => {
      const { index } = e.nativeEvent;
      const item = requests[index];
      navigation.navigate({
        params: { transactionDetails: item },
        routeName: Routes.CONFIRM_REQUEST,
      });
      return;
    },
    [navigation, requests]
  );

  const onTransactionPress = useCallback(
    e => {
      const { index } = e.nativeEvent;
      const item = transactions[index];
      const { hash, from, to, status } = item;

      const isPurchasing = status === TransactionStatusTypes.purchasing;
      const isSent = status === TransactionStatusTypes.sent;

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
        headerInfo.address = abbreviations.address(contactAddress, 4, 10);
        contactColor = Math.floor(Math.random() * colors.avatarColor.length);
      }

      if (hash) {
        let buttons = ['View on Etherscan', 'Cancel'];
        if (!isPurchasing) {
          buttons.unshift(contact ? 'View Contact' : 'Add to Contacts');
        }

        showActionSheetWithOptions(
          {
            cancelButtonIndex: isPurchasing ? 1 : 2,
            options: buttons,
            title: isPurchasing
              ? headerInfo.type
              : `${headerInfo.type} ${headerInfo.divider} ${headerInfo.address}`,
          },
          buttonIndex => {
            if (!isPurchasing && buttonIndex === 0) {
              navigation.navigate(Routes.EXPANDED_ASSET_SCREEN, {
                address: contactAddress,
                asset: item,
                color: contactColor,
                contact,
                type: 'contact',
              });
            } else if (
              (isPurchasing && buttonIndex === 0) ||
              (!isPurchasing && buttonIndex === 1)
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
    [contacts, navigation, network, transactions]
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

  if ((!initialized && !navigation.isFocused()) || isLoading) {
    return <LoadingState>{header}</LoadingState>;
  }

  return (
    <Row flex={1}>
      <NativeTransactionListView
        accountAddress={accountName}
        accountColor={colors.avatarColor[accountColor]}
        accountName={accountSymbol}
        addCashAvailable={addCashAvailable}
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
        style={[sx.flex, style]}
      />
      <FloatingEmojis
        distance={250}
        duration={500}
        fadeOut={false}
        scaleTo={0}
        size={50}
        style={{
          height: 0,
          left: tapTarget[0] - 24,
          position: 'absolute',
          top: tapTarget[1] - tapTarget[3],
          width: tapTarget[2],
        }}
        setOnNewEmoji={setOnNewEmoji}
        wiggleFactor={0}
      />
    </Row>
  );
};

TransactionList.propTypes = {
  addCashAvailable: PropTypes.bool,
  contacts: PropTypes.array,
  header: PropTypes.node,
  initialized: PropTypes.bool,
  isLoading: PropTypes.bool,
  navigation: PropTypes.object,
  network: PropTypes.string,
  requests: PropTypes.array,
  style: PropTypes.object,
  transactions: PropTypes.array,
};

TransactionList.defaultProps = {
  style: {},
};

export default TransactionList;
