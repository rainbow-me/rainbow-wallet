import { captureException } from '@sentry/react-native';
import { useCallback } from 'react';
import { InteractionManager } from 'react-native';
import { explorerInit } from '../redux/explorer';
import { savingsLoadState } from '../redux/savings';
import { uniqueTokensRefreshState } from '../redux/uniqueTokens';
import { uniswapGetAllExchanges, uniswapPairsInit } from '../redux/uniswap';
import { useDispatch } from '@rainbow-me/react-redux';
import logger from 'logger';

export default function useInitializeAccountData() {
  const dispatch = useDispatch();

  const initializeAccountData = useCallback(async () => {
    try {
      InteractionManager.runAfterInteractions(() => {
        logger.sentry('Initialize account data');
        dispatch(explorerInit());
      });

      InteractionManager.runAfterInteractions(async () => {
        logger.sentry('Initialize uniswapPairsInit & getAllExchanges');
        dispatch(uniswapPairsInit());
        await dispatch(uniswapGetAllExchanges());
      });

      InteractionManager.runAfterInteractions(async () => {
        logger.sentry('Initialize savingsLoadState & uniqueTokens');
        await dispatch(savingsLoadState());
        await dispatch(uniqueTokensRefreshState());
      });
    } catch (error) {
      logger.sentry('Error initializing account data');
      captureException(error);
    }
  }, [dispatch]);

  return initializeAccountData;
}
