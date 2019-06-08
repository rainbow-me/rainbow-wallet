import {
  get,
  groupBy,
  isEmpty,
  isNil,
  map,
  toNumber
} from 'lodash';
import { createSelector } from 'reselect';
import {
  add,
  convertAmountToDisplay,
  convertAmountFromBigNumber,
  convertAmountToBigNumber,
  multiply,
  simpleConvertAmountToDisplay,
  sortList,
} from '@rainbow-me/rainbow-common';

const EMPTY_ARRAY = [];

const assetsSelector = state => state.assets;
const nativeCurrencySelector = state => state.nativeCurrency;

const sortAssetsByNativeAmount = (originalAssets, nativeCurrency) => {
  let assetsNativePrices = originalAssets;
  let total = null;
  if (!isEmpty(originalAssets)) {
    const parsedAssets = parseAssetsNative(originalAssets, nativeCurrency);
    assetsNativePrices = parsedAssets.assetsNativePrices;
    total = parsedAssets.total;
  }
  const {
    hasValue = EMPTY_ARRAY,
    noValue = EMPTY_ARRAY,
  } = groupAssetsByMarketValue(assetsNativePrices);

  const sortedAssets = sortList(hasValue, 'native.balance.amount', 'desc', 0, toNumber);
  const sortedShitcoins = sortList(noValue, 'name', 'asc');
  const allAssets = sortedAssets.concat(sortedShitcoins);

  return {
    allAssets,
    allAssetsCount: allAssets.length,
    assets: sortedAssets,
    assetsCount: sortedAssets.length,
    assetsTotal: total,
    shitcoins: sortedShitcoins,
    shitcoinsCount: sortedShitcoins.length,
  };
};

const groupAssetsByMarketValue = assets => groupBy(assets, ({ native }) => (
  isNil(native) ? 'noValue' : 'hasValue'
));

const parseAssetsNative = (
  assets,
  nativeCurrency,
) => {
  console.log('parse assets', assets);
  let assetsNative = assets;
  assetsNative = map(assets, asset => {
    const assetNativePrice = get(asset, 'price');
    if (isNil(assetNativePrice)) {
      return asset;
    }

    const balanceAmountUnit = convertAmountFromBigNumber(
      asset.balance.amount,
      asset.decimals,
    );
    const balancePriceUnit = get(assetNativePrice, 'value', 0);
    const balanceRaw = multiply(balanceAmountUnit, balancePriceUnit);
    const balanceAmount = convertAmountToBigNumber(balanceRaw);
    console.log('balanceAmount', balanceAmount);
    const balanceDisplay = simpleConvertAmountToDisplay(
      balanceAmount,
      nativeCurrency,
    );
    console.log('balanceDisplay', balanceDisplay);
    const assetPrice = assetNativePrice.value;
    return {
      ...asset,
      native: {
        balance: { amount: balanceAmount, display: balanceDisplay },
        price: assetPrice,
        change:
          asset.symbol.toLowerCase() === nativeCurrency.toLowerCase()
            ? { display: '———' }
            : convertAmountToDisplay(convertAmountToBigNumber(assetNativePrice.relative_change_24h)), // TODO percentage
      },
    };
  });
  let totalAmount = assetsNative.reduce(
    (total, asset) =>
    add(total, asset.native ? asset.native.balance.amount : 0),
    0,
  );
  const totalDisplay = simpleConvertAmountToDisplay(totalAmount, nativeCurrency);
  const total = { amount: totalAmount, display: totalDisplay };
  console.log('assets native', assetsNative);
  return { assetsNativePrices: assetsNative, total };
};

export const sortAssetsByNativeAmountSelector = createSelector(
  [ assetsSelector, nativeCurrencySelector ],
  sortAssetsByNativeAmount
);
