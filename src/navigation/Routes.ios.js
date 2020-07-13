import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { omit } from 'lodash';
import React, { useContext } from 'react';
import { StatusBar } from 'react-native';
import { InitialRouteContext } from '../context/initialRoute';
import isNativeStackAvailable from '../helpers/isNativeStackAvailable';
import AvatarBuilder from '../screens/AvatarBuilder';
import ChangeWalletSheet from '../screens/ChangeWalletSheet';
import DepositModal from '../screens/DepositModal';
import ImportSeedPhraseSheet from '../screens/ImportSeedPhraseSheet';
import ModalScreen from '../screens/ModalScreen';
import ReceiveModal from '../screens/ReceiveModal';
import RestoreSheet from '../screens/RestoreSheet';
import SavingsSheet from '../screens/SavingsSheet';
import SendSheet from '../screens/SendSheet';
import SettingsModal from '../screens/SettingsModal';
import TransactionConfirmationScreen from '../screens/TransactionConfirmationScreen';
import WalletConnectApprovalSheet from '../screens/WalletConnectApprovalSheet';
import WalletConnectRedirectSheet from '../screens/WalletConnectRedirectSheet';
import WelcomeScreen from '../screens/WelcomeScreen';
import WithdrawModal from '../screens/WithdrawModal';
import { SwipeNavigator } from './SwipeNavigator';
import {
  defaultScreenStackOptions,
  expandedAssetSheetConfig,
  nativeStackConfig,
  stackNavigationConfig,
} from './config';
import {
  bottomSheetPreset,
  emojiPreset,
  exchangePreset,
  expandedPreset,
  overlayExpandedPreset,
  sheetPreset,
} from './effects';
import { onTransitionStart } from './helpers';
import {
  AddCashSheetWrapper,
  BackupSheetWrapper,
  ExpandedAssetSheetWrapper,
  ImportSeedPhraseSheetWrapper,
  SendSheetWrapper,
} from './nativeStackHelpers';
import { onNavigationStateChange } from './onNavigationStateChange';
import Routes from './routesNames';
import { ExchangeModalNavigator } from './index';
import createNativeStackNavigator from 'react-native-cool-modals/createNativeStackNavigator';

const Stack = createStackNavigator();
const NativeStack = createNativeStackNavigator();

function SendFlowNavigator() {
  return (
    <Stack.Navigator
      {...stackNavigationConfig}
      initialRouteName={Routes.SEND_SHEET}
    >
      <Stack.Screen
        component={ModalScreen}
        name={Routes.MODAL_SCREEN}
        options={overlayExpandedPreset}
      />
      <Stack.Screen
        component={SendSheetWrapper}
        name={Routes.SEND_SHEET}
        options={sheetPreset}
      />
    </Stack.Navigator>
  );
}

function ImportSeedPhraseFlowNavigator() {
  return (
    <Stack.Navigator
      {...stackNavigationConfig}
      initialRouteName={Routes.IMPORT_SEED_PHRASE_SHEET}
    >
      <Stack.Screen
        component={ModalScreen}
        name={Routes.MODAL_SCREEN}
        options={overlayExpandedPreset}
      />
      <Stack.Screen
        component={ImportSeedPhraseSheetWrapper}
        name={Routes.IMPORT_SEED_PHRASE_SHEET}
      />
    </Stack.Navigator>
  );
}

function AddCashFlowNavigator() {
  return (
    <Stack.Navigator
      {...stackNavigationConfig}
      initialRouteName={Routes.ADD_CASH_SCREEN_NAVIGATOR}
    >
      <Stack.Screen
        component={ModalScreen}
        name={Routes.SUPPORTED_COUNTRIES_MODAL_SCREEN}
        options={overlayExpandedPreset}
      />
      <Stack.Screen
        component={AddCashSheetWrapper}
        name={Routes.ADD_CASH_SCREEN_NAVIGATOR}
      />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  const initialRoute = useContext(InitialRouteContext);

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      {...stackNavigationConfig}
      screenOptions={defaultScreenStackOptions}
    >
      <Stack.Screen component={SwipeNavigator} name={Routes.SWIPE_LAYOUT} />
      <Stack.Screen component={WelcomeScreen} name={Routes.WELCOME_SCREEN} />
      <Stack.Screen
        component={SavingsSheet}
        name={Routes.SAVINGS_SHEET}
        options={bottomSheetPreset}
      />
      <Stack.Screen
        component={AvatarBuilder}
        name={Routes.AVATAR_BUILDER}
        options={emojiPreset}
      />
      <Stack.Screen
        component={WalletConnectApprovalSheet}
        name={Routes.WALLET_CONNECT_APPROVAL_SHEET}
        options={expandedPreset}
      />
      <Stack.Screen
        component={WalletConnectRedirectSheet}
        name={Routes.WALLET_CONNECT_REDIRECT_SHEET}
        options={bottomSheetPreset}
      />
      <Stack.Screen
        component={TransactionConfirmationScreen}
        name={Routes.CONFIRM_REQUEST}
        options={sheetPreset}
      />
      <Stack.Screen
        component={ExchangeModalNavigator}
        name={Routes.EXCHANGE_MODAL}
        options={exchangePreset}
      />
      {isNativeStackAvailable && (
        <Stack.Screen
          component={ModalScreen}
          name={Routes.MODAL_SCREEN}
          options={overlayExpandedPreset}
        />
      )}
    </Stack.Navigator>
  );
}

function MainNavigatorWrapper() {
  return (
    <Stack.Navigator
      initialRouteName={Routes.MAIN_NAVIGATOR_WRAPPER}
      {...stackNavigationConfig}
      screenOptions={defaultScreenStackOptions}
    >
      <Stack.Screen
        component={MainNavigator}
        name={Routes.MAIN_NAVIGATOR_WRAPPER}
      />
      <Stack.Screen
        component={WithdrawModal}
        name={Routes.SAVINGS_WITHDRAW_MODAL}
        options={exchangePreset}
      />
      <Stack.Screen
        component={DepositModal}
        name={Routes.SAVINGS_DEPOSIT_MODAL}
        options={exchangePreset}
      />
    </Stack.Navigator>
  );
}

function NativeStackFallbackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={Routes.MAIN_NAVIGATOR}
      {...stackNavigationConfig}
      screenOptions={defaultScreenStackOptions}
    >
      <Stack.Screen component={MainNavigator} name={Routes.MAIN_NAVIGATOR} />
      <Stack.Screen
        component={ImportSeedPhraseSheet}
        name={Routes.IMPORT_SEED_PHRASE_SHEET}
        options={{
          ...sheetPreset,
          onTransitionStart: () => {
            StatusBar.setBarStyle('light-content');
          },
        }}
      />
      <Stack.Screen
        component={AddCashSheetWrapper}
        name={Routes.ADD_CASH_SHEET}
        options={sheetPreset}
      />
      <Stack.Screen
        component={ModalScreen}
        name={Routes.MODAL_SCREEN}
        options={overlayExpandedPreset}
      />
      <Stack.Screen
        component={SendSheet}
        name={Routes.SEND_SHEET}
        options={{
          ...omit(sheetPreset, 'gestureResponseDistance'),
          onTransitionStart: () => {
            StatusBar.setBarStyle('light-content');
            onTransitionStart();
          },
        }}
      />
      <Stack.Screen
        component={ModalScreen}
        name={Routes.SUPPORTED_COUNTRIES_MODAL_SCREEN}
        options={overlayExpandedPreset}
      />
    </Stack.Navigator>
  );
}

const MainStack = isNativeStackAvailable
  ? MainNavigatorWrapper
  : NativeStackFallbackNavigator;

function NativeStackNavigator() {
  return (
    <NativeStack.Navigator {...nativeStackConfig}>
      <NativeStack.Screen component={MainStack} name={Routes.STACK} />
      <NativeStack.Screen
        component={ReceiveModal}
        name={Routes.RECEIVE_MODAL}
        options={{
          backgroundColor: '#3B3E43',
          backgroundOpacity: 1,
          customStack: true,
        }}
      />
      <NativeStack.Screen
        component={SettingsModal}
        name={Routes.SETTINGS_MODAL}
        options={{
          backgroundColor: '#25292E',
          backgroundOpacity: 0.7,
          cornerRadius: 0,
          customStack: true,
          ignoreBottomOffset: true,
          topOffset: 0,
        }}
      />
      <NativeStack.Screen
        component={ExpandedAssetSheetWrapper}
        name={Routes.EXPANDED_ASSET_SHEET}
        {...expandedAssetSheetConfig}
      />
      <Stack.Screen
        component={ChangeWalletSheet}
        name={Routes.CHANGE_WALLET_SHEET}
        options={{
          allowsDragToDismiss: true,
          backgroundColor: '#25292E',
          backgroundOpacity: 0.7,
          customStack: true,
          springDamping: 1,
          transitionDuration: 0.25,
        }}
      />
      <NativeStack.Screen
        component={BackupSheetWrapper}
        name={Routes.BACKUP_SHEET}
        options={{
          cornerRadius: 30,
          customStack: true,
          isShortFormEnabled: true,
          longFormHeight: 394,
          onAppear: null,
          shortFormHeight: 394,
          startFromShortForm: true,
        }}
      />
      <NativeStack.Screen
        component={RestoreSheet}
        name={Routes.RESTORE_SHEET}
        options={{
          backgroundColor: '#25292E',
          backgroundOpacity: 0.6,
          cornerRadius: 39,
          customStack: true,
          ignoreBottomOffset: true,
          isShortFormEnabled: false,
          longFormHeight: 505,
          onAppear: null,
        }}
      />
      {isNativeStackAvailable && (
        <>
          <NativeStack.Screen
            component={SendFlowNavigator}
            name={Routes.SEND_SHEET_NAVIGATOR}
          />
          <NativeStack.Screen
            component={ImportSeedPhraseFlowNavigator}
            name={Routes.IMPORT_SEED_PHRASE_SHEET_NAVIGATOR}
          />
          <NativeStack.Screen
            component={AddCashFlowNavigator}
            name={Routes.ADD_CASH_SCREEN_NAVIGATOR}
          />
        </>
      )}
    </NativeStack.Navigator>
  );
}

const AppContainerWithAnalytics = React.forwardRef((props, ref) => (
  <NavigationContainer onStateChange={onNavigationStateChange} ref={ref}>
    <NativeStackNavigator />
  </NavigationContainer>
));

AppContainerWithAnalytics.displayName = 'AppContainerWithAnalytics';

export default React.memo(AppContainerWithAnalytics);
