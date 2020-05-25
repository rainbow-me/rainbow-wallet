import { get } from 'lodash';
import React from 'react';
import { Value } from 'react-native-reanimated';
import { StackActions } from 'react-navigation';
import { useNavigation as oldUseNavigation } from 'react-navigation-hooks';
import { useCallback } from 'use-memo-one';
import { setModalVisible } from '../redux/modal';
import store from '../redux/store';
import Routes from '../screens/Routes/routesNames';

let TopLevelNavigationRef = null;
const transitionPosition = new Value(0);
const bottomSheetState = { mounted: true, pendingAction: null };

export function notifyUnmountBottomSheet() {
  bottomSheetState.mounted = false;
  const action = bottomSheetState.pendingAction;
  bottomSheetState.pendingAction = null;
  action();
}

export function notifyMountBottomSheet() {
  bottomSheetState.mounted = true;
}

const poppingCounter = { isClosing: false, pendingAction: null };

export function onWillPop() {
  poppingCounter.isClosing = true;
}

export function onDidPop() {
  poppingCounter.isClosing = false;
  if (poppingCounter.pendingAction) {
    setImmediate(() => {
      poppingCounter.pendingAction();
      poppingCounter.pendingAction = null;
    });
  }
}

export function useNavigation() {
  const { navigate: oldNavigate, ...rest } = oldUseNavigation();
  const enhancedNavigate = useCallback(
    (...args) => navigate(oldNavigate, ...args),
    [oldNavigate]
  );
  return {
    navigate: enhancedNavigate,
    ...rest,
  };
}

export function withNavigation(Component) {
  return function WithNavigationWrapper(props) {
    const navigation = useNavigation();
    return <Component {...props} navigation={navigation} />;
  };
}

/**
 * With this wrapper we allow to delay pushing of native
 * screen with delay when there's a closing transaction in progress
 * Also, we take care to hide discover sheet if needed
 */
export function navigate(oldNavigate, ...args) {
  if (
    typeof args[0] === 'string' &&
    (args[0] === Routes.SETTINGS_MODAL ||
      args[0] === Routes.RECEIVE_MODAL ||
      args[0] === Routes.EXPANDED_ASSET_SHEET ||
      args[0] === Routes.ADD_CASH_SHEET ||
      args[0] === Routes.SEND_SHEET)
  ) {
    store.dispatch(setModalVisible(false));
    if (bottomSheetState.mounted) {
      bottomSheetState.pendingAction = () => navigate(oldNavigate, ...args);
      return;
    }
  }
  if (typeof args[0] === 'string' && poppingCounter.isClosing) {
    poppingCounter.pendingAction = () => oldNavigate(...args);
  } else {
    oldNavigate(...args);
  }
}

function getActiveRoute(navigationState) {
  navigationState = navigationState || get(TopLevelNavigationRef, 'state.nav');
  if (!navigationState) return null;

  const route = navigationState.routes[navigationState.index];
  // recursively dive into nested navigators
  if (route.routes) {
    return getActiveRoute(route);
  }
  return route;
}

/**
 * Gets the current screen from navigation state
 */
function getActiveRouteName(navigationState) {
  const route = getActiveRoute(navigationState);
  return get(route, 'routeName');
}

/**
 * Handle a navigation action or queue the action if navigation actions have been paused.
 * @param  {Object} action      The navigation action to run.
 */
function handleAction(action) {
  if (!TopLevelNavigationRef) return;

  action = StackActions.push(action);
  TopLevelNavigationRef.dispatch(action);
}

/**
 * Set Top Level Navigator
 */
function setTopLevelNavigator(navigatorRef) {
  TopLevelNavigationRef = navigatorRef;
}

export default {
  getActiveRoute,
  getActiveRouteName,
  handleAction,
  setTopLevelNavigator,
  transitionPosition,
};
