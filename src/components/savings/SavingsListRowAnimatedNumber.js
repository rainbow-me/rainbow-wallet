import AnimatedNumber from '@rainbow-me/react-native-animated-number';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { Platform, requireNativeComponent, StyleSheet } from 'react-native';
import useRainbowTextAvailable from '../../helpers/isRainbowTextAvailable';
import { formatSavingsAmount, isSymbolStablecoin } from '../../helpers/savings';
import { colors, fonts } from '@rainbow-me/styles';

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

  const isRainbowTextAvailable = useRainbowTextAvailable();
  const TextComponent = isRainbowTextAvailable
    ? requireNativeComponent('RainbowText')
    : AnimatedNumber;

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
      animationConfig={{
        color: '#20df20', // HEX
        decimals: 10,
        duration: 500, // in intervals
        initialValue: Number(initialValue),
        interval,
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
