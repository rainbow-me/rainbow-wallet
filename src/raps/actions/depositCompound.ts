import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';
import { captureException } from '@sentry/react-native';
import { get } from 'lodash';
import { Rap, RapActionParameters, SwapActionParameters } from '../common';
import { Asset } from '@rainbow-me/entities';
import { toHex } from '@rainbow-me/handlers/web3';
import ProtocolTypes from '@rainbow-me/helpers/protocolTypes';
import TransactionStatusTypes from '@rainbow-me/helpers/transactionStatusTypes';
import TransactionTypes from '@rainbow-me/helpers/transactionTypes';
import { dataAddNewTransaction } from '@rainbow-me/redux/data';
import store from '@rainbow-me/redux/store';
import {
  compoundCERC20ABI,
  compoundCETHABI,
  ETH_ADDRESS,
  ethUnits,
  savingsAssetsListByUnderlying,
} from '@rainbow-me/references';
import { convertAmountToRawAmount } from '@rainbow-me/utilities';
import { gasUtils } from '@rainbow-me/utils';
import logger from 'logger';

export const getDepositGasLimit = (tokenToDeposit: Asset) =>
  tokenToDeposit.address === ETH_ADDRESS
    ? ethUnits.basic_deposit_eth
    : ethUnits.basic_deposit;

const depositCompound = async (
  wallet: Wallet,
  currentRap: Rap,
  index: number,
  parameters: RapActionParameters,
  baseNonce?: number
): Promise<number | undefined> => {
  logger.log('[deposit] base nonce:', baseNonce, 'index:', index);
  const { dispatch } = store;
  const { inputAmount, outputAmount } = parameters as SwapActionParameters;
  const { inputCurrency, outputCurrency } = store.getState().swap;
  const requiresSwap = !!outputCurrency;

  const amountToDeposit = requiresSwap ? outputAmount : inputAmount;
  const tokenToDeposit = requiresSwap ? outputCurrency : inputCurrency;

  const { accountAddress, network } = store.getState().settings;
  const { gasPrices, selectedGasPrice } = store.getState().gas;
  logger.log('[deposit] amount to deposit', amountToDeposit);
  const rawInputAmount = convertAmountToRawAmount(
    amountToDeposit,
    tokenToDeposit.decimals
  );
  logger.log('[deposit] raw input amount', rawInputAmount);

  let gasPrice = selectedGasPrice?.value?.amount;
  if (!gasPrice) {
    gasPrice = get(gasPrices, `[${gasUtils.FAST}].value.amount`);
  }
  logger.log('[deposit] gas price', gasPrice);

  const cTokenContract =
    savingsAssetsListByUnderlying[network][tokenToDeposit.address]
      .contractAddress;
  logger.log('ctokencontract', cTokenContract);

  const compound = new Contract(
    cTokenContract,
    tokenToDeposit.address === ETH_ADDRESS
      ? compoundCETHABI
      : compoundCERC20ABI,
    wallet
  );

  const transactionParams = {
    gasLimit: getDepositGasLimit(tokenToDeposit),
    gasPrice: toHex(gasPrice) || undefined,
    nonce: baseNonce ? toHex(baseNonce + index) : undefined,
    value: toHex(0),
  };

  let deposit = null;
  try {
    logger.sentry('[deposit] txn params', transactionParams);
    deposit = await compound.mint(rawInputAmount, transactionParams);
    logger.sentry('[deposit] minted - result', deposit);
  } catch (e) {
    logger.sentry('error executing compound.mint');
    captureException(e);
    throw e;
  }
  currentRap.actions[index].transaction.hash = deposit?.hash;

  const newTransaction = {
    amount: amountToDeposit,
    asset: tokenToDeposit,
    from: accountAddress,
    gasLimit: transactionParams.gasLimit,
    gasPrice: transactionParams.gasPrice,
    hash: deposit?.hash,
    nonce: deposit?.nonce,
    protocol: ProtocolTypes.compound.name,
    status: TransactionStatusTypes.depositing,
    to: deposit?.to,
    type: TransactionTypes.deposit,
  };
  logger.log('[deposit] adding new txn', newTransaction);
  // Disable the txn watcher because Compound can silently fail
  await dispatch(dataAddNewTransaction(newTransaction, accountAddress, true));

  logger.log('[deposit] rap complete');
  return deposit?.nonce;
};

export default depositCompound;
