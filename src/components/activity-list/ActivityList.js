import PropTypes from 'prop-types';
import React from 'react';
import networkTypes from '../../helpers/networkTypes';
import ActivityListEmptyState from './ActivityListEmptyState';
import RecyclerActivityList from './RecyclerActivityList';

const ActivityList = ({
  accountAddress,
  accountColor,
  accountName,
  addCashAvailable,
  header,
  isEmpty,
  isLoading,
  navigation,
  network,
  sections,
}) =>
  network === networkTypes.mainnet || sections.length ? (
    <RecyclerActivityList
      accountAddress={accountAddress}
      accountColor={accountColor}
      accountName={accountName}
      addCashAvailable={addCashAvailable}
      navigation={navigation}
      isEmpty={isEmpty}
      header={header}
      isLoading={isLoading}
      sections={sections}
    />
  ) : (
    <ActivityListEmptyState
      emoji="👻"
      label="Your testnet transaction history starts now!"
    >
      {header}
    </ActivityListEmptyState>
  );

ActivityList.propTypes = {
  accountAddress: PropTypes.string,
  accountColor: PropTypes.number,
  accountName: PropTypes.string,
  addCashAvailable: PropTypes.bool,
  header: PropTypes.node,
  isEmpty: PropTypes.bool,
  isLoading: PropTypes.bool,
  navigation: PropTypes.object,
  network: PropTypes.string,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.array,
      renderItem: PropTypes.func,
      title: PropTypes.string.isRequired,
    })
  ),
};

export default ActivityList;
