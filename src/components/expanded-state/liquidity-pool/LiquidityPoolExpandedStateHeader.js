import { join, map } from 'lodash';
import React, { useMemo } from 'react';
import styled from 'styled-components/primitives';
import { useColorForAssets } from '../../../hooks/useColorForAsset';
import { magicMemo } from '../../../utils';
import { CoinIcon } from '../../coin-icon';
import { ColumnWithMargins, Row } from '../../layout';
import { TruncatedText } from '../../text';
import { colors, padding } from '@rainbow-me/styles';

const Container = styled(ColumnWithMargins).attrs({
  margin: 12,
})`
  ${padding(0, 19, 24)};
`;

const PerShareText = styled(TruncatedText).attrs({
  color: colors.blueGreyDark50,
  letterSpacing: 'roundedMedium',
  size: 'larger',
  weight: 'regular',
})``;

const Subtitle = styled(TruncatedText).attrs({
  color: colors.alpha(colors.blueGreyDark, 0.8),
  letterSpacing: 'roundedTight',
  size: 'larger',
  weight: 'medium',
})``;

const Title = styled(TruncatedText).attrs(({ color = colors.dark }) => ({
  color,
  letterSpacing: 'roundedTight',
  size: 'big',
  weight: 'bold',
}))``;

function LiquidityPoolExpandedStateHeader({ assets, pricePerShare }) {
  const title = `${join(
    map(assets, asset => asset.symbol),
    '-'
  )} Pool`;
  const colors = useColorForAssets(assets);

  const shadows = useMemo(() => {
    return map(assets, (asset, index) => {
      const coinIconShadow = [
        [0, 4, 12, asset.shadowColor || colors[index], 0.3],
      ];
      return coinIconShadow;
    });
  }, [assets, colors]);

  return (
    <Container>
      <Row align="center">
        {map(assets, (asset, index) => {
          return (
            <CoinIcon
              address={asset.address}
              shadow={shadows[index]}
              symbol={asset.symbol}
            />
          );
        })}
      </Row>
      <Row align="center" justify="space-between">
        <ColumnWithMargins align="start" margin={2}>
          <Title>{title}</Title>
          <Subtitle>
            {pricePerShare}
            <PerShareText> per share</PerShareText>
          </Subtitle>
        </ColumnWithMargins>
      </Row>
    </Container>
  );
}

export default magicMemo(LiquidityPoolExpandedStateHeader, 'asset');
