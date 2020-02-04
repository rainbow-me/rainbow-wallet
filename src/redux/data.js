import { concat, get, includes, isNil, map, remove, uniqBy } from 'lodash';
import {
  getAssets,
  getCompoundAssets,
  getLocalTransactions,
  removeAssets,
  removeCompoundAssets,
  removeLocalTransactions,
  saveAssets,
  saveCompoundAssets,
  saveLocalTransactions,
} from '../handlers/localstorage/accountLocal';
import { apiGetTokenOverrides } from '../handlers/tokenOverrides';
import { parseAccountAssets, parseAsset } from '../parsers/accounts';
import { parseCompoundDeposits } from '../parsers/compound';
import { parseNewTransaction } from '../parsers/newTransaction';
import parseTransactions from '../parsers/transactions';
import { loweredTokenOverridesFallback } from '../references';
import { isLowerCaseMatch } from '../utils';
import TransactionStatusTypes from '../helpers/transactionStatusTypes';
import { sendRpcCall } from '../handlers/web3';
import {
  uniswapRemovePendingApproval,
  uniswapUpdateAssetPrice,
  uniswapUpdateAssets,
  uniswapUpdateLiquidityTokens,
} from './uniswap';

let watchPendingTransactionsHandler = null;

// -- Constants --------------------------------------- //

const DATA_UPDATE_ASSETS = 'data/DATA_UPDATE_ASSETS';
const DATA_UPDATE_COMPOUND_ASSETS = 'data/DATA_UPDATE_COMPOUND_ASSETS';
const DATA_UPDATE_TRANSACTIONS = 'data/DATA_UPDATE_TRANSACTIONS';
const DATA_UPDATE_TOKEN_OVERRIDES = 'data/DATA_UPDATE_TOKEN_OVERRIDES';

const DATA_LOAD_ASSETS_REQUEST = 'data/DATA_LOAD_ASSETS_REQUEST';
const DATA_LOAD_ASSETS_SUCCESS = 'data/DATA_LOAD_ASSETS_SUCCESS';
const DATA_LOAD_ASSETS_FAILURE = 'data/DATA_LOAD_ASSETS_FAILURE';

const DATA_LOAD_COMPOUND_ASSETS_SUCCESS =
  'data/DATA_LOAD_COMPOUND_ASSETS_SUCCESS';

const DATA_LOAD_TRANSACTIONS_REQUEST = 'data/DATA_LOAD_TRANSACTIONS_REQUEST';
const DATA_LOAD_TRANSACTIONS_SUCCESS = 'data/DATA_LOAD_TRANSACTIONS_SUCCESS';
const DATA_LOAD_TRANSACTIONS_FAILURE = 'data/DATA_LOAD_TRANSACTIONS_FAILURE';

const DATA_ADD_NEW_TRANSACTION_SUCCESS =
  'data/DATA_ADD_NEW_TRANSACTION_SUCCESS';

const DATA_CLEAR_STATE = 'data/DATA_CLEAR_STATE';

// -- Actions ---------------------------------------- //
export const dataLoadState = () => async (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  try {
    dispatch({ type: DATA_LOAD_ASSETS_REQUEST });
    const assets = await getAssets(accountAddress, network);
    dispatch({
      payload: assets,
      type: DATA_LOAD_ASSETS_SUCCESS,
    });
  } catch (error) {
    dispatch({ type: DATA_LOAD_ASSETS_FAILURE });
  }
  try {
    const compoundAssets = await getCompoundAssets(accountAddress, network);
    dispatch({
      payload: compoundAssets,
      type: DATA_LOAD_COMPOUND_ASSETS_SUCCESS,
    });
    // eslint-disable-next-line no-empty
  } catch (error) {}
  try {
    dispatch({ type: DATA_LOAD_TRANSACTIONS_REQUEST });
    const transactions = await getLocalTransactions(accountAddress, network);
    dispatch({
      payload: transactions,
      type: DATA_LOAD_TRANSACTIONS_SUCCESS,
    });
  } catch (error) {
    dispatch({ type: DATA_LOAD_TRANSACTIONS_FAILURE });
  }
};

export const dataTokenOverridesInit = () => async dispatch => {
  try {
    const tokenOverrides = await apiGetTokenOverrides();
    dispatch(dataUpdateTokenOverrides(tokenOverrides));
    // eslint-disable-next-line no-empty
  } catch (error) {}
};

export const dataClearState = () => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  removeAssets(accountAddress, network);
  removeCompoundAssets(accountAddress, network);
  removeLocalTransactions(accountAddress, network);
  dispatch({ type: DATA_CLEAR_STATE });
};

export const dataUpdateAssets = assets => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  if (assets.length) {
    saveAssets(assets, accountAddress, network);
    dispatch({
      payload: assets,
      type: DATA_UPDATE_ASSETS,
    });
  }
};

const checkMeta = message => (dispatch, getState) => {
  const { accountAddress, nativeCurrency } = getState().settings;
  const address = get(message, 'meta.address');
  const currency = get(message, 'meta.currency');
  return (
    isLowerCaseMatch(address, accountAddress) &&
    isLowerCaseMatch(currency, nativeCurrency)
  );
};

export const transactionsReceived = (message, appended = false) => (
  dispatch,
  getState
) => {
  const isValidMeta = dispatch(checkMeta(message));
  if (!isValidMeta) return;
  const transactionData = get(message, 'payload.transactions', []);
  if (!transactionData.length) return;
  const { accountAddress, nativeCurrency, network } = getState().settings;
  const { transactions, tokenOverrides } = getState().data;
  if (!transactionData.length) return;
  const { approvalTransactions, dedupedResults } = parseTransactions(
    transactionData,
    accountAddress,
    nativeCurrency,
    transactions,
    tokenOverrides,
    appended
  );
  dispatch(uniswapRemovePendingApproval(approvalTransactions));
  saveLocalTransactions(dedupedResults, accountAddress, network);
  dispatch({
    payload: dedupedResults,
    type: DATA_UPDATE_TRANSACTIONS,
  });
};

export const transactionsRemoved = message => (dispatch, getState) => {
  const isValidMeta = dispatch(checkMeta(message));
  if (!isValidMeta) return;

  const transactionData = get(message, 'payload.transactions', []);
  if (!transactionData.length) return;
  const { accountAddress, network } = getState().settings;
  const { transactions } = getState().data;
  const removeHashes = map(transactionData, txn => txn.hash);
  remove(transactions, txn => includes(removeHashes, txn.hash));

  saveLocalTransactions(transactions, accountAddress, network);
  dispatch({
    payload: transactions,
    type: DATA_UPDATE_TRANSACTIONS,
  });
};

export const addressAssetsReceived = (
  message,
  append = false,
  change = false
) => (dispatch, getState) => {
  const isValidMeta = dispatch(checkMeta(message));
  if (!isValidMeta) return;

  const { tokenOverrides } = getState().data;
  const { accountAddress, network } = getState().settings;
  const { uniqueTokens } = getState().uniqueTokens;
  const assets = get(message, 'payload.assets', []);
  const liquidityTokens = remove(assets, asset => {
    const symbol = get(asset, 'asset.symbol', '');
    return symbol === 'UNI' || symbol === 'uni-v1';
  });
  dispatch(uniswapUpdateLiquidityTokens(liquidityTokens, append || change));
  let parsedAssets = parseAccountAssets(assets, uniqueTokens, tokenOverrides);
  if (append || change) {
    const { assets: existingAssets } = getState().data;
    parsedAssets = uniqBy(
      concat(parsedAssets, existingAssets),
      item => item.uniqueId
    );
  }
  parsedAssets = parsedAssets.filter(
    asset => !!Number(get(asset, 'balance.amount'))
  );
  saveAssets(parsedAssets, accountAddress, network);
  dispatch({
    payload: parsedAssets,
    type: DATA_UPDATE_ASSETS,
  });
};

export const compoundInfoReceived = message => (dispatch, getState) => {
  const isValidMeta = dispatch(checkMeta(message));
  if (!isValidMeta) return;
  const { tokenOverrides } = getState().data;
  const { accountAddress, network } = getState().settings;
  const deposits = get(message, 'payload.info.deposits', []);
  const parsedDeposits = parseCompoundDeposits(deposits, tokenOverrides);
  dispatch({
    payload: parsedDeposits,
    type: DATA_UPDATE_COMPOUND_ASSETS,
  });
  saveCompoundAssets(parsedDeposits, accountAddress, network);
};

export const dataUpdateTokenOverrides = tokenOverrides => dispatch =>
  dispatch({
    payload: tokenOverrides,
    type: DATA_UPDATE_TOKEN_OVERRIDES,
  });

export const assetsReceived = message => (dispatch, getState) => {
  const { tokenOverrides } = getState().data;
  const assets = get(message, 'payload.assets', []);
  if (!assets.length) return;
  const parsedAssets = map(assets, asset => parseAsset(asset, tokenOverrides));
  dispatch(uniswapUpdateAssets(parsedAssets));
};

export const priceChanged = message => dispatch => {
  const address = get(message, 'meta.asset_code');
  const price = get(message, 'payload.price');
  if (isNil(price)) return;
  dispatch(uniswapUpdateAssetPrice(address, price));
};

export const dataAddNewTransaction = txDetails => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    const { transactions } = getState().data;
    const { accountAddress, nativeCurrency, network } = getState().settings;
    parseNewTransaction(txDetails, nativeCurrency)
      .then(parsedTransaction => {
        const _transactions = [parsedTransaction, ...transactions];
        saveLocalTransactions(_transactions, accountAddress, network);
        dispatch({
          payload: _transactions,
          type: DATA_ADD_NEW_TRANSACTION_SUCCESS,
        });

        dispatch(startPendingTransactionWatcher());

        resolve(true);
      })
      .catch(error => {
        reject(error);
      });
  });

export const dataWatchPendingTransactions = () => async (
  dispatch,
  getState
) => {
  const { transactions } = getState().data;
  if (!transactions.length) return false;
  const updatedTransactions = [...transactions];
  let txStatusesDidChange = false;

  await Promise.all(
    transactions.map(async (tx, index) => {
      if (tx.pending) {
        const txHash = tx.hash.split('-').shift();
        const payload = {
          method: 'eth_getTransactionByHash',
          params: [txHash],
        };
        const txObj = await sendRpcCall(payload);
        if (txObj && txObj.blockNumber) {
          txStatusesDidChange = true;
          updatedTransactions[index].status = TransactionStatusTypes.sent;
          updatedTransactions[index].pending = false;
        }
      }
    })
  );

  if (txStatusesDidChange) {
    const { accountAddress, network } = getState().settings;
    saveLocalTransactions(updatedTransactions, accountAddress, network);

    dispatch({
      payload: updatedTransactions,
      type: DATA_UPDATE_TRANSACTIONS,
    });

    const pendingTx = updatedTransactions.find(tx => tx.pending);
    if (!pendingTx) {
      return true;
    }
  }

  return false;
};

const startPendingTransactionWatcher = () => async dispatch => {
  watchPendingTransactionsHandler &&
    clearTimeout(watchPendingTransactionsHandler);

  const done = await dispatch(dataWatchPendingTransactions());

  if (!done) {
    watchPendingTransactionsHandler = setTimeout(() => {
      dispatch(startPendingTransactionWatcher());
    }, 1000);
  }
};

// -- Reducer ----------------------------------------- //
const INITIAL_STATE = {
  assets: [],
  compoundAssets: [],
  loadingAssets: false,
  loadingTransactions: false,
  tokenOverrides: loweredTokenOverridesFallback,
  transactions: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case DATA_UPDATE_ASSETS:
      return { ...state, assets: action.payload };
    case DATA_UPDATE_COMPOUND_ASSETS:
      return { ...state, compoundAssets: action.payload };
    case DATA_UPDATE_TOKEN_OVERRIDES:
      return { ...state, tokenOverrides: action.payload };
    case DATA_UPDATE_TRANSACTIONS:
      return { ...state, transactions: action.payload };
    case DATA_LOAD_TRANSACTIONS_REQUEST:
      return {
        ...state,
        loadingTransactions: true,
      };
    case DATA_LOAD_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        loadingTransactions: false,
        transactions: action.payload,
      };
    case DATA_LOAD_TRANSACTIONS_FAILURE:
      return {
        ...state,
        loadingTransactions: false,
      };
    case DATA_LOAD_ASSETS_REQUEST:
      return {
        ...state,
        loadingAssets: true,
      };
    case DATA_LOAD_ASSETS_SUCCESS:
      return {
        ...state,
        assets: action.payload,
        loadingAssets: false,
      };
    case DATA_LOAD_COMPOUND_ASSETS_SUCCESS:
      return {
        ...state,
        compoundAssets: action.payload,
      };
    case DATA_LOAD_ASSETS_FAILURE:
      return {
        ...state,
        loadingAssets: false,
      };
    case DATA_ADD_NEW_TRANSACTION_SUCCESS:
      return {
        ...state,
        transactions: action.payload,
      };
    case DATA_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_STATE,
      };
    default:
      return state;
  }
};
