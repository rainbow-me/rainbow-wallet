import { Wallet } from '@ethersproject/wallet';
import { captureException } from '@sentry/react-native';
import { Token } from '@uniswap/sdk';
import { get } from 'lodash';
import { Rap, RapActionParameters, SwapActionParameters } from '../common';
import { depositToPool } from '@rainbow-me/handlers/uniswapLiquidity';
import { toHex } from '@rainbow-me/handlers/web3';
import ProtocolTypes from '@rainbow-me/helpers/protocolTypes';
import TransactionStatusTypes from '@rainbow-me/helpers/transactionStatusTypes';
import TransactionTypes from '@rainbow-me/helpers/transactionTypes';
import { dataAddNewTransaction } from '@rainbow-me/redux/data';
import store from '@rainbow-me/redux/store';
import { ethUnits } from '@rainbow-me/references';
import { convertAmountToRawAmount } from '@rainbow-me/utilities';
import { gasUtils } from '@rainbow-me/utils';
import logger from 'logger';

const actionName = '[deposit uniswap]';

// TODO JIN - fix this
export const getDepositUniswapGasLimit = () => ethUnits.basic_deposit_uniswap;

const depositUniswap = async (
  wallet: Wallet,
  currentRap: Rap,
  index: number,
  parameters: RapActionParameters,
  baseNonce?: number
): Promise<number | undefined> => {
  logger.log(`${actionName}`);
  logger.log(`${actionName} base nonce`, baseNonce, 'index:', index);
  const { inputAmount } = parameters as SwapActionParameters;
  const { dispatch } = store;
  const { inputCurrency, outputCurrency } = store.getState().swap;
  // TODO JIN
  const depositToken = inputCurrency;
  const { accountAddress, chainId, network } = store.getState().settings;
  const { gasPrices, selectedGasPrice } = store.getState().gas;

  logger.log(`${actionName}`, inputAmount);
  const rawInputAmount = convertAmountToRawAmount(
    inputAmount,
    inputCurrency.decimals
  );
  logger.log(`${actionName} raw input amount`, rawInputAmount);

  logger.log(`${actionName} execute the deposit`);
  let gasPrice = get(selectedGasPrice, 'value.amount');
  if (!gasPrice) {
    gasPrice = get(gasPrices, `[${gasUtils.FAST}].value.amount`);
  }
  logger.log(`${actionName} gas price`, gasPrice);

  const transactionParams = {
    gasLimit: getDepositUniswapGasLimit(),
    gasPrice: toHex(gasPrice),
    nonce: baseNonce ? toHex(baseNonce + index) : undefined,
  };

  let deposit = null;
  try {
    logger.sentry(`${actionName} txn params`, transactionParams);
    deposit = await depositToPool(
      depositToken, // TODO JIN
      new Token(chainId, inputCurrency.address, inputCurrency.decimals),
      new Token(chainId, outputCurrency.address, outputCurrency.decimals),
      chainId,
      rawInputAmount,
      network,
      transactionParams
    );
    // TODO JIN - how to get the txn itself, not the result?
    logger.sentry(`${actionName} response`, deposit);
  } catch (e) {
    logger.sentry('error executing deposit to Uniswap LP');
    captureException(e);
    throw e;
  }

  const newTransaction = {
    amount: inputAmount,
    asset: inputCurrency,
    from: accountAddress,
    gasLimit: transactionParams.gasLimit,
    gasPrice: transactionParams.gasPrice,
    hash: deposit?.hash,
    nonce: deposit?.nonce,
    protocol: ProtocolTypes.uniswap.name, // TODO JIN - should uniswap deposits be separate?
    status: TransactionStatusTypes.depositing, // TODO JIN - different deposit for Uniswap
    to: deposit?.to,
    type: TransactionTypes.deposit, // TODO JIN - different type
  };
  logger.log(`${actionName} adding new txn`, newTransaction);
  await dispatch(dataAddNewTransaction(newTransaction, accountAddress));

  return deposit?.nonce;
};

export default depositUniswap;
