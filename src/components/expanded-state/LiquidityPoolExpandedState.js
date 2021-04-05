import { useRoute } from '@react-navigation/core';
import { toLower } from 'lodash';
import React, { Fragment, useEffect, useMemo } from 'react';
import { getSoftMenuBarHeight } from 'react-native-extra-dimensions-android';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { UniBalanceHeightDifference } from '../../hooks/charts/useChartThrottledPoints';
import deviceUtils from '../../utils/deviceUtils';
import EdgeFade from '../discover-sheet/EdgeFade';
import { PoolValue } from '../investment-cards/PoolValue';
import { Column, Row } from '../layout';

import {
  DepositActionButton,
  SheetActionButtonRow,
  SheetDivider,
  SlackSheet,
  WithdrawActionButton,
} from '../sheet';
import { Text } from '../text';
import { TokenInfoItem, TokenInfoRow, TokenInfoSection } from '../token-info';
import { Chart } from '../value-chart';
import UnderlyingAsset from './unique-token/UnderlyingAsset';
import { ChartPathProvider } from '@rainbow-me/animated-charts';
import { useTheme } from '@rainbow-me/context';
import { toChecksumAddress } from '@rainbow-me/handlers/web3';
import chartTypes from '@rainbow-me/helpers/chartTypes';
import {
  useAccountSettings,
  useAsset,
  useChartThrottledPoints,
  useColorForAsset,
  usePoolDetails,
  useTotalFeeEarnedPerAsset,
} from '@rainbow-me/hooks';
import { emitAssetRequest } from '@rainbow-me/redux/explorer';

import { ETH_ADDRESS } from '@rainbow-me/references';
import { magicMemo, safeAreaInsetValues } from '@rainbow-me/utils';

const Spacer = styled.View`
  height: ${safeAreaInsetValues.bottom + 20};
`;

export const underlyingAssetsHeight = 70;
const heightWithoutChart = 452 + (android ? 20 - getSoftMenuBarHeight() : 0);
const heightWithChart = heightWithoutChart + 293;

export const initialLiquidityPoolExpandedStateSheetHeight = Math.min(
  deviceUtils.dimensions.height,
  heightWithChart + underlyingAssetsHeight
);

const formatTokenAddress = address => {
  if (!address || toLower(address) === ETH_ADDRESS) {
    return 'ETH';
  }
  return toChecksumAddress(address);
};

const APYWrapper = styled.View`
  flex: 1;
  height: 23;
  padding-top: 3;
  transform: translateY(${android ? -6 : 0}px);
`;

const UnderlyingAssetsWrapper = styled.View`
  margin-horizontal: 19;
  margin-top: 12;
`;

const CarouselWrapper = styled.View`
  margin-top: 6;
`;

const Carousel = styled.ScrollView.attrs({
  contentContainerStyle: { paddingHorizontal: 6 },
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})``;

const CarouselItem = styled(TokenInfoItem).attrs(({ theme: { colors } }) => ({
  color: colors.alpha(colors.blueGreyDark, 0.8),
  letterSpacing: 'roundedTighter',
}))`
  margin-horizontal: 13;
`;

const LiquidityPoolExpandedState = () => {
  const { params } = useRoute();
  const { asset } = params;
  const {
    tokenNames,
    tokens,
    totalNativeDisplay,
    type,
    uniBalance,
    native,
  } = asset;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(emitAssetRequest(tokens));
  }, [dispatch, tokens]);

  const tokenType = type === 'uniswap' ? 'UNI-V1' : 'UNI-V2';
  const uniBalanceLabel = `${uniBalance} ${tokenType}`;
  const { nativeCurrency } = useAccountSettings();

  const earnedFee = useTotalFeeEarnedPerAsset(asset?.address);
  const totalFeeEarned = useMemo(
    () =>
      earnedFee?.toLocaleString('en-US', {
        currency: nativeCurrency,
        style: 'currency',
      }),
    [earnedFee, nativeCurrency]
  );

  const details = usePoolDetails(asset.address);
  const { annualized_fees: fee, volume, nativeLiquidity } = details || {};

  const tokenAddresses = useMemo(() => {
    return tokens?.map(token => formatTokenAddress(token.address));
  }, [tokens]);

  const token0 = useAsset({
    address: toLower(tokenAddresses?.[0]),
    type: 'token',
  });

  const token1 = useAsset({
    address: toLower(tokenAddresses?.[1]),
    type: 'token',
  });

  const {
    chart,
    chartData,
    chartType,
    color,
    fetchingCharts,
    initialChartDataLabels,
    showChart,
    throttledData,
  } = useChartThrottledPoints({
    asset,
    heightWithChart: Math.min(
      heightWithChart + (token1 && token0 ? underlyingAssetsHeight : 0),
      deviceUtils.dimensions.height
    ),
    heightWithoutChart: Math.min(
      heightWithoutChart + (token1 && token0 ? underlyingAssetsHeight : 0),
      deviceUtils.dimensions.height
    ),
    isPool: true,
    secondStore: true,
    uniBalance: !!uniBalance,
  });

  const liquidityPoolExpandedStateSheetHeight =
    (ios || showChart ? heightWithChart : heightWithoutChart) +
    (android && 44) -
    (uniBalance ? 0 : UniBalanceHeightDifference);

  const chartDataLabels = useMemo(() => {
    if (chartType === chartTypes.month && params?.asset?.profit30d) {
      let overrideChartDataLabels = { ...initialChartDataLabels };
      overrideChartDataLabels.latestChange = params.asset.profit30d;
      return overrideChartDataLabels;
    }
    return initialChartDataLabels;
  }, [chartType, initialChartDataLabels, params?.asset?.profit30d]);

  const { colors } = useTheme();

  const color0 = useColorForAsset(token0);
  const color1 = useColorForAsset(token1);

  const half = !Number(native?.balance?.amount)
    ? 'Half'
    : (native?.balance?.amount / 2)?.toLocaleString('en-US', {
        currency: nativeCurrency,
        style: 'currency',
      });

  return (
    <SlackSheet
      additionalTopPadding={android}
      contentHeight={liquidityPoolExpandedStateSheetHeight}
      {...(ios && { height: '100%' })}
      scrollEnabled
    >
      <ChartPathProvider data={throttledData}>
        <Chart
          {...chartData}
          {...chartDataLabels}
          asset={asset}
          chart={chart}
          chartType={chartType}
          color={color}
          fetchingCharts={fetchingCharts}
          isPool
          nativePoints={chart}
          overrideValue={
            chartType === chartTypes.month && params?.asset?.profit30d
          }
          showChart={showChart}
          throttledData={throttledData}
        />
      </ChartPathProvider>
      {uniBalance ? (
        <Fragment>
          <SheetDivider />
          <TokenInfoSection>
            <TokenInfoRow>
              <TokenInfoItem title="Pool shares">
                {uniBalanceLabel}
              </TokenInfoItem>
              <TokenInfoItem title="Total value" weight="bold">
                {totalNativeDisplay}
              </TokenInfoItem>
            </TokenInfoRow>
          </TokenInfoSection>
          <SheetActionButtonRow>
            {tokenAddresses?.length > 0 && (
              <WithdrawActionButton
                symbol={tokenNames}
                token1Address={tokenAddresses[0]}
                token2Address={tokenAddresses[1]}
                weight="bold"
              />
            )}
            {tokenAddresses?.length > 0 && (
              <DepositActionButton
                symbol={tokenNames}
                token1Address={tokenAddresses[0]}
                token2Address={tokenAddresses[1]}
                weight="bold"
              />
            )}
          </SheetActionButtonRow>
        </Fragment>
      ) : (
        <SheetActionButtonRow>
          <DepositActionButton
            fullWidth
            symbol={tokenNames}
            token1Address={tokenAddresses[0]}
            token2Address={tokenAddresses[1]}
            weight="bold"
          />
        </SheetActionButtonRow>
      )}
      <CarouselWrapper>
        <Carousel>
          <CarouselItem loading={!fee} title="Annualized fees">
            <APYWrapper>
              <PoolValue
                simple
                size="larger"
                type="annualized_fees"
                value={Number(fee)}
              />
            </APYWrapper>
          </CarouselItem>
          {totalFeeEarned && (
            <CarouselItem loading={!totalFeeEarned} title="Fees earned">
              {totalFeeEarned}
            </CarouselItem>
          )}
          <CarouselItem loading={!volume} title="24h pool volume">
            {volume}
          </CarouselItem>
          <CarouselItem loading={!nativeLiquidity} title="Pool size">
            {nativeLiquidity}
          </CarouselItem>
        </Carousel>
        <EdgeFade />
      </CarouselWrapper>

      {token0 && token1 && (
        <>
          <Row marginHorizontal={19} marginTop={27}>
            <Column align="start" flex={1}>
              <Text
                color={colors.alpha(colors.blueGreyDark, 0.5)}
                letterSpacing="roundedMedium"
                size="smedium"
                weight="semibold"
              >
                Underlying tokens
              </Text>
            </Column>
            <Column align="end" flex={1}>
              <Text
                align="right"
                color={colors.alpha(colors.blueGreyDark, 0.5)}
                letterSpacing="roundedMedium"
                size="smedium"
                weight="semibold"
              >
                Pool makeup
              </Text>
            </Column>
          </Row>
          <UnderlyingAssetsWrapper>
            <UnderlyingAsset
              address={tokenAddresses[0]}
              change={token0?.native?.change.replace('-', '')}
              changeVisible={!uniBalance}
              color={color0}
              isPositive={token0?.price?.relative_change_24h > 0}
              name={
                uniBalance
                  ? `${tokens[0].value} ${tokens[0].symbol}`
                  : tokens[0].name
              }
              percentageAllocation={15}
              pricePerUnitFormatted={half}
              symbol={tokens[0].symbol}
            />
            <UnderlyingAsset
              address={tokenAddresses[1]}
              change={token1?.native?.change.replace('-', '')}
              changeVisible={!uniBalance}
              color={color1}
              isPositive={token1?.price?.relative_change_24h > 0}
              name={
                uniBalance
                  ? `${tokens[1].value} ${tokens[1].symbol}`
                  : tokens[1].name
              }
              percentageAllocation={15}
              pricePerUnitFormatted={half}
              symbol={tokens[1].symbol}
            />
            <Spacer />
          </UnderlyingAssetsWrapper>
        </>
      )}
    </SlackSheet>
  );
};

export default magicMemo(LiquidityPoolExpandedState, 'asset');
