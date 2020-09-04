import React from 'react';
import { UIActivityIndicator } from 'react-native-indicators';
import styled from 'styled-components/primitives';
import { colors, position } from '@rainbow-me/styles';

const Container = styled.View`
  ${({ size }) => position.size(size)};
`;

export default function ActivityIndicator({
  color = colors.blueGreyDark,
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
