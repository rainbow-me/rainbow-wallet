import analytics from '@segment/analytics-react-native';
import { get } from 'lodash';
import { StatusBar } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Navigation } from '../../navigation';
import { sentryUtils } from '../../utils';
import { ROUTES } from './routesNames';

export function onNavigationStateChange(prevState, currentState) {
  const { params, routeName } = Navigation.getActiveRoute(currentState);
  const prevRouteName = Navigation.getActiveRouteName(prevState);
  // native stack rn does not support onTransitionEnd and onTransitionStart
  // Set focus manually on route changes
  if (prevRouteName !== routeName) {
    Navigation.handleAction(
      NavigationActions.setParams({
        key: routeName,
        params: { focused: true },
      })
    );

    Navigation.handleAction(
      NavigationActions.setParams({
        key: prevRouteName,
        params: { focused: false },
      })
    );
  }

  if (
    prevRouteName !== ROUTES.QR_SCANNER_SCREEN &&
    routeName === ROUTES.QR_SCANNER_SCREEN
  ) {
    StatusBar.setBarStyle('light-content');
  }

  if (
    prevRouteName === ROUTES.QR_SCANNER_SCREEN &&
    routeName !== ROUTES.QR_SCANNER_SCREEN
  ) {
    StatusBar.setBarStyle('dark-content');
  }

  if (
    prevRouteName === ROUTES.IMPORT_SEED_PHRASE_SHEET &&
    (routeName === ROUTES.PROFILE_SCREEN || routeName === ROUTES.WALLET_SCREEN)
  ) {
    StatusBar.setBarStyle('dark-content');
  }

  if (
    prevRouteName === ROUTES.WALLET_SCREEN &&
    routeName === ROUTES.SEND_SHEET
  ) {
    StatusBar.setBarStyle('light-content');
  }

  if (
    prevRouteName === ROUTES.SEND_SHEET &&
    routeName === ROUTES.WALLET_SCREEN
  ) {
    StatusBar.setBarStyle('dark-content');
  }

  if (routeName === 'SettingsModal') {
    let subRoute = get(params, 'section.title');
    if (subRoute === 'Settings') subRoute = null;
    return analytics.screen(`${routeName}${subRoute ? `>${subRoute}` : ''}`);
  }

  if (routeName !== prevRouteName) {
    let paramsToTrack = {};

    if (routeName === ROUTES.EXPANDED_ASSET_SCREEN) {
      const { asset, type } = params;
      paramsToTrack = {
        assetContractAddress:
          asset.address || get(asset, 'asset_contract.address'),
        assetName: asset.name,
        assetSymbol: asset.symbol || get(asset, 'asset_contract.symbol'),
        assetType: type,
      };
    }

    sentryUtils.addNavBreadcrumb(prevRouteName, routeName, paramsToTrack);
    return analytics.screen(routeName, paramsToTrack);
  }
}
