import analytics from '@segment/analytics-react-native';
import { captureException } from '@sentry/react-native';
import {
  Asset,
  GasPrices,
  GasSpeedOption,
  SelectedGasPrice,
  TxFees,
} from '@rainbow-me/entities';
import {
  etherscanGetGasEstimates,
  etherscanGetGasPrices,
  ethGasStationGetGasPrices,
  getEstimatedTimeForGasPrice,
} from '@rainbow-me/handlers/gasPrices';
import {
  formatGasPrice,
  parseGasPrices,
  parseTxFees,
} from '@rainbow-me/parsers';
import { AppDispatch, AppGetState } from '@rainbow-me/redux/store';
import { ethUnits } from '@rainbow-me/references';
import { fromWei, greaterThanOrEqualTo } from '@rainbow-me/utilities';
import { ethereumUtils } from '@rainbow-me/utils';
import logger from 'logger';

interface GasState {
  defaultGasLimit: number;
  gasLimit: string | number | null;
  gasPrices: GasPrices | null;
  gasSpeedOption: GasSpeedOption;
  isSufficientGas: boolean;
  selectedGasPrice: SelectedGasPrice | {};
  txFees: TxFees | {};
}

interface GasUpdateDefaultGasLimitAction {
  type: typeof GAS_UPDATE_DEFAULT_GAS_LIMIT;
  payload: GasState['defaultGasLimit'];
}

interface GasPricesSuccessAction {
  type: typeof GAS_PRICES_SUCCESS;
  payload: GasState['gasPrices'];
}

interface GasUpdateTxFeeAction {
  type: typeof GAS_UPDATE_TX_FEE;
  payload: {
    gasLimit: GasState['gasLimit'];
    isSufficientGas: GasState['isSufficientGas'];
    selectedGasPrice: GasState['selectedGasPrice'];
    txFees: GasState['txFees'];
  };
}

interface GasUpdateGasPriceOptionAction {
  type: typeof GAS_UPDATE_GAS_PRICE_OPTION;
  payload: {
    gasSpeedOption: GasState['gasSpeedOption'];
    isSufficientGas: GasState['isSufficientGas'];
    selectedGasPrice: GasState['selectedGasPrice'];
  };
}

export type GasActionTypes =
  | GasUpdateDefaultGasLimitAction
  | GasPricesSuccessAction
  | GasPricesSuccessAction
  | GasUpdateTxFeeAction
  | GasUpdateGasPriceOptionAction;

// -- Constants ------------------------------------------------------------- //
const GAS_UPDATE_DEFAULT_GAS_LIMIT = 'gas/GAS_UPDATE_DEFAULT_GAS_LIMIT';
const GAS_PRICES_SUCCESS = 'gas/GAS_PRICES_SUCCESS';

const GAS_UPDATE_TX_FEE = 'gas/GAS_UPDATE_TX_FEE';
const GAS_UPDATE_GAS_PRICE_OPTION = 'gas/GAS_UPDATE_GAS_PRICE_OPTION';

// -- Actions --------------------------------------------------------------- //
let gasPricesHandle: number | null = null;

export const updateGasPriceForSpeed = (
  speed: GasSpeedOption,
  newPrice: string
) => async (dispatch: AppDispatch, getState: AppGetState) => {
  const { gasPrices } = getState().gas;

  if (gasPrices) {
    const newGasPrices: GasPrices = { ...gasPrices };
    const speedGasPrice = newGasPrices[speed];
    if (speedGasPrice) {
      newGasPrices[speed] = {
        ...speedGasPrice,
        value: {
          amount: newPrice,
          display: `${newPrice} Gwei`,
        },
      };
      dispatch({
        payload: newGasPrices,
        type: GAS_PRICES_SUCCESS,
      });
    }
  }
};

export const gasPricesStartPolling = () => async (
  dispatch: AppDispatch,
  getState: AppGetState
) => {
  const getGasPrices = () =>
    new Promise(async (fetchResolve, fetchReject) => {
      try {
        const { gasPrices: existingGasPrice } = getState().gas;

        let adjustedGasPrices;
        let source = 'etherscan';
        try {
          // Use etherscan as our Gas Price Oracle
          const {
            data: { result: etherscanGasPrices },
          } = await etherscanGetGasPrices();

          const priceData = {
            average: Number(etherscanGasPrices.ProposeGasPrice),
            fast: Number(etherscanGasPrices.FastGasPrice),
            safeLow: Number(etherscanGasPrices.SafeGasPrice),
          };
          // Add gas estimates
          adjustedGasPrices = await etherscanGetGasEstimates(priceData);
        } catch (e) {
          captureException(new Error('Etherscan gas estimates failed'));
          logger.sentry('Etherscan gas estimates error:', e);
          logger.sentry('falling back to eth gas station');
          source = 'ethGasStation';
          // Fallback to ETHGasStation if Etherscan fails
          const {
            data: ethGasStationPrices,
          } = await ethGasStationGetGasPrices();
          adjustedGasPrices = ethGasStationPrices;
        }

        let gasPrices = parseGasPrices(adjustedGasPrices, source);
        if (gasPrices && existingGasPrice?.[GasSpeedOption.CUSTOM]) {
          // Preserve custom values while updating prices
          gasPrices[GasSpeedOption.CUSTOM] =
            existingGasPrice[GasSpeedOption.CUSTOM];
        }

        if (gasPrices) {
          dispatch({
            payload: gasPrices,
            type: GAS_PRICES_SUCCESS,
          });
          fetchResolve(true);
        } else {
          fetchReject(new Error('Both gas price sources failed'));
        }
      } catch (error) {
        captureException(new Error('all gas estimates failed'));
        logger.sentry('gas estimates error', error);
        fetchReject(error);
      }
    });

  const watchGasPrices = async () => {
    gasPricesHandle && clearTimeout(gasPricesHandle);
    try {
      await getGasPrices();
      // eslint-disable-next-line no-empty
    } catch (e) {
    } finally {
      gasPricesHandle = setTimeout(watchGasPrices, 15000); // 15 secs
    }
  };

  watchGasPrices();
};

export const gasUpdateGasSpeedOption = (newGasSpeedOption: GasSpeedOption) => (
  dispatch: AppDispatch,
  getState: AppGetState
) => {
  const { gasPrices, txFees } = getState().gas;
  if (!gasPrices) return;
  const { assets } = getState().data;
  const results = getSelectedGasPrice(
    assets,
    gasPrices,
    txFees as TxFees,
    newGasSpeedOption
  );

  dispatch({
    payload: {
      ...results,
      gasSpeedOption: newGasSpeedOption,
    },
    type: GAS_UPDATE_GAS_PRICE_OPTION,
  });
  analytics.track('Updated Gas Speed', { gasSpeedOption: newGasSpeedOption });
};

export const gasUpdateCustomValues = (price: string) => async (
  dispatch: AppDispatch,
  getState: AppGetState
) => {
  const { gasPrices, gasLimit } = getState().gas;
  const estimateInMinutes = await getEstimatedTimeForGasPrice(price);
  if (gasPrices) {
    const newGasPrices = { ...gasPrices };
    newGasPrices[GasSpeedOption.CUSTOM] = formatGasPrice(
      GasSpeedOption.CUSTOM,
      estimateInMinutes,
      price
    );
    await dispatch({
      payload: newGasPrices,
      type: GAS_PRICES_SUCCESS,
    });

    dispatch(gasUpdateTxFee(gasLimit));
  }
};

export const gasUpdateDefaultGasLimit = (
  defaultGasLimit = ethUnits.basic_tx
) => (dispatch: AppDispatch) => {
  dispatch({
    payload: defaultGasLimit,
    type: GAS_UPDATE_DEFAULT_GAS_LIMIT,
  });
  dispatch(gasUpdateTxFee(defaultGasLimit));
};

export const gasUpdateTxFee = (
  gasLimit: string | number | null,
  overrideGasOption?: GasSpeedOption
) => (dispatch: AppDispatch, getState: AppGetState) => {
  const { defaultGasLimit, gasPrices, gasSpeedOption } = getState().gas;
  const _gasLimit = gasLimit || defaultGasLimit;
  const _newGasSpeedOption = overrideGasOption || gasSpeedOption;
  if (!gasPrices) return;
  const { assets } = getState().data;
  const { nativeCurrency } = getState().settings;
  const ethPriceUnit = ethereumUtils.getEthPriceUnit();
  const txFees = parseTxFees(
    gasPrices,
    ethPriceUnit,
    _gasLimit,
    nativeCurrency
  );

  const results = getSelectedGasPrice(
    assets,
    gasPrices,
    txFees,
    _newGasSpeedOption
  );

  dispatch({
    payload: {
      ...results,
      gasLimit: _gasLimit,
      txFees,
    },
    type: GAS_UPDATE_TX_FEE,
  });
};

const getSelectedGasPrice = (
  assets: Asset[],
  gasPrices: GasPrices,
  txFees: TxFees,
  gasSpeedOption: GasSpeedOption
) => {
  let txFee = txFees[gasSpeedOption];
  // If no custom price is set we default to FAST
  if (!txFee && gasSpeedOption === GasSpeedOption.CUSTOM) {
    txFee = txFees[GasSpeedOption.FAST];
  }
  const ethAsset = ethereumUtils.getAsset(assets);
  const balanceAmount = ethAsset?.balance?.amount ?? 0;
  const txFeeAmount = fromWei(txFee?.value?.amount ?? 0);
  const isSufficientGas = greaterThanOrEqualTo(balanceAmount, txFeeAmount);
  return {
    isSufficientGas,
    selectedGasPrice: {
      txFee,
      ...gasPrices[gasSpeedOption],
    },
  };
};

export const gasPricesStopPolling = () => () => {
  gasPricesHandle && clearTimeout(gasPricesHandle);
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE: GasState = {
  defaultGasLimit: ethUnits.basic_tx,
  gasLimit: null,
  gasPrices: null,
  gasSpeedOption: GasSpeedOption.NORMAL,
  isSufficientGas: false,
  selectedGasPrice: {},
  txFees: {},
};

export default (state = INITIAL_STATE, action: GasActionTypes) => {
  switch (action.type) {
    case GAS_UPDATE_DEFAULT_GAS_LIMIT:
      return {
        ...state,
        defaultGasLimit: action.payload,
      };
    case GAS_PRICES_SUCCESS:
      return {
        ...state,
        gasPrices: action.payload,
      };
    case GAS_UPDATE_TX_FEE:
      return {
        ...state,
        gasLimit: action.payload.gasLimit,
        isSufficientGas: action.payload.isSufficientGas,
        selectedGasPrice: action.payload.selectedGasPrice,
        txFees: action.payload.txFees,
      };
    case GAS_UPDATE_GAS_PRICE_OPTION:
      return {
        ...state,
        gasSpeedOption: action.payload.gasSpeedOption,
        isSufficientGas: action.payload.isSufficientGas,
        selectedGasPrice: action.payload.selectedGasPrice,
      };
    default:
      return state;
  }
};
