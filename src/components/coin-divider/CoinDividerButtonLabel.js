import React from 'react';
import styled from 'styled-components/primitives';
import { withThemeContext } from '../../context/ThemeContext';
import { magicMemo } from '../../utils';
import { OpacityToggler } from '../animations';
import { Text } from '../text';

const LabelText = withThemeContext(styled(Text).attrs(({ colors }) => ({
  color: colors.alpha(colors.blueGreyDark, 0.6),
  letterSpacing: 'roundedTight',
  size: 'lmedium',
  weight: 'bold',
}))`
  position: absolute;
  top: ${android ? -15.25 : -10.25};
`);

const CoinDividerButtonLabel = ({ isVisible, label }) => (
  <OpacityToggler isVisible={isVisible}>
    <LabelText>{label}</LabelText>
  </OpacityToggler>
);

export default magicMemo(CoinDividerButtonLabel, 'isVisible');
