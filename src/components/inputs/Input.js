import React from 'react';
import { TextInput as TextInputPrimitive } from 'react-native';
import styled from 'styled-components/primitives';
import { buildTextStyles, colors } from '@rainbow-me/styles';

const TextInput = styled(TextInputPrimitive).attrs({
  selectionColor: colors.appleBlue,
})`
  /* our Input uses same styling system as our <Text /> component */
  ${buildTextStyles};
`;

const Input = (
  {
    allowFontScaling = false,
    autoCapitalize = 'none',
    autoCorrect = false,
    keyboardType,
    placeholderTextColor = colors.placeholder,
    spellCheck = true,
    testID,
    ...props
  },
  ref
) => {
  return (
    <TextInput
      {...props}
      allowFontScaling={allowFontScaling}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      keyboardType={keyboardType}
      placeholderTextColor={placeholderTextColor}
      ref={ref}
      spellCheck={spellCheck}
      testID={testID}
    />
  );
};

export default React.forwardRef(Input);
