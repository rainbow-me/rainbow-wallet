import { concat, get, isEmpty, map } from 'lodash';
import PropTypes from 'prop-types';
import { produce } from 'immer';
import React, { Component } from 'react';
import Animated from 'react-native-reanimated';
import { NavigationEvents, withNavigationFocus } from 'react-navigation';
import { compose, mapProps } from 'recompact';
import { withUniswapAssets } from '../hoc';
import { position } from '../styles';
import { isNewValueForObjectPaths } from '../utils';
import { filterList } from '../utils/search';
import { interpolate } from '../components/animations';
import {
  CurrencySelectionList,
  CurrencySelectModalHeader,
  ExchangeSearch,
} from '../components/exchange';
import GestureBlocker from '../components/GestureBlocker';
import { Column, KeyboardFixedOpenLayout } from '../components/layout';
import { Modal } from '../components/modal';
import { exchangeModalBorderRadius } from './ExchangeModal';

const appendAssetWithUniqueId = asset => ({
  ...asset,
  uniqueId: `${asset.address}`,
});

const normalizeAssetItems = assetsArray =>
  map(assetsArray, appendAssetWithUniqueId);

export const CurrencySelectionTypes = {
  input: 'input',
  output: 'output',
};

class CurrencySelectModal extends Component {
  static propTypes = {
    curatedAssets: PropTypes.array,
    favorites: PropTypes.array,
    globalHighLiquidityAssets: PropTypes.array,
    globalLowLiquidityAssets: PropTypes.array,
    navigation: PropTypes.object,
    transitionPosition: PropTypes.object,
    type: PropTypes.oneOf(Object.keys(CurrencySelectionTypes)),
    uniswapAssetsInWallet: PropTypes.arrayOf(PropTypes.object),
  };

  state = {
    assetsToFavoriteQueue: {},
    searchQuery: '',
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    const isNewType = this.props.type !== nextProps.type;

    const isFocused = this.props.navigation.getParam('focused', false);
    const willBeFocused = nextProps.navigation.getParam('focused', false);

    const isNewProps = isNewValueForObjectPaths(
      { ...this.props, isFocused },
      { ...nextProps, isFocused: willBeFocused },
      ['isFocused', 'type']
    );

    const isNewState = isNewValueForObjectPaths(this.state, nextState, [
      'searchQuery',
      'assetsToFavoriteQueue',
    ]);

    return isNewType || isNewProps || isNewState;
  };

  dangerouslySetIsGestureBlocked = isGestureBlocked => {
    // dangerouslyGetParent is a bad pattern in general, but in this case is exactly what we expect
    this.props.navigation
      .dangerouslyGetParent()
      .setParams({ isGestureBlocked });
  };

  handleChangeSearchQuery = searchQuery => {
    this.setState({ searchQuery });
  };

  handleFavoriteAsset = (assetAddress, isFavorited) => {
    this.setState(
      produce(draft => {
        draft.assetsToFavoriteQueue[assetAddress] = isFavorited;
      })
    );
  };

  handlePressBack = () => {
    this.props.navigation.navigate('MainExchangeScreen');
  };

  handleSelectAsset = item => {
    const { navigation } = this.props;
    // It's a bit weird and I'm not sure why on invoking
    // navigation.getParam('onSelectCurrency')(item)
    // but this small hack seems to be a legit workaround
    const onSelectCurrency = navigation.getParam('onSelectCurrency');
    onSelectCurrency(item);
    navigation.navigate('MainExchangeScreen');
  };

  handleDidBlur = () => {
    const { uniswapUpdateFavorites } = this.props;
    const { assetsToFavoriteQueue } = this.state;

    Object.keys(assetsToFavoriteQueue).map(assetToFavorite =>
      uniswapUpdateFavorites(
        assetToFavorite,
        assetsToFavoriteQueue[assetToFavorite]
      )
    );

    this.handleChangeSearchQuery('');
  };

  handleWillBlur = () => this.dangerouslySetIsGestureBlocked(false);

  handleWillFocus = () => {
    this.dangerouslySetIsGestureBlocked(true);
    if (this.searchInputRef.current) {
      this.searchInputRef.current.focus();
    }
  };

  searchInputRef = React.createRef();

  render = () => {
    const {
      favorites,
      globalHighLiquidityAssets,
      globalLowLiquidityAssets,
      curatedAssets,
      transitionPosition,
      type,
      uniswapAssetsInWallet,
    } = this.props;

    if (type === null || type === undefined) {
      return null;
    }

    const { searchQuery } = this.state;

    let headerTitle = '';
    let filteredList = concat(favorites, curatedAssets);
    if (type === CurrencySelectionTypes.input) {
      headerTitle = 'Swap';
      filteredList = uniswapAssetsInWallet;
      if (!isEmpty(searchQuery)) {
        filteredList = filterList(uniswapAssetsInWallet, searchQuery, [
          'symbol',
          'name',
        ]);
      }
    } else if (type === CurrencySelectionTypes.output) {
      headerTitle = 'Receive';
      const curatedSection = concat(favorites, curatedAssets);
      // if (!isEmpty(searchQuery)) {
      const [filteredBest, filteredHigh, filteredLow] = map(
        [curatedSection, globalHighLiquidityAssets, globalLowLiquidityAssets],
        section => {
          return filterList(section, searchQuery, ['symbol', 'name']);
        }
      );
      // filteredList = concat(filteredBest, filteredHigh, filteredLow);
      filteredList = [
        { data: filteredBest, title: 'Best' },
        { data: filteredHigh, title: 'Good' },
        { data: filteredLow, title: 'More results' },
      ];
      // }
    }

    const isFocused = this.props.navigation.getParam('focused', false);

    return (
      <KeyboardFixedOpenLayout>
        <Animated.View
          style={{
            ...position.sizeAsObject('100%'),
            opacity: interpolate(transitionPosition, {
              extrapolate: Animated.Extrapolate.CLAMP,
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          }}
        >
          <Modal
            containerPadding={0}
            height="100%"
            overflow="hidden"
            radius={exchangeModalBorderRadius}
          >
            <GestureBlocker type="top" />
            <NavigationEvents
              onDidBlur={this.handleDidBlur}
              onWillBlur={this.handleWillBlur}
              onWillFocus={this.handleWillFocus}
            />
            <Column flex={1}>
              <CurrencySelectModalHeader
                onPressBack={this.handlePressBack}
                title={headerTitle}
              />
              <ExchangeSearch
                autoFocus={false}
                onChangeText={this.handleChangeSearchQuery}
                ref={this.searchInputRef}
                searchQuery={searchQuery}
              />
              <CurrencySelectionList
                itemProps={{
                  onFavoriteAsset: this.handleFavoriteAsset,
                  onPress: this.handleSelectAsset,
                  showBalance: type === CurrencySelectionTypes.input,
                  showFavoriteButton: type === CurrencySelectionTypes.output,
                }}
                listItems={filteredList}
                showList={isFocused}
                type={type}
              />
            </Column>
            <GestureBlocker type="bottom" />
          </Modal>
        </Animated.View>
      </KeyboardFixedOpenLayout>
    );
  };
}

export default compose(
  withNavigationFocus,
  withUniswapAssets,
  mapProps(
    ({
      curatedAssets,
      favorites,
      globalHighLiquidityAssets,
      globalLowLiquidityAssets,
      navigation,
      ...props
    }) => ({
      ...props,
      curatedAssets: normalizeAssetItems(curatedAssets),
      favorites: normalizeAssetItems(favorites),
      globalHighLiquidityAssets: normalizeAssetItems(globalHighLiquidityAssets),
      globalLowLiquidityAssets: normalizeAssetItems(globalLowLiquidityAssets),
      navigation,
      transitionPosition: get(navigation, 'state.params.position'),
      type: get(navigation, 'state.params.type', null),
    })
  )
)(CurrencySelectModal);
