import { findIndex } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { RecyclerListView } from 'recyclerlistview';
import StickyContainer from 'recyclerlistview/dist/reactnative/core/StickyContainer';
import styled from 'styled-components';
import { AssetListHeaderHeight } from '../AssetListHeader';
import { ViewTypes } from '../RecyclerViewTypes';
import RecyclerAssetListSharedState from './RecyclerAssetListSharedState';
import { deviceUtils } from '@rainbow-me/utils';

const defaultIndices = [0];

const StyledRecyclerListView = styled(RecyclerListView)`
  background-color: ${({ theme: { colors } }) => colors.white};
  display: flex;
  flex: 1;
  min-height: 1;
`;

const shouldComponentDidUpdate = ({
  nextSections,
  lastSections,
  nextOpenFamilyTabs,
  lastOpenFamilyTabs,
  dataProvider,
  scrollToOffset,
  paddingBottom,
  nextIsCoinListEdited,
  lastIsCoinListEdited,
}) => {
  let collectibles = {};
  let prevCollectibles = {};

  nextSections.forEach(section => {
    if (section.collectibles) {
      collectibles = section;
    }
  });

  lastSections.forEach(section => {
    if (section.collectibles) {
      prevCollectibles = section;
    }
  });

  const bottomHorizonOfScreen =
    ((RecyclerAssetListSharedState.rlv &&
      RecyclerAssetListSharedState.rlv.getCurrentScrollOffset()) ||
      0) + RecyclerAssetListSharedState.globalDeviceDimensions;

  // Auto-scroll to opened family logic 👇
  if (nextOpenFamilyTabs !== lastOpenFamilyTabs && collectibles.data) {
    let i = 0;
    while (i < collectibles.data.length) {
      if (
        nextOpenFamilyTabs[collectibles.data[i].familyName] === true &&
        !lastOpenFamilyTabs[collectibles.data[i].familyName]
      ) {
        const safeIndex = i;
        const safeCollectibles = collectibles;
        const familyIndex = findIndex(
          dataProvider.getAllData(),
          function (data) {
            return (
              data.item?.familyName ===
              safeCollectibles.data[safeIndex].familyName
            );
          }
        );

        const focusedFamilyItem = dataProvider.getAllData()[familyIndex].item;
        const focusedFamilyHeight = ViewTypes.UNIQUE_TOKEN_ROW.calculateHeight({
          amountOfRows: Math.ceil(Number(focusedFamilyItem.childrenAmount) / 2),
          isFirst: false,
          isHeader: true,
          isOpen: true,
        });

        const startOfDesiredComponent =
          RecyclerAssetListSharedState.rlv.getLayout(familyIndex).y -
          AssetListHeaderHeight;

        if (
          focusedFamilyHeight <
          RecyclerAssetListSharedState.globalDeviceDimensions
        ) {
          const endOfDesiredComponent =
            startOfDesiredComponent +
            focusedFamilyHeight +
            AssetListHeaderHeight;

          if (endOfDesiredComponent > bottomHorizonOfScreen) {
            scrollToOffset(
              endOfDesiredComponent -
                RecyclerAssetListSharedState.globalDeviceDimensions,
              true
            );
          }
        } else {
          scrollToOffset(startOfDesiredComponent, true);
        }

        break;
      }
      i++;
    }
  }

  // Auto-scroll to end of the list if something was closed/disappeared 👇
  if (
    RecyclerAssetListSharedState.rlv &&
    RecyclerAssetListSharedState.rlv.getContentDimension().height <
      bottomHorizonOfScreen +
        ViewTypes.FOOTER.calculateHeight({
          paddingBottom: paddingBottom || 0,
        }) &&
    RecyclerAssetListSharedState.rlv.getCurrentScrollOffset() > 0 &&
    (!nextIsCoinListEdited || (!lastIsCoinListEdited && nextIsCoinListEdited))
  ) {
    requestAnimationFrame(() => {
      RecyclerAssetListSharedState.rlv &&
        RecyclerAssetListSharedState.rlv.scrollToEnd({ animated: true });
    });
  }

  // Auto-scroll to showcase family if something was added/removed 👇
  if (
    collectibles.data &&
    prevCollectibles.data &&
    collectibles.data[0]?.familyName === 'Showcase' &&
    (collectibles.data[0]?.childrenAmount !==
      prevCollectibles.data[0]?.childrenAmount ||
      prevCollectibles.data[0]?.familyName !== 'Showcase')
  ) {
    const familyIndex = findIndex(dataProvider.getAllData(), function (data) {
      return data.item?.familyName === 'Showcase';
    });

    const startOfDesiredComponent =
      RecyclerAssetListSharedState.rlv.getLayout(familyIndex).y -
      AssetListHeaderHeight;
    scrollToOffset(startOfDesiredComponent, true);
  }
};

export default class RecyclerAssetList extends Component {
  static propTypes = {
    externalScrollView: PropTypes.any,
    hideHeader: PropTypes.bool,
    nativeCurrency: PropTypes.string,
    openFamilyTabs: PropTypes.object,
    openInvestmentCards: PropTypes.object,
    openSavings: PropTypes.bool,
    openSmallBalances: PropTypes.bool,
    paddingBottom: PropTypes.number,
    renderAheadOffset: PropTypes.number,
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        balances: PropTypes.bool,
        collectibles: PropTypes.bool,
        data: PropTypes.array.isRequired,
        header: PropTypes.shape({
          title: PropTypes.string,
          totalItems: PropTypes.number,
          totalValue: PropTypes.string,
        }),
        perData: PropTypes.object,
        pools: PropTypes.bool,
        renderItem: PropTypes.func.isRequired,
        type: PropTypes.string,
      })
    ),
  };

  static defaultProps = {
    renderAheadOffset: deviceUtils.dimensions.height,
  };

  componentDidUpdate(prevProps) {
    const {
      isCoinListEdited: nextIsCoinListEdited,
      sections: nextSections,
      openFamilyTabs: nextOpenFamilyTabs,
      dataProvider,
      scrollToOffset,
      paddingBottom,
    } = this.props;
    const {
      isCoinListEdited: lastIsCoinListEdited,
      sections: lastSections,
      openFamilyTabs: lastOpenFamilyTabs,
    } = prevProps;
    return shouldComponentDidUpdate({
      dataProvider,
      lastIsCoinListEdited,
      lastOpenFamilyTabs,
      lastSections,
      nextIsCoinListEdited,
      nextOpenFamilyTabs,
      nextSections,
      paddingBottom,
      scrollToOffset,
    });
  }

  // TODO: Needs to be introduced.
  //  getStableId = index => {
  //    const { dataProvider } = this.state;
  //    const row = get(dataProvider.getAllData(), index);
  //
  //    if (row.item && row.item.familyName) {
  //      return `family_${row.item.familyName}_${row.item.familyId}`;
  //    }
  //
  //    if (row.isHeader && (!row.item || !row.item.familyName)) {
  //      return `header_${row.title}`;
  //    }
  //
  //    if (row.item && row.item.address) {
  //      return `balance_${row.item.address}`;
  //    }
  //
  //    if (row.item && row.item.uniqueId) {
  //      return `pool_${row.item.uniqueId}`;
  //    }
  //
  //    if (row.item && row.item.smallBalancesContainer) {
  //      return `smallBalancesContainer`;
  //    }
  //
  //    if (row.item && row.item.coinDivider) {
  //      return `coinDivider`;
  //    }
  //
  //    if (row.item && row.item.savingsContainer) {
  //      return `savingsContainer`;
  //    }
  //
  //    if (index === dataProvider.getAllData().length - 1) {
  //      return 'footer';
  //    }
  //
  //    return index;
  //  };

  handleListRef = ref => {
    RecyclerAssetListSharedState.rlv = ref;
  };

  render() {
    const {
      animator,
      externalScrollView,
      renderAheadOffset,
      isCoinListEdited,
      layoutProvider,
      stickyComponentsIndices,
      onScroll,
      scrollViewProps,
      scrollIndicatorInsets,
      extendedState,
      dataProvider,
      rowRenderer,
      stickyRowRenderer,
    } = this.props;
    return (
      <>
        <StickyContainer
          overrideRowRenderer={stickyRowRenderer}
          stickyHeaderIndices={
            isCoinListEdited ? defaultIndices : stickyComponentsIndices
          }
        >
          <StyledRecyclerListView
            dataProvider={dataProvider}
            extendedState={extendedState}
            externalScrollView={externalScrollView}
            itemAnimator={animator}
            layoutProvider={layoutProvider}
            onScroll={onScroll}
            ref={this.handleListRef}
            renderAheadOffset={renderAheadOffset}
            rowRenderer={rowRenderer}
            scrollIndicatorInsets={scrollIndicatorInsets}
            scrollViewProps={scrollViewProps}
          />
        </StickyContainer>
      </>
    );
  }
}
