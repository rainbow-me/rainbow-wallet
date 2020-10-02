import React from 'react';
import {
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler';

export default function ButtonPressAnimation({
  children,
  disabled,
  onLongPress,
  onPress,
  onPressStart,
  style,
  opacity,
}) {
  const Touchable = opacity ? TouchableOpacity : TouchableNativeFeedback;
  return (
    <Touchable
      disabled={disabled}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressStart={onPressStart}
      style={style}
    >
      {children}
    </Touchable>
  );
}
