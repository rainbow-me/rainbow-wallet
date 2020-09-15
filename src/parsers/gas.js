import { get, map, zipObject } from 'lodash';
import { getMinimalTimeUnitStringForMs } from '../helpers/time';
import {
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
  multiply,
} from '../helpers/utilities';
import ethUnits from '../references/ethereum-units.json';
import timeUnits from '../references/time-units.json';
import { gasUtils } from '../utils';

const { CUSTOM, FAST, NORMAL, SLOW, GasSpeedOrder } = gasUtils;

/**
 * @desc parse ether gas prices
 * @param {Object} data
 * @param {Boolean} short - use short format or not
 */
export const getFallbackGasPrices = (short = true) => ({
  [CUSTOM]: null,
  [FAST]: defaultGasPriceFormat(FAST, '0.5', '200', short),
  [NORMAL]: defaultGasPriceFormat(NORMAL, '2.5', '100', short),
  [SLOW]: defaultGasPriceFormat(SLOW, '2.5', '100', short),
});

const parseGasPricesEtherscan = data => ({
  [CUSTOM]: null,
  [FAST]: defaultGasPriceFormat(FAST, data.fastWait, data.fast, true),
  [NORMAL]: defaultGasPriceFormat(NORMAL, data.avgWait, data.average, true),
  [SLOW]: defaultGasPriceFormat(SLOW, data.safeLowWait, data.safeLow, true),
});

const parseGasPricesEthGasStation = data => ({
  [CUSTOM]: null,
  [FAST]: defaultGasPriceFormat(FAST, data.fastestWait, data.fastest, true),
  [NORMAL]: defaultGasPriceFormat(NORMAL, data.fastWait, data.fast, true),
  [SLOW]: defaultGasPriceFormat(SLOW, data.avgWait, data.average, true),
});

/**
 * @desc parse ether gas prices
 * @param {Object} data
 * @param {Boolean} short - use short format or not
 */
export const parseGasPrices = (data, source = 'etherscan') =>
  !data
    ? getFallbackGasPrices()
    : source === 'etherscan'
    ? parseGasPricesEtherscan(data)
    : parseGasPricesEthGasStation(data);

export const defaultGasPriceFormat = (option, timeWait, value) => {
  const timeAmount = multiply(timeWait, timeUnits.ms.minute);
  const weiAmount = multiply(value, ethUnits.gwei);
  return {
    estimatedTime: {
      amount: timeAmount,
      display: getMinimalTimeUnitStringForMs(timeAmount),
    },
    option,
    value: {
      amount: weiAmount,
      display: `${parseInt(value, 10)} Gwei`,
    },
  };
};

/**
 * @desc parse ether gas prices with updated gas limit
 * @param {Object} data
 * @param {Object} prices
 * @param {Number} gasLimit
 */
export const parseTxFees = (gasPrices, priceUnit, gasLimit, nativeCurrency) => {
  const txFees = map(GasSpeedOrder, speed => {
    const gasPrice = get(gasPrices, `${speed}.value.amount`);
    return {
      txFee: getTxFee(gasPrice, gasLimit, priceUnit, nativeCurrency),
    };
  });
  return zipObject(GasSpeedOrder, txFees);
};

export const getTxFee = (gasPrice, gasLimit, priceUnit, nativeCurrency) => {
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
        symbol: 'ETH',
      }),
    },
  };
};

export const gweiToWei = gweiAmount => {
  const weiAmount = Number(gweiAmount) * 1000000000;
  return weiAmount;
};

export const weiToGwei = gweiAmount => {
  const weiAmount = Number(gweiAmount) / 1000000000;
  return weiAmount;
};
