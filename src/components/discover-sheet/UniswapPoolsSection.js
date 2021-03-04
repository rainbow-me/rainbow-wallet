import { sortBy, times } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, LayoutAnimation } from 'react-native';
import styled from 'styled-components';
import { SORT_DIRECTION } from '../../hooks/useUniswapPools';
import { ButtonPressAnimation } from '../animations';
import { AssetListItemSkeleton } from '../asset-list';
import UniswapLogo from '../icons/UniswapLogo';
import { UniswapPoolListRow } from '../investment-cards';
import { Column, Row } from '../layout';
import { Text } from '../text';
import EdgeFade from './EdgeFade';
import { useUniswapPools } from '@rainbow-me/hooks';

const PoolListButton = styled(ButtonPressAnimation).attrs({
  scaleTo: 0.96,
})`
  margin-right: 16px;
  ${({ selected, theme: { colors }, titleColor }) =>
    selected
      ? `
        background-color: ${colors.alpha(titleColor, 0.06)};
        border-radius: 12px;
        height: 30px;
        padding-horizontal: 8px;
        padding-top: ${ios ? 6 : 4}px;
      `
      : `
        padding-top: ${ios ? 6 : 4}px;
      `}
`;

const ListName = styled(Text)`
  margin-left: 3px;
  margin-top: ${ios ? -4.5 : 0}px;
`;

const renderUniswapPoolListRow = item => (
  <UniswapPoolListRow assetType="uniswap" item={item} key={item.uniqueId} />
);

const listData = [
  {
    id: 'liquidity',
    name: 'Liquidity',
  },
  {
    id: 'annualized_fees',
    name: 'Annualized fees',
  },
  {
    id: 'profit30d',
    name: '30d profit',
  },
  {
    id: 'oneDayVolumeUSD',
    name: '24h volume',
  },
];

export default function UniswapPools() {
  const listRef = useRef(null);
  const { colors, isDarkMode } = useTheme();
  const [selectedList, setSelectedList] = useState(listData[0].id);
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.DESC);
  const { pairs, error } = useUniswapPools(selectedList, sortDirection);
  const handleSwitchList = useCallback(
    (id, index) => {
      // This crashes the app on android
      // that's why it's disabled...
      ios &&
        LayoutAnimation.configureNext(
          LayoutAnimation.create(200, 'easeInEaseOut', 'opacity')
        );
      if (id === selectedList) {
        setSortDirection(
          sortDirection === SORT_DIRECTION.DESC
            ? SORT_DIRECTION.ASC
            : SORT_DIRECTION.DESC
        );
      } else {
        setSelectedList(id);
        sortDirection === SORT_DIRECTION.ASC &&
          setSortDirection(SORT_DIRECTION.DESC);
        listRef.current?.scrollToIndex({
          animated: true,
          index,
          viewPosition: 0.5,
        });
      }
    },
    [selectedList, sortDirection]
  );

  const getTitleColor = useCallback(
    (selected, listId) => {
      if (!selected) {
        return colors.alpha(colors.blueGreyDark, 0.5);
      }

      switch (listId) {
        case 'annualized_fees':
          return colors.green;
        case 'profit30d':
          return sortDirection === SORT_DIRECTION.ASC
            ? colors.red
            : colors.green;
        case 'oneDayVolumeUSD':
          return colors.swapPurple;
        default:
          return colors.appleBlue;
      }
    },
    [colors, sortDirection]
  );

  const renderItem = useCallback(
    ({ item: list, index }) => (
      <PoolListButton
        key={`list-${list.id}`}
        onPress={() => handleSwitchList(list.id, index)}
        selected={selectedList === list.id}
        titleColor={getTitleColor(selectedList === list.id, list.id)}
      >
        <Row>
          <ListName
            color={getTitleColor(selectedList === list.id, list.id)}
            lineHeight="paragraphSmall"
            size="lmedium"
            weight="bold"
          >
            {list.name}{' '}
            {selectedList === list.id
              ? sortDirection === 'desc'
                ? '􀄩'
                : '􀄨'
              : ''}
          </ListName>
        </Row>
      </PoolListButton>
    ),
    [getTitleColor, handleSwitchList, selectedList, sortDirection]
  );

  const pairRows = useMemo(() => {
    if (!pairs) return [];

    let sortedPairs = sortBy(pairs, selectedList).filter(
      pair => selectedList !== 'profit30d' || pair.profit30d !== undefined
    );
    if (sortDirection === 'desc') {
      sortedPairs = sortedPairs.reverse();
    }
    return sortedPairs.map(item =>
      renderUniswapPoolListRow({
        ...item,
        attribute: selectedList,
        sort: sortDirection,
      })
    );
  }, [pairs, selectedList, sortDirection]);

  return (
    <Column marginTop={32}>
      <Row marginBottom={12} paddingHorizontal={19}>
        <UniswapLogo
          borderRadius={8}
          height={22}
          imageStyle={{
            height: 18,
            marginBottom: 2.5,
            marginRight: 1,
            width: 16,
          }}
          marginRight={7}
          marginTop={android ? 8 : 1}
          shadowBlur={4.5}
          shadowColor={isDarkMode ? colors.shadow : colors.purpleUniswap}
          shadowOffset={{ height: 3, width: 0 }}
          shadowOpacity={0.2}
          width={22}
        />
        <Text size="larger" weight="heavy">
          Uniswap Pools
        </Text>
      </Row>
      <Column>
        <Column>
          <FlatList
            contentContainerStyle={{
              paddingBottom: 10,
              paddingHorizontal: 19,
            }}
            data={listData}
            horizontal
            keyExtractor={item => item.id}
            ref={listRef}
            renderItem={renderItem}
            scrollsToTop={false}
            showsHorizontalScrollIndicator={false}
          />
          <EdgeFade />
        </Column>
      </Column>
      {error ? (
        <Text>There was an error loading Uniswap pool data...</Text>
      ) : pairRows?.length > 0 ? (
        pairRows
      ) : (
        times(3, index => (
          <AssetListItemSkeleton
            animated
            descendingOpacity
            key={`skeleton-pools-${index}`}
          />
        ))
      )}
    </Column>
  );
}
