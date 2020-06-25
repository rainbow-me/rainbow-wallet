import AnimatedNumber from '@rainbow-me/react-native-animated-number';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import {
  NativeModules,
  Platform,
  requireNativeComponent,
  StyleSheet,
} from 'react-native';
import isRainbowTextAvailable from '../../helpers/isRainbowTextAvailable';
import { formatSavingsAmount, isSymbolStablecoin } from '../../helpers/savings';
import { colors, fonts } from '../../styles';

const RainbowText = requireNativeComponent('RainbowText');
const { RainbowText: RainbowTextManager } = NativeModules;
console.log(RainbowTextManager);

const sx = StyleSheet.create({
  animatedNumberAndroid: {
    height: 40,
    paddingLeft: 35,
    position: 'absolute',
  },
  text: {
    color: colors.dark,
    flex: 1,
    fontFamily: fonts.family.SFProRounded,
    fontSize: parseFloat(fonts.size.lmedium),
    fontWeight: fonts.weight.bold,
    height: 30,
    letterSpacing: fonts.letterSpacing.roundedTightest,
    marginBottom: 0.5,
    marginRight: 4,
    textAlign: 'left',
  },
});

const TextComponent = isRainbowTextAvailable ? RainbowText : AnimatedNumber;

const SavingsListRowAnimatedNumber = ({
  initialValue,
  interval,
  steps,
  symbol,
  value,
}) => {
  const formatter = useCallback(
    val =>
      isSymbolStablecoin(symbol)
        ? `$${formatSavingsAmount(val)}`
        : `${formatSavingsAmount(val)} ${symbol}`,
    [symbol]
  );

  return (
    <TextComponent
      formatter={formatter}
      initialValue={Number(initialValue)}
      steps={steps}
      style={[
        sx.text,
        Platform.OS === 'android' ? sx.animatedNumberAndroid : null,
      ]}
      time={interval}
      value={Number(value)}
      text={formatter(Number(value))}
      animationConfig={{
        decimals: 10,
        initialValue: Number(value),
        interval: 60,
        isSymbolStablecoin: isSymbolStablecoin(symbol),
        stepPerDay: Number(value) - Number(initialValue),
        symbol,
      }}
    />
  );
};

SavingsListRowAnimatedNumber.propTypes = {
  initialValue: PropTypes.string,
  interval: PropTypes.number,
  steps: PropTypes.number,
  symbol: PropTypes.string,
  value: PropTypes.string,
};

export default React.memo(SavingsListRowAnimatedNumber);
