import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/primitives';
import { colors, padding } from '../../styles';
import { Row } from '../layout';
import BalanceText from './BalanceText';
import BottomRowText from './BottomRowText';
import CoinRow from './CoinRow';
import { compose } from 'recompact';
import { withAccountSettings } from '../../hoc';
import withCoinListEdited from '../../hoc/withCoinListEdited';

const CoinRowPaddingTop = 9;
const CoinRowPaddingBottom = 9;

const Container = styled(Row)`
  ${padding(CoinRowPaddingTop, 19, CoinRowPaddingBottom, 19)}
  width: 100%;
  flex-direction: column;
  align-items: flex-end;
  width: 130px;
  height: ${CoinRow.height};
  justify-content: space-between;
`;

const formatPercentageString = percentString =>
  percentString
    ? percentString
        .split('-')
        .join('- ')
        .split('%')
        .join(' %')
    : '-';

const CoinRowInfo = ({
  isCoinListEdited,
  isHidden,
  native,
  nativeCurrencySymbol,
}) => {
  const nativeDisplay = get(native, 'balance.display');

  const percentChange = get(native, 'change');
  const percentageChangeDisplay = formatPercentageString(percentChange);
  const isPositive = percentChange && percentageChangeDisplay.charAt(0) !== '-';
  return (
    <Container
      style={{ height: 59, opacity: isHidden && isCoinListEdited ? 0.4 : 1 }}
    >
      <BalanceText
        style={
          isHidden && isCoinListEdited
            ? {
                textDecorationLine: 'line-through',
                textDecorationStyle: 'solid',
              }
            : {}
        }
        color={nativeDisplay ? null : colors.alpha(colors.blueGreyDark, 0.5)}
        numberOfLines={1}
      >
        {nativeDisplay || `${nativeCurrencySymbol}0.00`}
      </BalanceText>
      <BottomRowText
        align="right"
        color={
          isPositive
            ? colors.green
            : !percentChange
            ? colors.alpha(colors.blueGreyDark, 0.2)
            : null
        }
        style={{
          marginBottom: 0.5,
        }}
      >
        {percentageChangeDisplay}
      </BottomRowText>
    </Container>
  );
};

CoinRowInfo.propTypes = {
  native: PropTypes.object,
  nativeCurrencySymbol: PropTypes.string,
};

export default compose(withAccountSettings, withCoinListEdited)(CoinRowInfo);
