import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import usePrevious from './usePrevious';
import { GasSpeedOption } from '@rainbow-me/entities';
import {
  gasPricesStartPolling,
  gasPricesStopPolling,
  gasUpdateCustomValues,
  gasUpdateDefaultGasLimit,
  gasUpdateGasSpeedOption,
  gasUpdateTxFee,
} from '@rainbow-me/redux/gas';
import { AppState } from '@rainbow-me/redux/store';

export default function useGas() {
  const dispatch = useDispatch();

  const gasData = useSelector(
    ({
      gas: {
        gasLimit,
        gasPrices,
        gasSpeedOption,
        isSufficientGas,
        selectedGasPrice,
        txFees,
      },
    }: AppState) => ({
      gasLimit,
      gasPrices,
      gasSpeedOption,
      isSufficientGas,
      selectedGasPrice,
      txFees,
    })
  );

  const prevSelectedGasPrice = usePrevious(gasData?.selectedGasPrice);

  const startPollingGasPrices = useCallback(
    () => dispatch(gasPricesStartPolling()),
    [dispatch]
  );
  const stopPollingGasPrices = useCallback(
    () => dispatch(gasPricesStopPolling()),
    [dispatch]
  );

  const updateDefaultGasLimit = useCallback(
    (defaultGasLimit: number) =>
      dispatch(gasUpdateDefaultGasLimit(defaultGasLimit)),
    [dispatch]
  );

  const updateGasPriceOption = useCallback(
    (option: GasSpeedOption) => dispatch(gasUpdateGasSpeedOption(option)),
    [dispatch]
  );

  const updateTxFee = useCallback(
    (newGasLimit: string | number, overrideGasOption: GasSpeedOption) => {
      dispatch(gasUpdateTxFee(newGasLimit, overrideGasOption));
    },
    [dispatch]
  );

  const updateCustomValues = useCallback(
    (price: string) => dispatch(gasUpdateCustomValues(price)),
    [dispatch]
  );

  return {
    prevSelectedGasPrice,
    startPollingGasPrices,
    stopPollingGasPrices,
    updateCustomValues,
    updateDefaultGasLimit,
    updateGasPriceOption,
    updateTxFee,
    ...gasData,
  };
}
