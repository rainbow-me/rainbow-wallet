import React from 'react';
import { UIActivityIndicator } from 'react-native-indicators';
import styled from 'styled-components/primitives';
import { Centered } from './layout';
import { colors_NOT_REACTIVE, position } from '@rainbow-me/styles';

const Container = styled(Centered)`
  ${({ size }) => position.size(Number(size))};
`;

export default function ActivityIndicator({
  color = colors_NOT_REACTIVE.blueGreyDark,
  isInteraction = false,
  size = 25,
  ...props
}) {
  return (
    <Container size={size} {...props}>
      <UIActivityIndicator
        color={color}
        interaction={isInteraction}
        size={size}
      />
    </Container>
  );
}
