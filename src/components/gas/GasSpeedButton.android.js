import { get, isEmpty } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, LayoutAnimation } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import styled from 'styled-components';
import { Alert } from '../alerts';
import {
  ButtonPressAnimation,
  ScaleButtonZoomableAndroid,
} from '../animations';
import { Input } from '../inputs';
import { Column, Row } from '../layout';
import { AnimatedNumber, Text } from '../text';
import GasSpeedLabelPager from './GasSpeedLabelPager';
import ExchangeModalTypes from '@rainbow-me/helpers/exchangeModalTypes';
import { useAccountSettings, useGas } from '@rainbow-me/hooks';
import { gweiToWei, weiToGwei } from '@rainbow-me/parsers';
import { fonts, fontWithWidth, margin } from '@rainbow-me/styles';
import { gasUtils, magicMemo } from '@rainbow-me/utils';

const { GasSpeedOrder, CUSTOM, FAST, SLOW } = gasUtils;

const Container = styled(Row).attrs({
  justify: 'space-between',
  opacityTouchable: true,
  pointerEvents: 'auto',
})`
  ${margin(10, 18, 10, 15)}
  width: 350;
`;

const Label = styled(Text).attrs({
  size: 'smedium',
  weight: 'semibold',
})``;

const ButtonLabel = styled(BorderlessButton).attrs(({ theme: { colors } }) => ({
  color: colors.appleBlue,
  hitSlop: 40,
  opacity: 1,
  size: 'smedium',
  weight: 'bold',
}))`
  padding-bottom: 10;
`;

const GasInput = styled(Input).attrs(
  ({ gasTheme: theme, theme: { colors } }) => ({
    color:
      theme === 'dark'
        ? colors.whiteLabel
        : colors.alpha(colors.blueGreyDark, 0.8),
    height: 58,
    keyboardAppearance: 'dark',
    keyboardType: 'numeric',
    letterSpacing: 'roundedMedium',
    maxLength: 5,
    multiline: false,
    placeholderTextColor:
      theme === 'dark'
        ? colors.alpha(colors.darkModeColors.blueGreyDark, 0.3)
        : colors.alpha(colors.blueGreyDark, 0.3),
    size: 'lmedium',
    testID: 'custom-gas-input',
  })
)`
  ${fontWithWidth(fonts.weight.bold)};
  ${margin(-13, 0)}
`;

const LittleBorderlessButton = ({ onPress, children, testID }) => {
  const { colors } = useTheme();
  return (
    <ButtonLabel onPress={onPress} testID={testID} width={120}>
      <Text color={colors.appleBlue} size="smedium" weight="bold">
        {children}
      </Text>
    </ButtonLabel>
  );
};

const BottomRightLabel = ({ formatter, theme }) => {
  const { colors } = useTheme();
  return (
    <Label
      align="right"
      color={
        theme === 'dark'
          ? colors.alpha(colors.darkModeColors.blueGreyDark, 0.6)
          : colors.alpha(colors.blueGreyDark, 0.6)
      }
    >
      {formatter()}
    </Label>
  );
};

const formatGasPrice = (gasPrice, nativeCurrency) => {
  return nativeCurrency === 'ETH'
    ? (Math.ceil(Number(gasPrice) * 10000) / 10000).toFixed(4)
    : (Math.ceil(Number(gasPrice) * 100) / 100).toFixed(2);
};

const getActionLabel = type => {
  switch (type) {
    case ExchangeModalTypes.deposit:
      return 'Deposits in';
    case ExchangeModalTypes.withdrawal:
      return 'Withdraws in';
    case 'transaction':
      return 'Confirms in';
    default:
      return 'Swaps in';
  }
};

let listener;

Keyboard.addListener('keyboardDidHide', () => listener?.());

const GasSpeedButton = ({
  dontBlur,
  onCustomGasBlur,
  onCustomGasFocus,
  testID,
  type,
  theme = 'dark',
  options = null,
  minGasPrice = null,
}) => {
  const { colors } = useTheme();
  const inputRef = useRef(null);
  const { nativeCurrencySymbol, nativeCurrency } = useAccountSettings();
  const {
    gasPrices,
    updateCustomValues,
    isSufficientGas,
    updateGasPriceOption,
    selectedGasPrice,
    selectedGasPriceOption,
    txFees,
  } = useGas();

  const gasPricesAvailable = useMemo(() => {
    if (!options || !minGasPrice) {
      return gasPrices;
    }

    const filteredGasPrices = {};
    options.forEach(speed => {
      filteredGasPrices[speed] = gasPrices[speed];
    });
    return filteredGasPrices;
  }, [gasPrices, minGasPrice, options]);

  const gasPrice = get(selectedGasPrice, 'txFee.native.value.amount');
  const customGasPriceTimeEstimateHandler = useRef(null);
  useEffect(() => {
    listener = () => {
      inputRef.current?.blur();
    };

    return () => {
      listener = undefined;
    };
  }, []);

  const [customGasPriceInput, setCustomGasPriceInput] = useState(0);
  const [estimatedTimeValue, setEstimatedTimeValue] = useState(0);
  const [estimatedTimeUnit, setEstimatedTimeUnit] = useState('min');
  const [inputFocused, setInputFocused] = useState(false);

  const defaultCustomGasPrice = Math.round(
    weiToGwei(gasPricesAvailable?.fast?.value?.amount)
  );
  const defaultCustomGasPriceUsd = get(
    txFees?.fast,
    'txFee.native.value.amount'
  );
  const defaultCustomGasConfirmationTime =
    gasPricesAvailable?.fast?.estimatedTime?.display;

  const price = isNaN(gasPrice) ? '0.00' : gasPrice;

  useEffect(() => {
    const estimatedTime = get(
      selectedGasPrice,
      'estimatedTime.display',
      ''
    ).split(' ');

    setEstimatedTimeValue(estimatedTime[0] || 0);
    setEstimatedTimeUnit(estimatedTime[1] || 'min');
  }, [selectedGasPrice, selectedGasPriceOption]);

  const calculateCustomPriceEstimatedTime = useCallback(
    async price => {
      try {
        await updateCustomValues(price);
        updateGasPriceOption(CUSTOM);
      } catch (e) {
        setEstimatedTimeValue(0);
        setEstimatedTimeUnit('min');
      }
    },
    [updateCustomValues, updateGasPriceOption]
  );

  useEffect(() => {
    // Cancel any queued estimation
    customGasPriceTimeEstimateHandler.current &&
      clearTimeout(customGasPriceTimeEstimateHandler.current);
    // Add a new one to the queue
    customGasPriceTimeEstimateHandler.current = setTimeout(() => {
      customGasPriceInput &&
        calculateCustomPriceEstimatedTime(customGasPriceInput);
    }, 1000);
  }, [calculateCustomPriceEstimatedTime, customGasPriceInput]);

  const handleCustomGasChange = useCallback(async price => {
    setCustomGasPriceInput(price);
  }, []);

  const renderGasPriceText = useCallback(
    animatedNumber => (
      <Text
        color={
          theme === 'dark'
            ? colors.whiteLabel
            : colors.alpha(colors.blueGreyDark, 0.8)
        }
        letterSpacing="roundedTight"
        size="lmedium"
        weight="bold"
      >
        {isEmpty(gasPricesAvailable) ||
        isEmpty(txFees) ||
        typeof isSufficientGas === 'undefined'
          ? 'Loading...'
          : animatedNumber}
      </Text>
    ),
    [gasPricesAvailable, isSufficientGas, theme, txFees]
  );

  const handlePress = useCallback(() => {
    if (inputFocused) {
      return;
    }
    LayoutAnimation.easeInEaseOut();
    const gasOptions = options || GasSpeedOrder;
    const currentSpeedIndex = gasOptions.indexOf(selectedGasPriceOption);
    const nextSpeedIndex = (currentSpeedIndex + 1) % gasOptions.length;

    const nextSpeed = gasOptions[nextSpeedIndex];
    updateGasPriceOption(nextSpeed);
  }, [inputFocused, options, selectedGasPriceOption, updateGasPriceOption]);

  const formatAnimatedGasPrice = useCallback(
    animatedPrice =>
      `${nativeCurrencySymbol}${formatGasPrice(animatedPrice, nativeCurrency)}`,
    [nativeCurrencySymbol, nativeCurrency]
  );

  const formatBottomRightLabel = useCallback(() => {
    const actionLabel = getActionLabel(type);
    const time = parseFloat(estimatedTimeValue || 0).toFixed(0);
    const gasPriceGwei = get(selectedGasPrice, 'value.display');
    let timeSymbol = '~';

    if (selectedGasPriceOption === CUSTOM) {
      if (!customGasPriceInput) {
        return `${formatAnimatedGasPrice(
          defaultCustomGasPriceUsd
        )} ~ ${defaultCustomGasConfirmationTime}`;
      } else if (gasPricesAvailable[CUSTOM]?.value) {
        const priceInWei = Number(gasPricesAvailable[CUSTOM].value.amount);
        const minGasPriceSlow = gasPricesAvailable[SLOW]
          ? Number(gasPricesAvailable[SLOW].value.amount)
          : Number(gasPricesAvailable[FAST].value.amount);
        const maxGasPriceFast = Number(gasPricesAvailable[FAST].value.amount);
        if (priceInWei < minGasPriceSlow) {
          timeSymbol = '>';
        } else if (priceInWei > maxGasPriceFast) {
          timeSymbol = '<';
        }

        return `${formatAnimatedGasPrice(
          gasPrice
        )} ${timeSymbol} ${time} ${estimatedTimeUnit}`;
      } else {
        return `${actionLabel} ...`;
      }
    }

    // If it's still loading show `...`
    if (time === '0' && estimatedTimeUnit === 'min') {
      return `${actionLabel} ...`;
    }

    return `${gasPriceGwei} ${timeSymbol} ${time} ${estimatedTimeUnit}`;
  }, [
    customGasPriceInput,
    defaultCustomGasConfirmationTime,
    defaultCustomGasPriceUsd,
    estimatedTimeUnit,
    estimatedTimeValue,
    formatAnimatedGasPrice,
    gasPrice,
    gasPricesAvailable,
    selectedGasPrice,
    selectedGasPriceOption,
    type,
  ]);

  const handleCustomGasFocus = useCallback(() => {
    setInputFocused(true);
    onCustomGasFocus?.();
  }, [onCustomGasFocus]);

  const handleCustomGasBlur = useCallback(() => {
    setInputFocused(false);
    onCustomGasBlur?.();
  }, [onCustomGasBlur]);

  const handleInputButtonManager = useCallback(() => {
    const complete = () => {
      if (inputFocused) {
        if (dontBlur) {
          handleCustomGasBlur();
        } else {
          inputRef.current?.blur();
        }
      } else {
        inputRef.current?.focus();
      }
    };

    if (customGasPriceInput === '0') {
      Alert({
        buttons: [
          {
            onPress: () => inputRef.current?.focus(),
            text: 'OK',
          },
        ],
        message: 'You need to enter a valid amount',
        title: 'Invalid Gas Price',
      });
      return;
    }

    if (!customGasPriceInput || !inputFocused) {
      complete();
      ReactNativeHapticFeedback.trigger('impactMedium');
      return;
    }

    if (minGasPrice && Number(customGasPriceInput) < minGasPrice) {
      Alert({
        buttons: [
          {
            onPress: () => inputRef.current?.focus(),
            text: 'OK',
          },
        ],
        message: `The minimum gas price valid allowed is ${minGasPrice} GWEI`,
        title: 'Gas Price Too Low',
      });
      return;
    }

    const priceInWei = gweiToWei(customGasPriceInput);
    const minGasPriceSlow = Number(
      gasPricesAvailable?.slow?.value?.amount || 0
    );
    const maxGasPriceFast = Number(
      gasPricesAvailable?.fast?.value?.amount || 0
    );
    let tooLow = priceInWei < minGasPriceSlow;
    let tooHigh = priceInWei > maxGasPriceFast * 2.5;

    if (tooLow || tooHigh) {
      Alert({
        buttons: [
          {
            onPress: complete,
            text: 'Proceed Anyway',
          },
          {
            onPress: () => inputRef.current?.focus(),
            style: 'cancel',
            text: 'Edit Gas Price',
          },
        ],
        message: tooLow
          ? 'Setting a higher gas price is recommended to avoid issues.'
          : 'Double check that you entered the correct amount—you’re likely paying more than you need to!',
        title: tooLow
          ? 'Low gas price–transaction might get stuck!'
          : 'High gas price!',
      });
    } else {
      complete();
    }
  }, [
    customGasPriceInput,
    inputFocused,
    minGasPrice,
    gasPricesAvailable?.slow?.value?.amount,
    gasPricesAvailable?.fast?.value?.amount,
    dontBlur,
    handleCustomGasBlur,
  ]);

  const focusOnInput = useCallback(() => inputRef.current?.focus(), []);
  const isCustom = selectedGasPriceOption === CUSTOM ? true : false;

  return (
    <Container
      as={!isCustom ? ButtonPressAnimation : ScaleButtonZoomableAndroid}
      onPress={handlePress}
      testID={testID}
    >
      <Column>
        <Row align="end" height={30} justify="space-between">
          {!isCustom ? (
            <AnimatedNumber
              formatter={formatAnimatedGasPrice}
              interval={6}
              renderContent={renderGasPriceText}
              steps={6}
              timing="linear"
              value={price}
            />
          ) : (
            <BorderlessButton onPress={focusOnInput}>
              <Row>
                <GasInput
                  gasTheme={theme}
                  onBlur={handleCustomGasBlur}
                  onChangeText={handleCustomGasChange}
                  onFocus={handleCustomGasFocus}
                  onSubmitEditing={handleInputButtonManager} // see PR #1385
                  placeholder={`${defaultCustomGasPrice} `}
                  ref={inputRef}
                  value={customGasPriceInput}
                />
                <Text
                  color={
                    customGasPriceInput
                      ? theme === 'dark'
                        ? colors.whiteLabel
                        : colors.alpha(colors.blueGreyDark, 0.8)
                      : theme === 'dark'
                      ? colors.alpha(colors.darkModeColors.blueGreyDark, 0.3)
                      : colors.alpha(colors.blueGreyDark, 0.3)
                  }
                  size="lmedium"
                  weight="bold"
                >
                  {ios && ' '}
                  Gwei
                </Text>
              </Row>
            </BorderlessButton>
          )}
        </Row>

        <Row justify="space-between" style={{ height: 27 }}>
          {!isCustom ? (
            <Label
              color={
                theme === 'dark'
                  ? colors.alpha(colors.darkModeColors.blueGreyDark, 0.6)
                  : colors.alpha(colors.blueGreyDark, 0.6)
              }
              height={10}
            >
              Network Fee
            </Label>
          ) : (
            <LittleBorderlessButton
              onPress={handleInputButtonManager}
              testID="custom-gas-edit-button"
            >
              {inputFocused
                ? 'Done'
                : `${customGasPriceInput ? 'Edit' : 'Enter'} Gas Price`}
            </LittleBorderlessButton>
          )}
        </Row>
      </Column>
      <Column
        align="end"
        as={isCustom && ButtonPressAnimation}
        onPress={handlePress}
        reanimatedButton
        wrapperStyle={{ flex: 1 }}
      >
        <Row align="end" css={margin(3, 0)} justify="end" marginBottom={1}>
          <GasSpeedLabelPager
            label={selectedGasPriceOption}
            options={options}
            showPager={!inputFocused}
            theme={theme}
          />
        </Row>

        <Row justify="space-between">
          <BottomRightLabel
            formatter={formatBottomRightLabel}
            theme={theme}
            value={{
              estimatedTimeValue,
              price: selectedGasPrice?.value?.display,
            }}
          />
        </Row>
      </Column>
    </Container>
  );
};

export default magicMemo(GasSpeedButton, 'type');
