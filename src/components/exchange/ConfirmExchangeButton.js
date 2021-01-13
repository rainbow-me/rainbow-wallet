import React, { useMemo } from 'react';
import styled from 'styled-components/primitives';
import { HoldToAuthorizeButton } from '../buttons';
import { Centered } from '../layout';
import ExchangeModalTypes from '@rainbow-me/helpers/exchangeModalTypes';
import {
  useColorForAsset,
  useGas,
  useSlippageDetails,
} from '@rainbow-me/hooks';
import { Navigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';
import { colors, padding } from '@rainbow-me/styles';

const paddingHorizontal = 19;
const shadows = [[0, 10, 30, colors.black, 0.4]];

const Container = styled(Centered)`
  ${padding(5, paddingHorizontal, 0)};
  width: 100%;
`;

export default function ConfirmExchangeButton({
  asset,
  disabled,
  isAuthorizing,
  isSufficientBalance,
  isSufficientLiquidity,
  onSubmit,
  slippage,
  testID,
  type = ExchangeModalTypes.swap,
  ...props
}) {
  const colorForAsset = useColorForAsset(asset);
  const { isSufficientGas } = useGas();
  const { isHighSlippage } = useSlippageDetails(slippage);
  const { name: routeName } = Navigation.getActiveRoute();

  let label = '';
  if (type === ExchangeModalTypes.deposit) {
    label = 'Hold to Deposit';
  } else if (type === ExchangeModalTypes.swap) {
    label = 'Hold to Swap';
  } else if (type === ExchangeModalTypes.withdrawal) {
    label = 'Hold to Withdraw';
  }

  if (!isSufficientBalance) {
    label = 'Insufficient Funds';
  } else if (!isSufficientLiquidity) {
    label = 'Insufficient Liquidity';
  } else if (!isSufficientGas) {
    label = 'Insufficient ETH';
  } else if (isHighSlippage) {
    label = 'Swap Anyway';
  } else if (disabled) {
    label = 'Enter an Amount';
  }

  const isDisabled =
    disabled ||
    !isSufficientBalance ||
    !isSufficientGas ||
    !isSufficientLiquidity;

  const shadowsForAsset = useMemo(
    () => [
      [0, 10, 30, colors.dark, 0.2],
      [0, 5, 15, colorForAsset, 0.4],
    ],
    [colorForAsset]
  );

  const isRouteSwapDetails = useMemo(
    () => routeName === Routes.SWAP_DETAILS_SHEET,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Container>
      <HoldToAuthorizeButton
        backgroundColor={colorForAsset}
        disabled={isDisabled}
        disabledBackgroundColor={colors.grey20}
        flex={1}
        hideInnerBorder
        isAuthorizing={isAuthorizing}
        label={label}
        onLongPress={onSubmit}
        parentHorizontalPadding={paddingHorizontal}
        shadows={isRouteSwapDetails ? shadowsForAsset : shadows}
        showBiometryIcon={!isDisabled}
        testID={testID}
        theme="dark"
        {...props}
      />
    </Container>
  );
}
