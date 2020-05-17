import analytics from '@segment/analytics-react-native';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  getOrderId,
  getReferenceId,
  PaymentRequestStatusTypes,
  showApplePayRequest,
} from '../handlers/wyre';
import { addCashGetOrderStatus } from '../redux/addCash';
import { logger } from '../utils';
import useAccountSettings from './useAccountSettings';
import usePurchaseTransactionStatus from './usePurchaseTransactionStatus';
import useTimeout from './useTimeout';

export default function useWyreApplePay() {
  const { accountAddress, network } = useAccountSettings();

  const [isPaymentComplete, setPaymentComplete] = useState(false);
  const [orderCurrency, setOrderCurrency] = useState(null);

  const { orderStatus, transferStatus } = usePurchaseTransactionStatus();

  const dispatch = useDispatch();

  const [startPaymentCompleteTimeout] = useTimeout();

  const handlePaymentCallback = useCallback(() => {
    // In order to have the UI appear to be in-sync with the Apple Pay modal's
    // animation, we need to artificially delay before marking a purchase as pending.
    startPaymentCompleteTimeout(() => setPaymentComplete(true), 1500);
  }, [startPaymentCompleteTimeout]);

  const onPurchase = useCallback(
    async ({ currency, value }) => {
      const referenceInfo = {
        referenceId: getReferenceId(accountAddress),
      };

      const applePayResponse = await showApplePayRequest(
        referenceInfo,
        accountAddress,
        currency,
        value,
        network
      );

      setOrderCurrency(currency);

      if (applePayResponse) {
        const { paymentResponse, totalAmount } = applePayResponse;
        logger.log('[add cash] - get order id');
        const { orderId, errorCode, type } = await getOrderId(
          referenceInfo,
          paymentResponse,
          totalAmount,
          accountAddress,
          currency,
          network
        );
        if (orderId) {
          referenceInfo.orderId = orderId;
          paymentResponse.complete(PaymentRequestStatusTypes.SUCCESS);
          handlePaymentCallback();
          dispatch(
            addCashGetOrderStatus(
              referenceInfo,
              currency,
              orderId,
              paymentResponse,
              value
            )
          );
        } else {
          paymentResponse.complete(PaymentRequestStatusTypes.FAIL);
          handlePaymentCallback();
          analytics.track('Purchase failed', {
            category: 'add cash',
            error_category: type,
            error_code: errorCode,
          });
        }
      } else {
        analytics.track('Purchase incomplete', {
          category: 'add cash',
        });
      }
    },
    [accountAddress, dispatch, handlePaymentCallback, network]
  );

  return {
    isPaymentComplete,
    onPurchase,
    orderCurrency,
    orderStatus,
    transferStatus,
  };
}
