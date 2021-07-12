import analytics from '@segment/analytics-react-native';
import React, { useCallback, useMemo } from 'react';
import { RequestVendorLogoIcon } from '../coin-icon';
import { ContextMenuButton } from '../context-menu';
import { Icon } from '../icons';
import { Centered, ColumnWithMargins, Row } from '../layout';
import { Text, TruncatedText } from '../text';
import {
  dappLogoOverride,
  dappNameOverride,
  isDappAuthenticated,
} from '@rainbow-me/helpers/dappNameHandler';
import { useWalletConnectConnections } from '@rainbow-me/hooks';
import { Navigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';
import { padding } from '@rainbow-me/styles';
import { ethereumUtils } from '@rainbow-me/utils';
import { changeConnectionMenuItems, NETWORK_MENU_ACTION_KEY_FILTER } from '@rainbow-me/helpers/walletConnectNetworks';

const ContainerPadding = 15;
const VendorLogoIconSize = 50;
export const WalletConnectListItemHeight =
  VendorLogoIconSize + ContainerPadding * 2;

const ContextButton = props => (
  <Centered css={padding(16, 19)} {...props}>
    <Icon name="threeDots" />
  </Centered>
);

export default function WalletConnectListItem({
  account,
  accountsLabels,
  chainId,
  dappIcon,
  dappName,
  dappUrl,
}) {
  const {
    walletConnectDisconnectAllByDappName,
    walletConnectUpdateSessionConnectorAccountByDappName,
    walletConnectUpdateSessionConnectorChainIdByDappName,
  } = useWalletConnectConnections();
  const { colors, isDarkMode } = useTheme();

  const isAuthenticated = useMemo(() => {
    return isDappAuthenticated(dappUrl);
  }, [dappUrl]);

  const overrideLogo = useMemo(() => {
    return dappLogoOverride(dappUrl);
  }, [dappUrl]);

  const overrideName = useMemo(() => {
    return dappNameOverride(dappUrl);
  }, [dappUrl]);

  const handlePressChangeWallet = useCallback(() => {
    Navigation.handleAction(Routes.CHANGE_WALLET_SHEET, {
      currentAccountAddress: account,
      onChangeWallet: address => {
        walletConnectUpdateSessionConnectorAccountByDappName(dappName, address);
      },
      watchOnly: true,
    });
  }, [account, dappName, walletConnectUpdateSessionConnectorAccountByDappName]);

  const handleOnPressMenuItem = useCallback(
    ({ nativeEvent: { actionKey } }) => {
      if (actionKey === 'disconnect') {
        walletConnectDisconnectAllByDappName(dappName);
        analytics.track('Manually disconnected from WalletConnect connection', {
          dappName,
          dappUrl,
        });
      } else if (actionKey === 'switch-account') {
        handlePressChangeWallet();
      } else if (actionKey.indexOf(NETWORK_MENU_ACTION_KEY_FILTER) !== -1) {
        const networkValue = actionKey.replace(NETWORK_MENU_ACTION_KEY_FILTER, '');
        const chainId = ethereumUtils.getChainIdFromNetwork(networkValue);
        walletConnectUpdateSessionConnectorChainIdByDappName(dappName, chainId);
      }
    },
    [
      dappName,
      dappUrl,
      handlePressChangeWallet,
      walletConnectDisconnectAllByDappName,
      walletConnectUpdateSessionConnectorChainIdByDappName,
    ]
  );

  return (
    <ContextMenuButton
      menuItems={changeConnectionMenuItems(isDarkMode)}
      menuTitle={`Change ${dappName} connection?`}
      onPressMenuItem={handleOnPressMenuItem}
    >
      <Row align="center" height={WalletConnectListItemHeight}>
        <Row
          align="center"
          css={padding(ContainerPadding, 0, ContainerPadding, ContainerPadding)}
          flex={1}
        >
          <RequestVendorLogoIcon
            backgroundColor={colors.white}
            dappName={dappName}
            imageUrl={overrideLogo || dappIcon}
            size={VendorLogoIconSize}
          />
          <ColumnWithMargins css={padding(0, 19, 1.5, 12)} flex={1} margin={2}>
            <Row>
              <TruncatedText
                letterSpacing="roundedTight"
                size="lmedium"
                weight="bold"
              >
                {overrideName || dappName || 'Unknown Application'}{' '}
              </TruncatedText>
              {isAuthenticated && (
                <Text
                  align="center"
                  color={colors.appleBlue}
                  letterSpacing="roundedMedium"
                  size="lmedium"
                  weight="bold"
                >
                  􀇻
                </Text>
              )}
            </Row>

            <TruncatedText
              color={colors.alpha(colors.blueGreyDark, 0.6)}
              size="smedium"
              weight="medium"
            >
              {accountsLabels[account]} -{' '}
              {ethereumUtils.getNetworkNameFromChainId(chainId)}
            </TruncatedText>
          </ColumnWithMargins>
        </Row>
      </Row>
    </ContextMenuButton>
  );
}
