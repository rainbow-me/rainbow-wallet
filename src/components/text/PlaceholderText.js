import React, { useImperativeHandle, useState } from 'react';
import styled from 'styled-components/primitives';
import Text from './Text';
import { colors_NOT_REACTIVE } from '@rainbow-me/styles';

const Placeholder = styled(Text).attrs({
  align: 'center',
  color: colors_NOT_REACTIVE.alpha(colors_NOT_REACTIVE.blueGreyDark, 0.3),
  size: 'big',
  weight: 'semibold',
})`
  margin-bottom: ${android ? -48 : -27};
  width: 100%;
`;

const PlaceholderText = (props, ref) => {
  const [value, updateValue] = useState(' ');
  useImperativeHandle(ref, () => ({ updateValue }));
  return <Placeholder ref={ref}>{value}</Placeholder>;
};

export default React.forwardRef(PlaceholderText);
