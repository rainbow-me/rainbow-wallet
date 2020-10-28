import React from 'react';
import styled from 'styled-components/primitives';
import ChartHeaderTitle from './ChartHeaderTitle';
import { ChartYLabel } from '@rainbow-me/animated-charts';
import { chartExpandedAvailable } from '@rainbow-me/config/experimental';
import { fonts, fontWithWidth } from '@rainbow-me/styles';

const Label = styled(ChartYLabel)`
  ${fontWithWidth(fonts.weight.bold)};
  font-size: ${fonts.size.big};
  letter-spacing: ${fonts.letterSpacing.roundedTight};
  font-variant: tabular-nums;
  text-align: right;
  ${android &&
    `margin-top: -8;
  margin-bottom: -16;`}
`;

export function formatUSD(value, priceSharedValue) {
  'worklet';
  if (!value) {
    return priceSharedValue?.value || '';
  }
  if (value === 'undefined') {
    return '$0.00';
  }
  const decimals =
    Number(value) < 1
      ? Math.min(
          8,
          value
            .toString()
            .slice(2)
            .slice('')
            .search(/[^0]/g) + 3
        )
      : 2;

  const res = `$${Number(value)
    .toFixed(decimals)
    .toLocaleString('en-US', {
      currency: 'USD',
    })}`;
  const vals = res.split('.');
  if (vals.length === 2) {
    return vals[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + vals[1];
  }
  return res;
}

export default function ChartPriceLabel({
  defaultValue,
  isNoPriceData,
  priceSharedValue,
}) {
  return !chartExpandedAvailable || isNoPriceData ? (
    <ChartHeaderTitle>{defaultValue}</ChartHeaderTitle>
  ) : (
    <Label
      format={value => {
        'worklet';
        return formatUSD(value, priceSharedValue);
      }}
    />
  );
}
