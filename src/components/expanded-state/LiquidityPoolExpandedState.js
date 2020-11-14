import { join, map, toLower } from 'lodash';
import React, { useMemo } from 'react';
import { tokenOverrides } from '../../references';
import { magicMemo } from '../../utils';
import {
  DepositActionButton,
  SheetActionButtonRow,
  SheetDivider,
  SlackSheet,
  WithdrawActionButton,
} from '../sheet';
import {
  TokenInfoBalanceValue,
  TokenInfoItem,
  TokenInfoRow,
  TokenInfoSection,
} from '../token-info';
import { LiquidityPoolExpandedStateHeader } from './liquidity-pool';

export const LiquidityPoolExpandedStateSheetHeight = 369 + (android ? 80 : 0);

const LiquidityPoolExpandedState = ({
  asset: {
    pricePerShare,
    tokenSymbols,
    totalNativeDisplay,
    uniBalance,
    ...liquidityInfo
  },
}) => {
  const lpTokenName = join(tokenSymbols, '-');
  const tokenAssets = useMemo(() => {
    const { tokens } = liquidityInfo;
    return map(tokens, token => ({
      ...token,
      ...(token.address ? tokenOverrides[toLower(token.address)] : {}),
      value: token.balance,
    }));
  }, [liquidityInfo]);

  return (
    <SlackSheet
      additionalTopPadding={android}
      contentHeight={LiquidityPoolExpandedStateSheetHeight}
    >
      <LiquidityPoolExpandedStateHeader
        assets={tokenAssets}
        pricePerShare={pricePerShare}
      />
      <SheetDivider />
      <TokenInfoSection>
        <TokenInfoRow>
          {map(tokenAssets, tokenAsset => {
            return (
              <TokenInfoItem
                asset={tokenAsset}
                title={`${tokenAsset.symbol} balance`}
              >
                <TokenInfoBalanceValue />
              </TokenInfoItem>
            );
          })}
        </TokenInfoRow>
        <TokenInfoRow>
          <TokenInfoItem title="Pool shares">{uniBalance}</TokenInfoItem>
          <TokenInfoItem title="Total value">
            {totalNativeDisplay}
          </TokenInfoItem>
        </TokenInfoRow>
      </TokenInfoSection>
      <SheetActionButtonRow>
        <WithdrawActionButton symbol={lpTokenName} />
        <DepositActionButton symbol={lpTokenName} />
      </SheetActionButtonRow>
    </SlackSheet>
  );
};

export default magicMemo(LiquidityPoolExpandedState, 'asset');
