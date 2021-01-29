import React, { useCallback } from 'react';
import styled from 'styled-components/primitives';
import { colors, fonts } from '../../styles';
import { magicMemo, measureText } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import { CoinIcon } from '../coin-icon';
import { Centered, ColumnWithMargins, RowWithMargins } from '../layout';
import BottomRowText from './BottomRowText';
import CoinName from './CoinName';

const TopMoverCoinIconSize = 36;
const TopMoverCoinRowMargin = 8;

const TopMoverTitle = styled(CoinName).attrs({
  color: colors.alpha(colors.blueGreyDark, 0.8),
  paddingRight: 0,
  weight: 'semibold',
})``;

export const measureBottomRowText = text =>
  measureText(text, {
    fontSize: parseFloat(fonts.size.smedium),
    fontWeight: fonts.weight.medium,
  });

export const measureTopRowText = text =>
  measureText(text, {
    fontSize: parseFloat(fonts.size.lmedium),
    fontWeight: fonts.weight.semibold,
    letterSpacing: fonts.letterSpacing.roundedMedium,
  });

const PADDING_BETWEEN_ITEMS = 26;

export const measureTopMoverCoinRow = async ({
  change,
  native,
  truncatedName,
}) => {
  const { width: nameWidth } = await measureTopRowText(truncatedName);
  const { width: priceWidth } = await measureBottomRowText(
    native?.price?.display ?? ''
  );
  const { width: changeWidth } = await measureBottomRowText(change);

  const textWidth = Math.max(nameWidth, priceWidth + changeWidth);

  return (
    PADDING_BETWEEN_ITEMS +
    [TopMoverCoinIconSize, textWidth].reduce(
      (acc, val) => acc + val + TopMoverCoinRowMargin
    )
  );
};

const TopMoverCoinRow = asset => {
  const {
    address,
    change,
    onPress,
    native: {
      price: { display },
    },
    symbol,
    truncatedName,
  } = asset;
  const handlePress = useCallback(() => {
    onPress?.(asset);
  }, [asset, onPress]);

  return (
    <ButtonPressAnimation
      // we observe that while integrating with
      // gesture handler event gets always cancelled on iOS
      // Therefore, in this case under given condition
      // onPress should be called
      onCancel={({ nativeEvent: { state, close } }) =>
        state === 5 && close && handlePress()
      }
      onPress={handlePress}
      scaleTo={0.925}
    >
      <RowWithMargins margin={TopMoverCoinRowMargin}>
        <Centered>
          <CoinIcon
            address={address}
            size={TopMoverCoinIconSize}
            symbol={symbol}
          />
        </Centered>
        <ColumnWithMargins margin={2}>
          <TopMoverTitle>{truncatedName}</TopMoverTitle>
          <BottomRowText weight="medium">
            {display}
            <BottomRowText
              color={parseFloat(change) > 0 ? colors.green : colors.red}
              weight="medium"
            >
              {change}
            </BottomRowText>
          </BottomRowText>
        </ColumnWithMargins>
      </RowWithMargins>
    </ButtonPressAnimation>
  );
};

export default magicMemo(TopMoverCoinRow, ['change', 'name', 'native']);
