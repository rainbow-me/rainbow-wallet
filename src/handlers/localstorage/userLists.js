import { DefaultTokenLists } from '../../references';
import { getGlobal, saveGlobal } from './common';

const USER_LISTS = 'userLists';
const USER_LISTS_SELECTED_LIST = 'userListsSelectedList';

export const getUserLists = network =>
  getGlobal(USER_LISTS, DefaultTokenLists[network], []);

export const saveUserLists = lists => saveGlobal(USER_LISTS, lists);

export const getSelectedUserList = () =>
  getGlobal(USER_LISTS_SELECTED_LIST, null);

export const saveSelectedUserList = listId =>
  saveGlobal(USER_LISTS_SELECTED_LIST, listId);