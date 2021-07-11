import { map, zipObject } from 'lodash';
import {
  EtherscanPrices,
  EthGasStationPrices,
  GasPrice,
  GasPrices,
  GasSpeedOption,
  TxFee,
} from '@rainbow-me/entities';
import { getMinimalTimeUnitStringForMs } from '@rainbow-me/helpers/time';
import { ethUnits, timeUnits } from '@rainbow-me/references';
import {
  BigNumberish,
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
  divide,
  multiply,
  toFixedDecimals,
} from '@rainbow-me/utilities';
import { gasUtils } from '@rainbow-me/utils';

const { GasSpeedOrder } = gasUtils;

const parseGasPricesEtherscan = (data: EtherscanPrices): GasPrices => ({
  [GasSpeedOption.CUSTOM]: null,
  [GasSpeedOption.FAST]: formatGasPrice(
    GasSpeedOption.FAST,
    data.fastWait,
    data.fast
  ),
  [GasSpeedOption.NORMAL]: formatGasPrice(
    GasSpeedOption.NORMAL,
    data.avgWait,
    data.average
  ),
  [GasSpeedOption.SLOW]: formatGasPrice(
    GasSpeedOption.SLOW,
    data.safeLowWait,
    data.safeLow
  ),
});

const parseGasPricesEthGasStation = (data: EthGasStationPrices): GasPrices => ({
  [GasSpeedOption.CUSTOM]: null,
  [GasSpeedOption.FAST]: formatGasPrice(
    GasSpeedOption.FAST,
    data.fastestWait,
    divide(data.fastest, 10)
  ),
  [GasSpeedOption.NORMAL]: formatGasPrice(
    GasSpeedOption.NORMAL,
    data.fastWait,
    divide(data.fast, 10)
  ),
  [GasSpeedOption.SLOW]: formatGasPrice(
    GasSpeedOption.SLOW,
    data.avgWait,
    divide(data.average, 10)
  ),
});

/**
 * @desc parse ether gas prices
 * @param {Object} data
 * @param {Boolean} short - use short format or not
 */
export const parseGasPrices = (
  data: EtherscanPrices | EthGasStationPrices,
  source = 'etherscan'
): GasPrices | null =>
  !data
    ? null
    : source === 'etherscan'
    ? parseGasPricesEtherscan(data as EtherscanPrices)
    : parseGasPricesEthGasStation(data as EthGasStationPrices);

export const formatGasPrice = (
  option: GasSpeedOption,
  timeWait: BigNumberish,
  value: string | number
): GasPrice => {
  const timeAmount = multiply(timeWait, timeUnits.ms.minute);
  const weiAmount = multiply(value, ethUnits.gwei);
  const gweiAmount = toFixedDecimals(value, 0);
  return {
    estimatedTime: {
      amount: timeAmount,
      display: getMinimalTimeUnitStringForMs(timeAmount),
    },
    option,
    value: {
      amount: weiAmount,
      display: `${gweiAmount} Gwei`,
    },
  };
};

/**
 * @desc parse ether gas prices with updated gas limit
 * @param {Object} data
 * @param {Object} prices
 * @param {Number} gasLimit
 */
export const parseTxFees = (
  gasPrices: GasPrices,
  priceUnit: BigNumberish,
  gasLimit: BigNumberish,
  nativeCurrency: string
): Record<string, TxFee | null> => {
  const txFees = map(GasSpeedOrder, speed => {
    const gasPrice = gasPrices?.[speed]?.value?.amount;
    return getTxFee(gasPrice, gasLimit, priceUnit, nativeCurrency);
  });
  return zipObject(GasSpeedOrder, txFees);
};

const getTxFee = (
  gasPrice: BigNumberish | undefined,
  gasLimit: BigNumberish,
  priceUnit: BigNumberish,
  nativeCurrency: string
): TxFee | null => {
  if (!gasPrice) return null;
  const amount = multiply(gasPrice, gasLimit);
  return {
    native: {
      value: convertRawAmountToNativeDisplay(
        amount,
        18,
        priceUnit,
        nativeCurrency
      ),
    },
    value: {
      amount,
      display: convertRawAmountToBalance(amount, {
        decimals: 18,
      }),
    },
  };
};

export const gweiToWei = (gweiAmount: BigNumberish): string =>
  multiply(gweiAmount, ethUnits.gwei);

export const weiToGwei = (weiAmount: BigNumberish): string =>
  divide(weiAmount, ethUnits.gwei);
