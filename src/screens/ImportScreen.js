import MaskedView from '@react-native-community/masked-view';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  processColor,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import Reanimated, { Easing } from 'react-native-reanimated';
import styled from 'styled-components/native';
import { useMemoOne } from 'use-memo-one';

import GreyNeonRainbow from '../assets/rainbows/greyneon.png';
import LightRainbow from '../assets/rainbows/light.png';
import LiquidRainbow from '../assets/rainbows/liquid.png';
import NeonRainbow from '../assets/rainbows/neon.png';
import PixelRainbow from '../assets/rainbows/pixel.png';

import TouchableBackdrop from '../components/TouchableBackdrop';
import { ButtonPressAnimation } from '../components/animations';
import Button from '../components/buttons/Button';
import { Icon } from '../components/icons';
import { Input } from '../components/inputs';
import { Centered, Page, RowWithMargins } from '../components/layout';
import { useDimensions } from '../hooks';
import { colors, padding, position, shadow } from '../styles';

const {
  block,
  not,
  Clock,
  clockRunning,
  set,
  and,
  cond,
  add,
  multiply,
  lessThan,
  abs,
  modulo,
  round,
  divide,
  sub,
  color,
  startClock,
  timing,
  Value: RValue,
} = Reanimated;

const ButtonContainer = styled.View.attrs({
  pointerEvents: 'none',
})`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`;

const ButtonContent = styled(RowWithMargins).attrs({
  align: 'center',
  margin: -2.5,
})`
  align-self: center;
  height: 100%;
  margin-right: ${({ type }) => (type === 'addCash' ? 9 : 0)};
  padding-bottom: 4;
`;

const ButtonLabel = styled(Text).attrs({
  align: 'center',
  color: colors.black,
  letterSpacing: 'roundedMedium',
  size: 'larger',
  weight: 'bold',
})``;

const Shadow = styled(Reanimated.View)`
  ${shadow.build(0, 10, 30, colors.dark, 1)};
  background-color: ${colors.white};
  border-radius: ${({ height }) => height / 2};
  height: ${({ height }) => height};
  opacity: 0.2;
  position: absolute;
  width: ${({ width }) => width};
`;

const RainbowButton = ({ height = 56, onPress, shadowStyle }) => {
  return (
    <ButtonPressAnimation onPress={onPress} scaleTo={0.9}>
      <Shadow height={height} width="100%" style={shadowStyle} />
      <ButtonContainer height={height} width="100%">
        <ButtonContent>
          <ButtonLabel>Sample</ButtonLabel>
        </ButtonContent>
      </ButtonContainer>
    </ButtonPressAnimation>
  );
};

const Container = styled.View`
  ${StyleSheet.absoluteFillObject};
  background-color: white;
  justify-content: center
  align-items: center
`;

const ContentWrapper = styled(Animated.View)`
  z-index: 10
  width: 100%;
  height: 180;
  padding-horizontal: 40
  align-items: center
  justify-content: space-between;
`;

const ButtonWrapper = styled(Animated.View)`
  width: 100%;
`;

const INITIAL_SIZE = 200;

export const useAnimatedValue = initialValue => {
  const value = useRef();

  if (!value.current) {
    value.current = new Animated.Value(initialValue);
  }

  return value;
};

export const useReanimatedValue = initialValue => {
  const value = useRef();

  if (!value.current) {
    value.current = new RValue(initialValue);
  }

  return value;
};

const rainbows = [
  {
    rotate: '150deg',
    scale: 0.9,
    source: GreyNeonRainbow,
    x: -100,
    y: -150,
  },
  {
    initialRotate: '-50deg',
    rotate: '0deg',
    scale: 0.8,
    source: NeonRainbow,
    x: 160,
    y: 300,
  },
  {
    rotate: '360deg',
    scale: 1.1,
    source: PixelRainbow,
    x: 160,
    y: -200,
  },
  {
    initialRotate: '300deg',
    rotate: '330deg',
    scale: 0.6,
    source: LightRainbow,
    x: -160,
    y: 200,
  },
  { rotate: '75deg', scale: 0.8, source: LiquidRainbow, x: 40, y: 200 },
];

const traverseRainbows = animatedValue =>
  rainbows.map(
    ({
      source,
      x = 0,
      y = 0,
      rotate = '0deg',
      initialRotate = '0deg',
      scale = 1,
    }) => ({
      source,
      style: {
        transform: [
          {
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, x],
            }),
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, y],
            }),
          },
          {
            rotate: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [initialRotate, rotate],
            }),
          },
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, scale],
            }),
          },
        ],
      },
    })
  );

const RainbowImage = styled(Animated.Image)`
  width: ${INITIAL_SIZE}
  height: ${INITIAL_SIZE}
  position: absolute
`;

function match(condsAndResPairs, offset = 0) {
  if (condsAndResPairs.length - offset === 1) {
    return condsAndResPairs[offset];
  } else if (condsAndResPairs.length - offset === 0) {
    return undefined;
  }
  return cond(
    condsAndResPairs[offset],
    condsAndResPairs[offset + 1],
    match(condsAndResPairs, offset + 2)
  );
}

function runTiming(value) {
  const clock = new Clock();
  const state = {
    finished: new RValue(0),
    frameTime: new RValue(0),
    position: new RValue(0),
    time: new RValue(0),
  };

  const config = {
    duration: 5000,
    easing: Easing.linear,
    toValue: new RValue(1),
  };

  return block([
    cond(and(not(state.finished), clockRunning(clock)), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.frameTime, 0),
      set(config.toValue, 360),
      startClock(clock),
    ]),
    timing(clock, state, config),
    state.position,
  ]);
}

function colorHSV(h, s, v, fromShadow) {
  const c = multiply(v, s);
  const hh = divide(h, 60);
  const x = multiply(c, sub(1, abs(sub(modulo(hh, 2), 1))));

  const m = sub(v, c);

  const colorRGB = (r, g, b) =>
    // from some reason there's a different bit shifting with shadows
    fromShadow
      ? color(
          round(multiply(255, add(g, m))),
          round(multiply(255, add(b, m))),
          255,
          divide(round(multiply(256, add(r, m))), 256)
        )
      : color(
          round(multiply(255, add(r, m))),
          round(multiply(255, add(g, m))),
          round(multiply(255, add(b, m)))
        );

  return match([
    lessThan(h, 60),
    colorRGB(c, x, 0),
    lessThan(h, 120),
    colorRGB(x, c, 0),
    lessThan(h, 180),
    colorRGB(0, c, x),
    lessThan(h, 240),
    colorRGB(0, x, c),
    lessThan(h, 300),
    colorRGB(x, 0, c),
    colorRGB(c, 0, x),
  ]);
}

export default function ImportScreen() {
  const [visible, setVisible] = useState(false);
  const animatedValue = useAnimatedValue(0);
  const contentAnimattion = useAnimatedValue(1);

  const traversedRainbows = useMemoOne(
    () => traverseRainbows(animatedValue.current),
    [animatedValue]
  );
  useEffect(() => {
    if (!visible) {
      return;
    }
    // Animated.sequence([
    //   Animated.spring(contentAnimattion.current, {
    //     toValue: 1,
    //     useNativeDriver: true,
    //     damping: 5,
    //     restDisplacementThreshold: 0.1,
    //     restSpeedThreshold: 0.002,
    //   }),
    //   ,
    // ]).start();
    Animated.sequence([
      Animated.spring(animatedValue.current, {
        toValue: 1,
        useNativeDriver: true,
        damping: 5,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(contentAnimattion.current, {
            toValue: 0.9,
            useNativeDriver: true,
          }),
          Animated.timing(contentAnimattion.current, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ])
      ),
      // Animated.loop(
      //   Animated.sequence([
      //     Animated.timing(animatedValue.current, {
      //       toValue: 0.8,
      //       duration: 800,
      //       useNativeDriver: true,
      //     }),
      //     Animated.timing(animatedValue.current, {
      //       toValue: 1,
      //       duration: 800,
      //       useNativeDriver: true,
      //     }),
      //   ])
      // ),
      // Animated.loop(
      //   Animated.spring(animatedValue.current, {
      //     toValue: 1,
      //     useNativeDriver: true,
      //     damping: 5,
      //   })
      // ),
    ]).start();
  }, [animatedValue, visible]);

  const buttonStyle = useMemoOne(
    () => ({ transform: [{ scale: contentAnimattion.current }] }),
    [contentAnimattion]
  );

  const contentStyle = useMemoOne(
    () => ({
      transform: [
        {
          scale: animatedValue.current.interpolate({
            inputRange: [0, 2],
            outputRange: [0.8, 1.3],
          }),
        },
      ],
    }),
    [contentAnimattion]
  );

  const rValue = useReanimatedValue(0);

  const shadowColor = useMemoOne(() => {
    const color = colorHSV(runTiming(rValue.current), 1, 1, true);
    return {
      shadowColor: color,
    };
  }, [rValue]);

  const textStyle = useMemoOne(() => {
    const color = colorHSV(runTiming(rValue.current), 1, 1, false);
    return {
      color,
    };
  }, [rValue]);

  return (
    <Container>
      {visible &&
        traversedRainbows.map(({ source, style }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <RainbowImage source={source} style={style} key={`rainbow${index}`} />
        ))}

      <TouchableOpacity
        onPress={() => setVisible(!visible)}
        style={{ position: 'absolute', top: 100 }}
      />
      <ContentWrapper style={contentStyle}>
        <Reanimated.Text style={textStyle}>raibnow</Reanimated.Text>
        <ButtonWrapper style={buttonStyle}>
          <RainbowButton shadowStyle={shadowColor} />
        </ButtonWrapper>
        <ButtonWrapper>
          <RainbowButton shadowStyle={shadowColor} />
        </ButtonWrapper>
      </ContentWrapper>
    </Container>
  );
}
