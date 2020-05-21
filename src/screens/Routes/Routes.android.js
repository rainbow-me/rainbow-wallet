import { omit } from 'lodash';
import React from 'react';
import ViewPagerAdapter from 'react-native-tab-view-viewpager-adapter';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { ExchangeModalNavigator, SavingModalNavigator } from '../../navigation';
import {
  backgroundPreset,
  emojiPreset,
  expandedPreset,
  overlayExpandedPreset,
  savingsPreset,
  sheetPreset,
} from '../../navigation/transitions/effects';
import { deviceUtils } from '../../utils';
import AddCashSheet from '../AddCashSheet';
import AvatarBuilder from '../AvatarBuilder';
import ChangeWalletModal from '../ChangeWalletModal';
import ExampleScreen from '../ExampleScreen';
import ExpandedAssetSheet from '../ExpandedAssetSheet';
import ImportSeedPhraseSheetWithData from '../ImportSeedPhraseSheetWithData';
import ModalScreen from '../ModalScreen';
import ProfileScreen from '../ProfileScreen';
import QRScannerScreenWithData from '../QRScannerScreenWithData';
import ReceiveModal from '../ReceiveModal';
import SavingsSheet from '../SavingsSheet';
import SendSheet from '../SendSheet';
import SettingsModal from '../SettingsModal';
import TransactionConfirmationScreen from '../TransactionConfirmationScreen';
import WalletConnectConfirmationModal from '../WalletConnectConfirmationModal';
import WalletScreen from '../WalletScreen';
import WithdrawModal from '../WithdrawModal';
import {
  createStackNavigator,
  exchangePresetWithTransitions,
  expandedPresetWithTransitions,
  expandedReversePresetWithTransitions,
  onTransitionStart,
  sheetPresetWithTransitions,
} from './helpers';
import { onNavigationStateChange } from './onNavigationStateChange';
import Routes from './routesNames';

const routesForSwipeStack = {
  [Routes.PROFILE_SCREEN]: ProfileScreen,
  [Routes.WALLET_SCREEN]: WalletScreen,
  [Routes.QR_SCANNER_SCREEN]: QRScannerScreenWithData,
};

const SwipeStack = createMaterialTopTabNavigator(routesForSwipeStack, {
  headerMode: 'none',
  initialLayout: deviceUtils.dimensions,
  initialRouteName: Routes.WALLET_SCREEN,
  pagerComponent: ViewPagerAdapter,
  swipeEnabled: true,
  tabBarComponent: null,
});

const routesForMainNavigator = {
  [Routes.AVATAR_BUILDER]: {
    navigationOptions: emojiPreset,
    screen: AvatarBuilder,
    transparentCard: true,
  },
  [Routes.CHANGE_WALLET_MODAL]: {
    navigationOptions: expandedReversePresetWithTransitions,
    screen: ChangeWalletModal,
  },
  [Routes.CONFIRM_REQUEST]: {
    navigationOptions: sheetPresetWithTransitions,
    screen: TransactionConfirmationScreen,
  },
  [Routes.EXAMPLE_SCREEN]: ExampleScreen,
  [Routes.EXCHANGE_MODAL]: {
    navigationOptions: exchangePresetWithTransitions,
    params: {
      isGestureBlocked: false,
    },
    screen: ExchangeModalNavigator,
  },
  [Routes.EXPANDED_ASSET_SHEET]: {
    navigationOptions: expandedPreset,
    screen: ExpandedAssetSheet,
  },
  [Routes.MODAL_SCREEN]: {
    navigationOptions: overlayExpandedPreset,
    screen: ModalScreen,
  },
  [Routes.RECEIVE_MODAL]: {
    navigationOptions: expandedPresetWithTransitions,
    screen: ReceiveModal,
  },
  [Routes.SAVINGS_SHEET]: {
    navigationOptions: savingsPreset,
    screen: SavingsSheet,
  },
  [Routes.SETTINGS_MODAL]: {
    navigationOptions: expandedPresetWithTransitions,
    screen: SettingsModal,
    transparentCard: true,
  },
  SwipeLayout: {
    navigationOptions: backgroundPreset,
    screen: SwipeStack,
  },
  WalletConnectConfirmationModal: {
    navigationOptions: expandedPresetWithTransitions,
    screen: WalletConnectConfirmationModal,
  },
};

const MainNavigator = createStackNavigator(routesForMainNavigator);

const routesForStack = {
  AddCashSheet: {
    navigationOptions: {
      ...sheetPreset,
      onTransitionStart: props => {
        onTransitionStart(props);
        sheetPreset.onTransitionStart(props);
      },
    },
    screen: AddCashSheet,
  },
  ImportSeedPhraseSheet: {
    navigationOptions: {
      ...sheetPreset,
      onTransitionStart: props => {
        sheetPreset.onTransitionStart(props);
        onTransitionStart();
      },
    },
    screen: ImportSeedPhraseSheetWithData,
  },
  MainNavigator,
  SavingsDepositModal: {
    navigationOptions: exchangePresetWithTransitions,
    params: {
      isGestureBlocked: false,
    },
    screen: SavingModalNavigator,
  },
  SavingsWithdrawModal: {
    navigationOptions: exchangePresetWithTransitions,
    params: {
      isGestureBlocked: false,
    },
    screen: WithdrawModal,
  },
  SendSheet: {
    navigationOptions: {
      ...omit(sheetPreset, 'gestureResponseDistance'),
      onTransitionStart: props => {
        onTransitionStart(props);
        sheetPreset.onTransitionStart(props);
      },
    },
    screen: SendSheet,
  },
};
const Stack = createStackNavigator(routesForStack, {
  initialRouteName: 'MainNavigator',
});

const AppContainer = createAppContainer(Stack);

// eslint-disable-next-line react/display-name
const AppContainerWithAnalytics = React.forwardRef((props, ref) => (
  <AppContainer onNavigationStateChange={onNavigationStateChange} ref={ref} />
));

export default React.memo(AppContainerWithAnalytics);
