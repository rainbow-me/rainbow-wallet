import { groupBy, mapValues, values } from 'lodash';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { sortList } from '../helpers/sortList';
import {
  walletConnectDisconnectAllByDappName as rawWalletConnectDisconnectAllByDappName,
  walletConnectOnSessionRequest as rawWalletConnectOnSessionRequest,
  walletConnectUpdateSessionConnectorAccountByDappName as rawWalletConnectUpdateSessionConnectorAccountByDappName,
  walletConnectUpdateSessionConnectorChainIdByDappName as rawWalletConnectUpdateSessionConnectorChainIdByDappName,
} from '../redux/walletconnect';

const formatDappData = connections =>
  values(
    mapValues(connections, connection => ({
      account: connection?.[0].accounts?.[0],
      chainId: connection?.[0].chainId,
      dappIcon: connection?.[0].peerMeta.icons[0],
      dappName: connection?.[0].peerMeta.name,
      dappUrl: connection?.[0].peerMeta.url,
    }))
  );

const walletConnectSelector = createSelector(
  state => state.walletconnect.walletConnectors,
  walletConnectors => {
    const sorted = sortList(values(walletConnectors), 'peerMeta.name');
    const groupedByDappName = groupBy(sorted, 'peerMeta.url');
    return {
      sortedWalletConnectors: sorted,
      walletConnectorsByDappName: formatDappData(groupedByDappName),
      walletConnectorsCount: sorted.length,
    };
  }
);

export default function useWalletConnectConnections() {
  const dispatch = useDispatch();
  const {
    sortedWalletConnectors,
    walletConnectorsByDappName,
    walletConnectorsCount,
  } = useSelector(walletConnectSelector);

  const walletConnectDisconnectAllByDappName = useCallback(
    dappName => dispatch(rawWalletConnectDisconnectAllByDappName(dappName)),
    [dispatch]
  );

  const walletConnectOnSessionRequest = useCallback(
    (uri, callback) =>
      dispatch(rawWalletConnectOnSessionRequest(uri, callback)),
    [dispatch]
  );

  const walletConnectUpdateSessionConnectorChainIdByDappName = useCallback(
    (dappName, chainId) =>
      dispatch(
        rawWalletConnectUpdateSessionConnectorChainIdByDappName(
          dappName,
          chainId
        )
      ),
    [dispatch]
  );

  const walletConnectUpdateSessionConnectorAccountByDappName = useCallback(
    (dappName, accountAddress) =>
      dispatch(
        rawWalletConnectUpdateSessionConnectorAccountByDappName(
          dappName,
          accountAddress
        )
      ),
    [dispatch]
  );

  return {
    sortedWalletConnectors,
    walletConnectDisconnectAllByDappName,
    walletConnectOnSessionRequest,
    walletConnectorsByDappName,
    walletConnectorsCount,
    walletConnectUpdateSessionConnectorAccountByDappName,
    walletConnectUpdateSessionConnectorChainIdByDappName,
  };
}
