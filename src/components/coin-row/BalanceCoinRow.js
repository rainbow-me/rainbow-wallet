import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { View } from 'react-native';
import { compose, shouldUpdate, withHandlers } from 'recompact';
import { buildAssetUniqueIdentifier } from '../../helpers/assets';
import {
  withAccountSettings,
  withOpenBalances,
  withEditOptions,
} from '../../hoc';
import { isNewValueForPath, deviceUtils } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import { FlexItem, Row } from '../layout';
import BottomRowText from './BottomRowText';
import CoinName from './CoinName';
import CoinRow from './CoinRow';
import CoinCheckButton from './CoinCheckButton';
import withCoinListEdited from '../../hoc/withCoinListEdited';
import CoinRowInfo from './CoinRowInfo';

const editTranslateOffset = 32;

const BottomRow = ({ balance }) => {
  return (
    <Fragment>
      <BottomRowText>{balance.display}</BottomRowText>
    </Fragment>
  );
};

BottomRow.propTypes = {
  balance: PropTypes.shape({ display: PropTypes.string }),
};

const TopRow = ({ name }) => {
  return (
    <Row align="center" justify="space-between">
      <FlexItem flex={1}>
        <CoinName>{name}</CoinName>
      </FlexItem>
    </Row>
  );
};

TopRow.propTypes = {
  name: PropTypes.string,
};

const BalanceCoinRow = ({
  isFirstCoinRow,
  item,
  onPress,
  onPressSend,
  isCoinListEdited,
  nativeCurrencySymbol,
  ...props
}) =>
  item.isSmall ? (
    <View width={deviceUtils.dimensions.width}>
      <ButtonPressAnimation onPress={onPress} scaleTo={0.96}>
        <Row>
          <View
            left={isCoinListEdited ? editTranslateOffset : 0}
            width={
              deviceUtils.dimensions.width -
              80 -
              (isCoinListEdited ? editTranslateOffset : 0)
            }
          >
            <CoinRow
              onPress={onPress}
              onPressSend={onPressSend}
              {...item}
              {...props}
              bottomRowRender={BottomRow}
              topRowRender={TopRow}
            />
          </View>
          <View position="absolute" right={3}>
            <CoinRowInfo
              isHidden={item.isHidden}
              native={item.native}
              nativeCurrencySymbol={nativeCurrencySymbol}
            />
          </View>
        </Row>
      </ButtonPressAnimation>
    </View>
  ) : (
    <FlexItem
      flex={1}
      style={{
        justifyContent: isFirstCoinRow ? 'flex-end' : 'flex-start',
      }}
    >
      <ButtonPressAnimation onPress={onPress} scaleTo={0.96}>
        <Row>
          <View
            left={isCoinListEdited ? editTranslateOffset : 0}
            width={
              deviceUtils.dimensions.width -
              80 -
              (isCoinListEdited ? editTranslateOffset : 0)
            }
          >
            <CoinRow
              onPress={onPress}
              onPressSend={onPressSend}
              {...item}
              {...props}
              bottomRowRender={BottomRow}
              topRowRender={TopRow}
            />
          </View>
          <View position="absolute" right={3}>
            <CoinRowInfo
              native={item.native}
              nativeCurrencySymbol={nativeCurrencySymbol}
            />
          </View>
        </Row>
      </ButtonPressAnimation>
      {isCoinListEdited ? <CoinCheckButton isAbsolute {...item} /> : null}
    </FlexItem>
  );

BalanceCoinRow.propTypes = {
  isFirstCoinRow: PropTypes.bool,
  item: PropTypes.object,
  nativeCurrency: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  onPressSend: PropTypes.func,
  openSmallBalances: PropTypes.bool,
};

export default compose(
  withAccountSettings,
  withOpenBalances,
  withEditOptions,
  withCoinListEdited,
  withHandlers({
    onPress: ({ item, onPress }) => () => {
      if (onPress) {
        onPress(item);
      }
    },
    onPressSend: ({ item, onPressSend }) => () => {
      if (onPressSend) {
        onPressSend(item);
      }
    },
  }),
  shouldUpdate((props, nextProps) => {
    const isChangeInOpenAssets =
      props.openSmallBalances !== nextProps.openSmallBalances;
    const itemIdentifier = buildAssetUniqueIdentifier(props.item);
    const nextItemIdentifier = buildAssetUniqueIdentifier(nextProps.item);

    const isNewItem = itemIdentifier !== nextItemIdentifier;
    const isNewNativeCurrency = isNewValueForPath(
      props,
      nextProps,
      'nativeCurrency'
    );
    const isEdited = isNewValueForPath(props, nextProps, 'isCoinListEdited');
    const isPinned = isNewValueForPath(props, nextProps, 'item.isPinned');
    const isHidden = isNewValueForPath(props, nextProps, 'item.isHidden');

    return (
      isNewItem ||
      isNewNativeCurrency ||
      isChangeInOpenAssets ||
      isEdited ||
      isPinned ||
      isHidden
    );
  })
)(BalanceCoinRow);
