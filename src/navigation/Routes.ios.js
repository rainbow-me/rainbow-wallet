import { omit } from 'lodash';
import React from 'react';
import { StatusBar } from 'react-native';
import createNativeStackNavigator from 'react-native-cool-modals/createNativeStackNavigator';
import { ScrollPager } from 'react-native-tab-view';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import isNativeStackAvailable from '../helpers/isNativeStackAvailable';
import AddCashSheet from '../screens/AddCashSheet';
import AvatarBuilder from '../screens/AvatarBuilder';
import ChangeWalletModal from '../screens/ChangeWalletModal';
import ExampleScreen from '../screens/ExampleScreen';
import ExpandedAssetScreenWithData from '../screens/ExpandedAssetScreenWithData';
import ImportSeedPhraseSheetWithData from '../screens/ImportSeedPhraseSheetWithData';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreenWithData from '../screens/QRScannerScreenWithData';
import ReceiveModal from '../screens/ReceiveModal';
import SavingsSheet from '../screens/SavingsSheet';
import SendSheet from '../screens/SendSheet';
import SettingsModal from '../screens/SettingsModal';
import TransactionConfirmationScreen from '../screens/TransactionConfirmationScreen';
import WalletConnectConfirmationModal from '../screens/WalletConnectConfirmationModal';
import WalletScreen from '../screens/WalletScreen';
import WithdrawModal from '../screens/WithdrawModal';
import { deviceUtils } from '../utils';
import { onDidPop, onWillPop } from './Navigation';
import {
  backgroundPreset,
  emojiPreset,
  expandedPreset,
  overlayExpandedPreset,
  savingsPreset,
  sheetPreset,
} from './effects';
import {
  createStackNavigator,
  exchangePresetWithTransitions,
  expandedPresetWithTransitions,
  expandedReversePresetWithTransitions,
  onTransitionEnd,
  onTransitionStart,
  sheetPresetWithTransitions,
} from './helpers';
import {
  AddCashSheetWrapper,
  appearListener,
  ImportSeedPhraseSheetWrapper,
  SendSheetWrapper,
} from './nativeStackHelpers';
import { onNavigationStateChange } from './onNavigationStateChange';
import Routes from './routesNames';
import { ExchangeModalNavigator, SavingModalNavigator } from './index';

const routesForSwipeStack = {
  [Routes.PROFILE_SCREEN]: ProfileScreen,
  [Routes.WALLET_SCREEN]: WalletScreen,
  [Routes.QR_SCANNER_SCREEN]: QRScannerScreenWithData,
};

function ScrollPagerWrapper(props) {
  return <ScrollPager {...props} overscroll={false} />;
}

const SwipeStack = createMaterialTopTabNavigator(routesForSwipeStack, {
  headerMode: 'none',
  initialLayout: deviceUtils.dimensions,
  initialRouteName: Routes.WALLET_SCREEN,
  renderPager: ScrollPagerWrapper,
  tabBarComponent: null,
});

const importSeedPhraseFlowRoutes = {
  [Routes.IMPORT_SEED_PHRASE_SHEET]: {
    navigationOptions: sheetPresetWithTransitions,
    screen: ImportSeedPhraseSheetWrapper,
  },
  [Routes.OVERLAY_EXPANDED_ASSET_SCREEN]: {
    navigationOptions: overlayExpandedPreset,
    screen: ExpandedAssetScreenWithData,
  },
};

const sendFlowRoutes = {
  [Routes.OVERLAY_EXPANDED_ASSET_SCREEN]: {
    navigationOptions: overlayExpandedPreset,
    screen: ExpandedAssetScreenWithData,
  },
  [Routes.SEND_SHEET]: {
    navigationOptions: sheetPresetWithTransitions,
    screen: SendSheetWrapper,
  },
};

const SendFlowNavigator = createStackNavigator(sendFlowRoutes, {
  initialRouteName: Routes.SEND_SHEET,
});

const ImportSeedPhraseFlowNavigator = createStackNavigator(
  importSeedPhraseFlowRoutes,
  {
    initialRouteName: Routes.IMPORT_SEED_PHRASE_SHEET,
  }
);

const routesForAddCash = {
  [Routes.ADD_CASH_SHEET]: {
    navigationOptions: sheetPresetWithTransitions,
    screen: AddCashSheetWrapper,
  },
  [Routes.OVERLAY_EXPANDED_SUPPORTED_COUNTRIES]: {
    navigationOptions: overlayExpandedPreset,
    screen: ExpandedAssetScreenWithData,
  },
};

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
  [Routes.EXAMPLE_SCREEN]: {
    navigationOptions: expandedPresetWithTransitions,
    screen: ExampleScreen,
  },
  [Routes.EXCHANGE_MODAL]: {
    navigationOptions: exchangePresetWithTransitions,
    params: {
      isGestureBlocked: false,
    },
    screen: ExchangeModalNavigator,
  },
  [Routes.EXPANDED_ASSET_SCREEN]: {
    navigationOptions: expandedPreset,
    screen: ExpandedAssetScreenWithData,
  },
  [Routes.SAVINGS_SHEET]: {
    navigationOptions: savingsPreset,
    screen: SavingsSheet,
  },
  [Routes.SWIPE_LAYOUT]: {
    navigationOptions: backgroundPreset,
    screen: SwipeStack,
  },
  [Routes.WALLET_CONNECT_CONFIRMATION_MODAL]: {
    navigationOptions: expandedPresetWithTransitions,
    screen: WalletConnectConfirmationModal,
  },
  [Routes.SAVINGS_DEPOSIT_MODAL]: {
    navigationOptions: exchangePresetWithTransitions,
    params: {
      isGestureBlocked: false,
    },
    screen: SavingModalNavigator,
  },
  [Routes.SAVINGS_WITHDRAW_MODAL]: {
    navigationOptions: exchangePresetWithTransitions,
    params: {
      isGestureBlocked: false,
    },
    screen: WithdrawModal,
  },
  ...(isNativeStackAvailable && {
    [Routes.OVERLAY_EXPANDED_ASSET_SCREEN]: {
      navigationOptions: overlayExpandedPreset,
      screen: ExpandedAssetScreenWithData,
    },
  }),
};

const MainNavigator = createStackNavigator(routesForMainNavigator);

const AddCashFlowNavigator = createStackNavigator(routesForAddCash, {
  initialRouteName: Routes.ADD_CASH_SHEET,
});

const routesForNativeStack = {
  [Routes.IMPORT_SEED_PHRASE_SHEET_NAVIGATOR]: ImportSeedPhraseFlowNavigator,
  [Routes.SEND_SHEET_NAVIGATOR]: SendFlowNavigator,
  [Routes.ADD_CASH_SCREEN_NAVIGATOR]: AddCashFlowNavigator,
};

const routesForNativeStackFallback = {
  [Routes.ADD_CASH_SHEET]: {
    navigationOptions: sheetPresetWithTransitions,
    screen: AddCashSheet,
  },
  [Routes.IMPORT_SEED_PHRASE_SHEET]: {
    navigationOptions: {
      ...sheetPreset,
      onTransitionStart: () => {
        StatusBar.setBarStyle('light-content');
      },
    },
    screen: ImportSeedPhraseSheetWithData,
  },
  [Routes.MAIN_NAVIGATOR]: MainNavigator,
  [Routes.OVERLAY_EXPANDED_ASSET_SCREEN]: {
    navigationOptions: overlayExpandedPreset,
    screen: ExpandedAssetScreenWithData,
  },
  [Routes.OVERLAY_EXPANDED_SUPPORTED_COUNTRIES]: {
    navigationOptions: overlayExpandedPreset,
    screen: ExpandedAssetScreenWithData,
  },
  [Routes.SEND_SHEET]: {
    navigationOptions: {
      ...omit(sheetPreset, 'gestureResponseDistance'),
      onTransitionStart: () => {
        StatusBar.setBarStyle('light-content');
        onTransitionStart();
      },
    },
    screen: SendSheet,
  },
};

const NativeStackFallback = createStackNavigator(routesForNativeStackFallback, {
  defaultNavigationOptions: {
    onTransitionEnd,
    onTransitionStart,
  },
  headerMode: 'none',
  initialRouteName: Routes.MAIN_NAVIGATOR,
  mode: 'modal',
});

const Stack = isNativeStackAvailable ? MainNavigator : NativeStackFallback;

const withCustomStack = screen => ({
  navigationOptions: { customStack: true, onAppear: null },
  screen,
});

const routesForBottomSheetStack = {
  [Routes.STACK]: Stack,
  [Routes.RECEIVE_MODAL]: withCustomStack(ReceiveModal),
  [Routes.SETTINGS_MODAL]: withCustomStack(SettingsModal),
  ...(isNativeStackAvailable && routesForNativeStack),
};

const MainNativeBottomSheetNavigation = createNativeStackNavigator(
  routesForBottomSheetStack,
  {
    defaultNavigationOptions: {
      onAppear: () => appearListener.current && appearListener.current(),
      onDismissed: onDidPop,
      onWillDismiss: () => {
        onWillPop();
        sheetPreset.onTransitionStart({ closing: true });
      },
      showDragIndicator: false,
      springDamping: 0.8,
      transitionDuration: 0.35,
    },
    mode: 'modal',
  }
);

const AppContainer = createAppContainer(MainNativeBottomSheetNavigation);

const AppContainerWithAnalytics = React.forwardRef((props, ref) => (
  <AppContainer ref={ref} onNavigationStateChange={onNavigationStateChange} />
));

AppContainerWithAnalytics.displayName = 'AppContainerWithAnalytics';

export default React.memo(AppContainerWithAnalytics);
