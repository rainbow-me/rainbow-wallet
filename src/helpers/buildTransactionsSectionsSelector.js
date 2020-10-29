import { format } from 'date-fns';
import { get, groupBy, isEmpty, map, toLower } from 'lodash';
import { createElement } from 'react';
import { createSelector } from 'reselect';
import { TransactionCoinRow } from '../components/coin-row';
import TransactionStatusTypes from '../helpers/transactionStatusTypes';
import {
  calculateTimestampOfThisMonth,
  calculateTimestampOfThisYear,
  calculateTimestampOfToday,
  calculateTimestampOfYesterday,
  thisMonthTimestamp,
  thisYearTimestamp,
  timestampsCalculation,
  todayTimestamp,
  yesterdayTimestamp,
} from './transactions';

const contactsSelector = state => state.contacts;
const requestsSelector = state => state.requests;
const transactionsSelector = state => state.transactions;
const focusedSelector = state => state.isFocused;
const initializedSelector = state => state.initialized;

const getTimestamps = () => {
  const now = new Date();
  // When the day / month changes, we need to recalculate timestamps
  if (
    timestampsCalculation.getDate() !== now.getDate() ||
    timestampsCalculation.getMonth() !== now.getMonth()
  ) {
    todayTimestamp = calculateTimestampOfToday();
    yesterdayTimestamp = calculateTimestampOfYesterday();
    thisMonthTimestamp = calculateTimestampOfThisMonth();
    thisYearTimestamp = calculateTimestampOfThisYear();
  }
  return {
    thisMonthTimestamp,
    thisYearTimestamp,
    todayTimestamp,
    yesterdayTimestamp,
  };
};

const renderItemElement = renderItem =>
  function InternarSectionListRender(renderItemProps) {
    return createElement(renderItem, renderItemProps);
  };
const groupTransactionByDate = ({ pending, minedAt }) => {
  if (pending) return 'Pending';
  const {
    todayTimestamp,
    yesterdayTimestamp,
    thisMonthTimestamp,
    thisYearTimestamp,
  } = getTimestamps();

  const ts = parseInt(minedAt, 10) * 1000;

  if (ts > todayTimestamp) return 'Today';
  if (ts > yesterdayTimestamp) return 'Yesterday';
  if (ts > thisMonthTimestamp) return 'This Month';

  return format(ts, `MMMM${ts > thisYearTimestamp ? '' : ' yyyy'}`);
};

const addContactInfo = contacts => txn => {
  const { from, to, status } = txn;
  const isSent = status === TransactionStatusTypes.sent;
  const contactAddress = isSent ? to : from;
  const contact = get(contacts, `${[toLower(contactAddress)]}`, null);
  return {
    ...txn,
    contact,
  };
};

const buildTransactionsSections = (
  contacts,
  requests,
  transactions,
  isFocused,
  initialized
) => {
  if (!isFocused && !initialized) {
    return { sections: [] };
  }

  let sectionedTransactions = [];

  const transactionsWithContacts = map(transactions, addContactInfo(contacts));

  if (!isEmpty(transactionsWithContacts)) {
    const transactionsByDate = groupBy(
      transactionsWithContacts,
      groupTransactionByDate
    );
    sectionedTransactions = Object.keys(transactionsByDate).map(section => ({
      data: transactionsByDate[section],
      renderItem: renderItemElement(TransactionCoinRow),
      title: section,
    }));
  }

  let requestsToApprove = [];
  if (!isEmpty(requests)) {
    requestsToApprove = [
      {
        data: requests,
        title: 'Requests',
      },
    ];
  }
  return {
    sections: [...requestsToApprove, ...sectionedTransactions],
  };
};

export const buildTransactionsSectionsSelector = createSelector(
  [
    contactsSelector,
    requestsSelector,
    transactionsSelector,
    focusedSelector,
    initializedSelector,
  ],
  buildTransactionsSections
);
