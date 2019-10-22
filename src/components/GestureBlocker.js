import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  State,
  PanGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { deviceUtils } from '../utils';
import Animated from 'react-native-reanimated';

const { call, cond, event, eq } = Animated;

const { height } = deviceUtils.dimensions;

const GestureBlocker = ({ type, onHandlerStateChange }) => {
  const tab = React.useRef(null);
  const pan = React.useRef(null);

  const handleGestureBlockerStateChange = event([
    {
      nativeEvent: {
        state: s =>
          cond(
            cond(cond(eq(State.END, s), call([], () => onHandlerStateChange())))
          ),
      },
    },
  ]);

  return (
    <View
      style={{
        height,
        position: 'absolute',
        [type]: -height,
        width: '100%',
        zIndex: 10,
      }}
    >
      <PanGestureHandler
        ref={pan}
        simultaneousHandlers={tab}
        minDeltaX={1}
        minDeltaY={1}
      >
        <Animated.View style={StyleSheet.absoluteFillObject}>
          <TapGestureHandler
            ref={tab}
            simultaneousHandlers={pan}
            onHandlerStateChange={handleGestureBlockerStateChange}
          >
            <Animated.View style={StyleSheet.absoluteFillObject} />
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

GestureBlocker.propTypes = {
  onHandlerStateChange: PropTypes.func,
  type: PropTypes.string,
};

export default React.memo(GestureBlocker);
