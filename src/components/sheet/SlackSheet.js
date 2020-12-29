import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/primitives';
import { useDimensions } from '../../hooks';
import deviceUtils from '../../utils/deviceUtils';
import { Centered } from '../layout';
import SheetHandleFixedToTop, {
  SheetHandleFixedToTopHeight,
} from './SheetHandleFixedToTop';
import { useNavigation } from '@rainbow-me/navigation';
import { colors } from '@rainbow-me/styles';

const deviceHeight = deviceUtils.dimensions.height;

const calculateTopPosition = (
  deferredHeight,
  contentHeight,
  additionalTopPadding
) => {
  if (ios) {
    return '';
  }
  if (deferredHeight) return '';
  const top =
    contentHeight && additionalTopPadding ? deviceHeight - contentHeight : 0;
  return `top: ${top};`;
};

const Container = styled(Centered).attrs({ direction: 'column' })`
  background-color: ${({ backgroundColor }) => backgroundColor};
  bottom: 0;
  left: 0;
  overflow: hidden;
  position: absolute;
  ${android ? 'border-radius: 20;' : ''}
  ${({ deferredHeight, contentHeight, additionalTopPadding }) =>
    calculateTopPosition(
      deferredHeight,
      contentHeight,
      additionalTopPadding
    )}
  right: 0;
`;

const Content = styled(Animated.ScrollView).attrs({
  directionalLockEnabled: true,
  keyboardShouldPersistTaps: 'always',
  scrollEventThrottle: 16,
})`
  background-color: ${({ backgroundColor }) => backgroundColor};
  ${({ contentHeight, deviceHeight }) =>
    contentHeight ? `height: ${deviceHeight + contentHeight}` : null};
  padding-top: ${SheetHandleFixedToTopHeight};
  width: 100%;
`;

const Whitespace = styled.View`
  background-color: ${({ backgroundColor }) => backgroundColor};
  flex: 1;
  height: ${({ deviceHeight }) => deviceHeight};
  z-index: -1;
`;

export default function SlackSheet({
  backgroundColor = colors.white,
  borderRadius = 30,
  children,
  contentHeight,
  hideHandle = false,
  renderHeader,
  scrollEnabled = true,
  additionalTopPadding = false,
  deferredHeight = false,
  ...props
}) {
  const yPosition = useSharedValue(0);
  const { height: deviceHeight } = useDimensions();
  const { goBack } = useNavigation();
  const insets = useSafeArea();
  const bottomInset = useMemo(
    () => (insets.bottom || scrollEnabled ? 42 : 30),
    [insets.bottom, scrollEnabled]
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom: bottomInset,
    }),
    [bottomInset]
  );

  const scrollIndicatorInsets = useMemo(
    () => ({
      bottom: bottomInset,
      top: borderRadius + SheetHandleFixedToTopHeight,
    }),
    [borderRadius, bottomInset]
  );

  const scrollHandler = useAnimatedScrollHandler(event => {
    yPosition.value = event.contentOffset.y;
  });

  return (
    <>
      {android ? (
        <Pressable onPress={goBack} style={[StyleSheet.absoluteFillObject]} />
      ) : null}
      <Container
        backgroundColor={backgroundColor}
        {...(android && {
          additionalTopPadding,
          contentHeight,
          deferredHeight,
        })}
        {...props}
      >
        {android && (
          <TouchableWithoutFeedback
            style={[StyleSheet.absoluteFillObject, { backgroundColor }]}
          >
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor }]}
            />
          </TouchableWithoutFeedback>
        )}
        {!hideHandle && <SheetHandleFixedToTop showBlur={scrollEnabled} />}
        <View style={{ backgroundColor, height: '100%', width: '100%' }}>
          {renderHeader?.(yPosition)}
          <Content
            backgroundColor={backgroundColor}
            contentContainerStyle={scrollEnabled && contentContainerStyle}
            contentHeight={contentHeight}
            deviceHeight={deviceHeight}
            directionalLockEnabled
            onScroll={scrollHandler}
            scrollEnabled={scrollEnabled}
            scrollIndicatorInsets={scrollIndicatorInsets}
          >
            {children}
            {!scrollEnabled && (
              <Whitespace
                backgroundColor={backgroundColor}
                deviceHeight={deviceHeight}
              />
            )}
          </Content>
        </View>
      </Container>
    </>
  );
}
