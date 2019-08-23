import {
  tradeEthForExactTokensWithData,
  tradeExactEthForTokensWithData,
  tradeExactTokensForEthWithData,
  tradeExactTokensForTokensWithData,
  tradeTokensForExactEthWithData,
  tradeTokensForExactTokensWithData,
} from '@uniswap/sdk';
import {
  filter,
  findIndex,
  get,
  isEmpty,
  isNil,
  keys,
  map,
} from 'lodash';
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { InteractionManager, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { NavigationActions, NavigationEvents, withNavigationFocus } from 'react-navigation';
import {
  compose,
  mapProps,
  toClass,
  withProps,
} from 'recompact';
import { executeSwap } from '../handlers/uniswap';
import {
  convertAmountFromNativeDisplay,
  convertAmountFromNativeValue,
  convertAmountToNativeAmount,
  convertAmountToRawAmount,
  convertRawAmountToDecimalFormat,
  greaterThan,
  subtract,
  updatePrecisionToDisplay,
} from '../helpers/utilities';
import {
  withAccountAddress,
  withAccountData,
  withAccountSettings,
  withBlockedHorizontalSwipe,
  withKeyboardFocusHistory,
  withTransactionConfirmationScreen,
  withTransitionProps,
  withUniswapAllowances,
  withUniswapAssets,
} from '../hoc';
import { colors, padding, position } from '../styles';
import {
  contractUtils,
  deviceUtils,
  ethereumUtils,
  safeAreaInsetValues,
} from '../utils';
import {
  ConfirmExchangeButton,
  ExchangeGasFeeButton,
  ExchangeInputField,
  ExchangeModalHeader,
  ExchangeOutputField,
} from '../components/exchange';
import { FloatingPanel, FloatingPanels } from '../components/expanded-state';
import GestureBlocker from '../components/GestureBlocker';
import {
  Centered,
  Column,
  KeyboardFixedOpenLayout,
} from '../components/layout';
import { Text } from '../components/text';
import { CurrencySelectionTypes } from './CurrencySelectModal';

export const exchangeModalBorderRadius = 30;

const AnimatedFloatingPanels = Animated.createAnimatedComponent(toClass(FloatingPanels));

class ExchangeModal extends PureComponent {
  static propTypes = {
    accountAddress: PropTypes.string,
    allAssets: PropTypes.array,
    allowances: PropTypes.object,
    chainId: PropTypes.number,
    clearKeyboardFocusHistory: PropTypes.func,
    dataAddNewTransaction: PropTypes.func,
    keyboardFocusHistory: PropTypes.array,
    nativeCurrency: PropTypes.string,
    navigation: PropTypes.object,
    pushKeyboardFocusHistory: PropTypes.func,
    tradeDetails: PropTypes.object,
    uniswapGetTokenReserve: PropTypes.func,
    uniswapUpdateAllowances: PropTypes.func,
  }

  state = {
    inputAllowance: null,
    inputAmount: null,
    inputAmountDisplay: null,
    inputAsExactAmount: false,
    inputCurrency: ethereumUtils.getAsset(this.props.allAssets),
    nativeAmount: null,
    needsApproval: false,
    outputAmount: null,
    outputAmountDisplay: null,
    outputCurrency: null,
    showConfirmButton: false,
    slippage: null,
    tradeDetails: null,
  }

  componentDidUpdate = (prevProps, prevState) => {
    const {
      isFocused,
      isTransitioning,
      keyboardFocusHistory,
    } = this.props;
    const {
      inputAmount,
      inputCurrency,
      nativeAmount,
      outputAmount,
      outputCurrency,
    } = this.state;

    if (isFocused && (!isTransitioning && prevProps.isTransitioning)) {
      const lastFocusedInput = keyboardFocusHistory[keyboardFocusHistory.length - 2];

      if (lastFocusedInput) {
        InteractionManager.runAfterInteractions(() => {
          TextInput.State.focusTextInput(lastFocusedInput);
        });
      } else {
        // console.log('ELSE')
        // this.inputFieldRef.focus();
      }
    }

    if (outputCurrency) {
      this.setState({ showConfirmButton: true });
    }

    if ((!isEmpty(nativeAmount) && nativeAmount !== prevState.nativeAmount)
        || (!isEmpty(inputAmount) && inputAmount !== prevState.inputAmount)
        || (!isEmpty(outputAmount) && outputAmount !== prevState.outputAmount)) {
      this.getMarketDetails();
    }

    if (inputCurrency.address !== prevState.inputCurrency.address) {
      this.getCurrencyAllowance();
    }
  }

  componentWillUnmount = () => {
    this.props.clearKeyboardFocusHistory();
  }

  inputFieldRef = null

  nativeFieldRef = null

  outputFieldRef = null

  parseTradeDetails = (path, tradeDetails, decimals) => {
    const updatedValue = get(tradeDetails, path);
    const slippage = get(tradeDetails, 'marketRateSlippage');
    const rawUpdatedValue = convertRawAmountToDecimalFormat(updatedValue, decimals);
    return { rawUpdatedValue, slippage: slippage.toFixed() };
  };

  getCurrencyAllowance = async () => {
    const { accountAddress, allowances, uniswapUpdateAllowances } = this.props;
    const { inputCurrency } = this.state;
    if (inputCurrency.address === 'eth') {
      this.setState({ needsApproval: false });
      return;
    }
    const allowance = allowances[inputCurrency.address];
    if (isNil(allowance)) {
      this.setState({ needsApproval: true });
    } else {
      this.setState({ needsApproval: !greaterThan(allowance, 0) });
    }
    const newAllowance = await contractUtils.getAllowance(accountAddress, inputCurrency, inputCurrency.exchangeAddress);
    uniswapUpdateAllowances(inputCurrency.address, newAllowance);
    this.setState({ needsApproval: !greaterThan(newAllowance, 0) });
  };

  getReserveData = async tokenAddress => {
    let reserve = this.props.tokenReserves[tokenAddress.toLowerCase()];
    if (isNil(reserve)) {
      reserve = await this.props.uniswapGetTokenReserve(tokenAddress);
    }
    return reserve;
  };

  getMarketDetails = async () => {
    try {
      let tradeDetails = null;
      const { chainId } = this.props;
      const {
        inputAmount,
        inputAsExactAmount,
        inputCurrency,
        nativeAmount,
        outputAmount,
        outputCurrency,
      } = this.state;
      if (isNil(inputCurrency)
          || isNil(outputCurrency)
          || (isEmpty(inputAmount) && isEmpty(outputAmount))) return;
      const {
        address: inputCurrencyAddress,
        decimals: inputDecimals,
      } = inputCurrency;
      const {
        address: outputCurrencyAddress,
        decimals: outputDecimals,
      } = outputCurrency;
      const rawInputAmount = convertAmountToRawAmount(inputAmount || 0, inputDecimals);
      const rawOutputAmount = convertAmountToRawAmount(outputAmount || 0, outputDecimals);

      if (inputCurrencyAddress === 'eth' && outputCurrencyAddress !== 'eth') {
        const outputCurrencyReserve = await this.getReserveData(outputCurrencyAddress);
        tradeDetails = inputAsExactAmount
          ? tradeExactEthForTokensWithData(outputCurrencyReserve, rawInputAmount, chainId)
          : tradeEthForExactTokensWithData(outputCurrencyReserve, rawOutputAmount, chainId);
      } else if (inputCurrencyAddress !== 'eth' && outputCurrencyAddress === 'eth') {
        const inputCurrencyReserve = await this.getReserveData(inputCurrencyAddress);
        tradeDetails = inputAsExactAmount
          ? tradeExactTokensForEthWthData(inputCurrencyReserve, rawInputAmount, chainId)
          : tradeTokensForExactEthWithData(inputCurrencyReserve, rawOutputAmount, chainId);
      } else if (inputCurrencyAddress !== 'eth' && outputCurrencyAddress !== 'eth') {
        const inputCurrencyReserve = await this.getReserveData(inputCurrencyAddress);
        const outputCurrencyReserve = await this.getReserveData(outputCurrencyAddress);
        tradeDetails = inputAsExactAmount
          ? tradeExactTokensForTokensWithData(inputCurrencyReserve, outputCurrencyReserve, rawInputAmount, chainId)
          : tradeTokensForExactTokensWithData(inputCurrencyReserve, outputCurrencyReserve, rawOutputAmount, chainId);
      }
      const decimals = inputAsExactAmount ? outputDecimals : inputDecimals;
      const path = inputAsExactAmount ? 'outputAmount.amount' : 'inputAmount.amount';
      this.setState({ tradeDetails });
      const { rawUpdatedValue, slippage } = this.parseTradeDetails(path, tradeDetails, decimals);
      if (inputAsExactAmount) {
        const outputAmountDisplay = updatePrecisionToDisplay(rawUpdatedValue, get(outputCurrency, 'price.value'));
        this.setState({ outputAmount: rawUpdatedValue, outputAmountDisplay, slippage });
      } else {
        const inputAmountDisplay = updatePrecisionToDisplay(rawUpdatedValue, get(inputCurrency, 'price.value'));
        this.setState({ inputAmount: rawUpdatedValue, inputAmountDisplay, slippage });
      }
    } catch (error) {
      console.log('error getting market details', error);
      // TODO
    }
  }

  setNativeAmount = async nativeAmountDisplay => {
    const nativeAmount = convertAmountFromNativeDisplay(nativeAmountDisplay, this.props.nativeCurrency);
    const inputAmount = convertAmountFromNativeValue(nativeAmount, get(this.state.inputCurrency, 'native.price.amount', 0));
    const inputAmountDisplay = updatePrecisionToDisplay(inputAmount, get(inputCurrency, 'price.value'));
    this.setState({
      inputAmount,
      inputAmountDisplay,
      inputAsExactAmount: true,
      nativeAmount: nativeAmountDisplay,
    });
  }

  setInputAmount = async inputAmount => {
    const nativeAmount = convertAmountToNativeAmount(
      inputAmount,
      get(this.state.inputCurrency, 'native.price.amount', 0)
    );
    this.setState({
      inputAmount,
      inputAmountDisplay: inputAmount,
      inputAsExactAmount: true,
      nativeAmount,
    });
  }

  setOutputAmount = async outputAmount => {
    this.setState({
      inputAsExactAmount: false,
      outputAmount,
      outputAmountDisplay: outputAmount,
    });
  }

  setInputCurrency = inputCurrency => {
    const { inputCurrency: previousInputCurrency, outputCurrency } = this.state;
    this.setState({ inputCurrency });
    if (inputCurrency
        && outputCurrency
        && inputCurrency.address.toLowerCase() === outputCurrency.address.toLowerCase()) {
      if (previousInputCurrency) {
        this.setState({ outputCurrency: previousInputCurrency });
      } else {
        this.setState({ outputCurrency: null });
      }
    }
  }

  setOutputCurrency = outputCurrency => {
    const { inputCurrency, outputCurrency: previousOutputCurrency } = this.state;
    this.setState({ outputCurrency });
    if (outputCurrency
        && inputCurrency
        && outputCurrency.address.toLowerCase() === inputCurrency.address.toLowerCase()) {
      if (previousOutputCurrency) {
        this.setState({ inputCurrency: previousOutputCurrency });
      } else {
        this.setState({ inputCurrency: null });
      }
    }
  }

  onPressMaxBalance = () => {
    const { inputCurrency } = this.state;
    const balance = get(inputCurrency, 'balance.amount', 0);
    const inputAmount = (inputCurrency.address === 'eth') ? subtract(balance, 0.01) : balance;
    this.setState({ inputAmount, inputAsExactAmount: true });
  }

  handleSelectInputCurrency = () => {
    this.props.navigation.navigate('CurrencySelectScreen', {
      type: CurrencySelectionTypes.input,
      onSelectCurrency: this.setInputCurrency,
    });
  }

  handleSelectOutputCurrency = () => {
    this.props.navigation.navigate('CurrencySelectScreen', {
      type: CurrencySelectionTypes.output,
      onSelectCurrency: this.setOutputCurrency,
    });
  }

  handleSubmit = async () => {
    const { tradeDetails } = this.state;
    try {
      const txn = await executeSwap(tradeDetails);
      if (txn) {
        const txnDetails = {
          amount: this.state.inputAmount,
          asset: this.state.inputCurrency,
          from: this.props.accountAddress,
          hash: txn.hash,
          nonce: get(txn, 'nonce'),
          to: get(txn, 'to'),
        };
        this.props.dataAddNewTransaction(txnDetails);
        this.props.navigation.navigate('ProfileScreen');
      } else {
        this.props.navigation.navigate('ProfileScreen');
      }
    } catch (error) {
      console.log('error submitting swap', error);
      this.props.navigation.navigate('WalletScreen');
    }
  }

  handleWillFocus = ({ lastState }) => {
    if (!lastState && this.inputFieldRef) {
      return this.inputFieldRef.focus();
    }
  }

  handleInputFieldRef = (ref) => { this.inputFieldRef = ref; }

  handleNativeFieldRef = (ref) => { this.nativeFieldRef = ref; }

  handleOutputFieldRef = (ref) => { this.outputFieldRef = ref; }

  handleDidFocus = () => {
    // console.log('DID FOCUS', this.props.navigation)

    // if (this.inputFieldRef) {
    //   setTimeout(() => this.inputFieldRef.focus(), 250);
    // }
  }

  handleFocusField = ({ currentTarget }) => {
    this.props.pushKeyboardFocusHistory(currentTarget);
  }

  render = () => {
    const {
      keyboardFocusHistory,
      nativeCurrency,
      navigation,
      onPressConfirmExchange,
      transitionPosition,
    } = this.props;

    const {
      inputAmountDisplay,
      inputCurrency,
      nativeAmount,
      needsApproval,
      outputAmountDisplay,
      outputCurrency,
      showConfirmButton,
    } = this.state;

    return (
      <KeyboardFixedOpenLayout>
        <NavigationEvents
          onDidFocus={this.handleDidFocus}
          onWillFocus={this.handleWillFocus}
        />
        <Centered
          {...position.sizeAsObject('100%')}
          backgroundColor={colors.transparent}
          direction="column"
          paddingTop={showConfirmButton ? 0 : 10}
        >
          <AnimatedFloatingPanels
            style={{
              opacity: Animated.interpolate(transitionPosition, {
                extrapolate: 'clamp',
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            }}
          >
            <GestureBlocker type='top'/>
            <FloatingPanel radius={exchangeModalBorderRadius}>
              <ExchangeModalHeader />
              <Column align="center">
                <ExchangeInputField
                  inputAmount={inputAmountDisplay}
                  inputCurrency={get(inputCurrency, 'symbol', null)}
                  inputFieldRef={this.handleInputFieldRef}
                  nativeAmount={nativeAmount}
                  nativeCurrency={nativeCurrency}
                  nativeFieldRef={this.handleNativeFieldRef}
                  needsApproval={needsApproval}
                  onFocus={this.handleFocusField}
                  onPressMaxBalance={this.onPressMaxBalance}
                  onPressSelectInputCurrency={this.handleSelectInputCurrency}
                  setInputAmount={this.setInputAmount}
                  setNativeAmount={this.setNativeAmount}
                />
                <ExchangeOutputField
                  onPressSelectOutputCurrency={this.handleSelectOutputCurrency}
                  outputAmount={outputAmountDisplay}
                  onFocus={this.handleFocusField}
                  outputCurrency={get(outputCurrency, 'symbol', null)}
                  outputFieldRef={this.handleOutputFieldRef}
                  setOutputAmount={this.setOutputAmount}
                />
              </Column>
            </FloatingPanel>
            <Centered>
              <Text color={colors.white}>
                Slippage {this.state.slippage}
              </Text>
            </Centered>
            <GestureBlocker type='bottom'/>
            {showConfirmButton && (
              <Fragment>
                <ConfirmExchangeButton
                  disabled={!Number(inputAmountDisplay)}
                  onPress={this.handleSubmit}
                />
                {!!Number(inputAmountDisplay) && (
                  <ExchangeGasFeeButton
                    gasPrice={'$0.06'}
                  />
                )}
              </Fragment>
            )}
          </AnimatedFloatingPanels>
        </Centered>
      </KeyboardFixedOpenLayout>
    );
  }
}

const withMockedPrices = withProps({
  currencyToDollar: 3,
  targetCurrencyToDollar: 2,
});

export default compose(
  withAccountAddress,
  withAccountData,
  withAccountSettings,
  withBlockedHorizontalSwipe,
  withKeyboardFocusHistory,
  withMockedPrices,
  withNavigationFocus,
  withTransactionConfirmationScreen,
  withTransitionProps,
  withUniswapAllowances,
  withUniswapAssets,
  mapProps(({
    navigation,
    transitionProps: { isTransitioning },
    ...props,
  }) => ({
    ...props,
    isTransitioning,
    navigation,
    transitionPosition: get(navigation, 'state.params.position'),
  })),
)(ExchangeModal);
