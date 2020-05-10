import { getMarketDetails as getUniswapMarketDetails } from '@uniswap/sdk';
import { get } from 'lodash';
import { useCallback } from 'react';
import { divide } from '../helpers/utilities';
import { ethereumUtils } from '../utils';
import useAccountAssets from './useAccountAssets';
import useUniswapAllowances from './useUniswapAllowances';

export default function useUniswapMarketDetails() {
  const { allAssets } = useAccountAssets();

  const { inputReserve, outputReserve } = useUniswapAllowances();

  const getMarketPrice = useCallback(
    (inputCurrency, outputCurrency, useInputReserve = true) => {
      const ethPrice = ethereumUtils.getEthPriceUnit(allAssets);
      if (
        (useInputReserve && get(inputCurrency, 'address') === 'eth') ||
        (!useInputReserve && get(outputCurrency, 'address') === 'eth')
      )
        return ethPrice;

      if (
        (useInputReserve && !inputReserve) ||
        (!useInputReserve && !outputReserve)
      )
        return 0;

      const marketDetails = getUniswapMarketDetails(
        undefined,
        useInputReserve ? inputReserve : outputReserve
      );
      const assetToEthPrice = get(marketDetails, 'marketRate.rate');
      return divide(ethPrice, assetToEthPrice) || 0;
    },
    [allAssets, inputReserve, outputReserve]
  );

  return {
    getMarketPrice,
  };
}
