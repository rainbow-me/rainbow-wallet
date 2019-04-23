import React from 'react';
import PropTypes from 'prop-types';
import {
  TextInput, KeyboardAvoidingView, Keyboard,
} from 'react-native';
import {
  compose,
  withHandlers,
  withProps,
  withState,
} from 'recompact';
import styled from 'styled-components/primitives/dist/styled-components-primitives.esm';
import { withAccountAssets } from '@rainbow-me/rainbow-common';
import {
  Centered, Column, FlexItem, Row,
} from '../components/layout';
import { ModalHeader } from '../components/modal';
import withBlockedHorizontalSwipe from '../hoc/withBlockedHorizontalSwipe';
import { colors, shadow } from '../styles';
import { Icon } from '../components/icons';
import FloatingPanels from '../components/expanded-state/FloatingPanels';
import FloatingPanel from '../components/expanded-state/FloatingPanel';
import CoinRow from '../components/coin-row/CoinRow';
import CoinName from '../components/coin-row/CoinName';
import Button from '../components/buttons/Button';
import { Text } from '../components/text';
import GestureBlocker from '../components/GestureBlocker';

const Container = styled(Centered).attrs({ direction: 'column' })`
  background-color: transparent;
  height: 100%;
`;

const ConfirmExchngeButton = styled(Button)`
  ${shadow.build(0, 6, 10, colors.purple, 0.14)}
  background-color: ${colors.appleBlue};
  width:  100%;
  padding-horizontal: 5;
  align-self: center
`;

const TopRow = ({ navigateToCurrencySelection, amount, changeAmount, symbol }) => (
  <Row align="center" justify="space-between">
    <FlexItem flex={1}>
      <CoinName
        component={TextInput}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={changeAmount}
      />
    </FlexItem>
    <FlexItem flex={0}>
      <Button
        onPress={navigateToCurrencySelection}
        padding={0}
      >
        <Text
          color="white"
          weight="semibold"
          style={{ fontSize: 12 }}
        >
          {symbol}
        </Text>
        <Icon
          size={8}
          color="white"
          direction="right"
          name="caret"
        />
      </Button>
    </FlexItem>
  </Row>
);

TopRow.propTypes = {
  amount: PropTypes.number,
  changeAmount: PropTypes.func,
  navigateToCurrencySelection: PropTypes.func,
  symbol: PropTypes.func,
};


const SettingsModal = ({
  amountToExchange,
  onPressConfirmExchange,
  onPressSelectCurrency,
  onPressSelectTargetCurrency,
  selectedCurrency,
  selectedTargetCurrency,
  setAmountToExchange,
  ...rest
}) => {
  return (
    <KeyboardAvoidingView behavior="padding">
      <Container>
        <FloatingPanels>
          <GestureBlocker type='top'/>
          <FloatingPanel>
            <Column align="center">
              <Icon
                color={colors.sendScreen.grey}
                name="handle"
                style={{ height: 11, marginTop: 13 }}
              />
              <ModalHeader
                showDoneButton={false}
                title="Swap"
              />
              <CoinRow
                amount={amountToExchange}
                changeAmount={setAmountToExchange}
                navigateToCurrencySelection={onPressSelectCurrency}
                bottomRowRender={() => null}
                topRowRender={TopRow}
                symbol={selectedCurrency}
              />
              <CoinRow
                amount={amountToExchange}
                changeAmount={setAmountToExchange}
                navigateToCurrencySelection={onPressSelectTargetCurrency}
                bottomRowRender={() => null}
                topRowRender={TopRow}
                symbol={selectedTargetCurrency}
              />
            </Column>
          </FloatingPanel>
          <GestureBlocker type='bottom'/>
          <ConfirmExchngeButton
            onPress={onPressConfirmExchange}
          >
            Hold to swap
          </ConfirmExchngeButton>
        </FloatingPanels>
      </Container>
    </KeyboardAvoidingView>
  );
};


SettingsModal.propTypes = {
  amountToExchange: PropTypes.number,
  onPressConfirmExchange: PropTypes.func,
  onPressSelectCurrency: PropTypes.func,
  onPressSelectTargetCurrency: PropTypes.func,
  selectedCurrency: PropTypes.number,
  selectedTargetCurrency: PropTypes.number,
  setAmountToExchange: PropTypes.func,
  setSelectedCurrency: PropTypes.func,
  setSelectedTargetCurrency: PropTypes.func,
};

const withMockedPrices = withProps({
  currencyToDollar: 3,
  targetCurrencyToDollar: 2,
});

export default compose(
  withAccountAssets,
  withState('amountToExchange', 'setAmountToExchange', '0'),
  withState('selectedCurrency', 'setSelectedCurrency', null),
  withState('selectedTargetCurrency', 'setSelectedTargetCurrency', 'ETH'),
  withProps(({
    selectedCurrency,
    allAssets: [{ symbol }],
  }) => ({ selectedCurrency: selectedCurrency || symbol })),
  withHandlers({
    onPressConfirmExchange:
      ({ navigation }) => () => {
        Keyboard.dismiss();
        navigation.navigate('WalletScreen');
      },
    onPressSelectCurrency: ({ navigation, setSelectedCurrency }) => () => {
      Keyboard.dismiss();
      navigation.navigate('CurrencySelectScreen', { setSelectedCurrency });
    },
    onPressSelectTargetCurrency:
      ({ navigation, setSelectedTargetCurrency }) => () => {
        Keyboard.dismiss();
        navigation.navigate('CurrencySelectScreen', { setSelectedCurrency: setSelectedTargetCurrency })
      },
  }),
  withBlockedHorizontalSwipe,
  withMockedPrices,
)(SettingsModal);
