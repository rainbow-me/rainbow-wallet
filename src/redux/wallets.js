import { toChecksumAddress } from 'ethereumjs-util';
import { filter, flatMap, get, map, values } from 'lodash';
import { backupUserDataIntoCloud } from '../handlers/cloudBackup';
import {
  getWalletNames,
  saveWalletNames,
} from '../handlers/localstorage/walletNames';
import { web3Provider } from '../handlers/web3';
import WalletBackupTypes from '../helpers/walletBackupTypes';
import {
  generateAccount,
  getAllWallets,
  getSelectedWallet,
  loadAddress,
  saveAddress,
  saveAllWallets,
  setSelectedWallet,
} from '../model/wallet';
import { settingsUpdateAccountAddress } from '../redux/settings';

// -- Constants --------------------------------------- //
const WALLETS_ADDED_ACCOUNT = 'wallets/WALLETS_ADDED_ACCOUNT';
const WALLETS_LOAD = 'wallets/ALL_WALLETS_LOAD';
const WALLETS_UPDATE = 'wallets/ALL_WALLETS_UPDATE';
const WALLETS_UPDATE_NAMES = 'wallets/WALLETS_UPDATE_NAMES';
const WALLETS_SET_IS_CREATING_ACCOUNT = 'wallets/SET_IS_CREATING_ACCOUNT';
const WALLETS_SET_SELECTED = 'wallets/SET_SELECTED';

// -- Actions ---------------------------------------- //
export const walletsLoadState = () => async (dispatch, getState) => {
  try {
    const { accountAddress } = getState().settings;
    let addressFromKeychain = accountAddress;
    const { wallets } = await getAllWallets();
    const selected = await getSelectedWallet();
    // Prevent irrecoverable state (no selected wallet)
    let selectedWallet = get(selected, 'wallet', undefined);
    // Check if the selected wallet is among all the wallets
    if (selectedWallet && !wallets[selectedWallet.id]) {
      // If not then we should clear it and default to the first one
      const firstWalletKey = Object.keys(wallets)[0];
      selectedWallet = wallets[firstWalletKey];
      await setSelectedWallet(selectedWallet);
    }

    console.log('SELECTED WALLET?', selectedWallet);
    if (!selectedWallet) {
      const address = await loadAddress();
      Object.keys(wallets).some(key => {
        const someWallet = wallets[key];
        const found = someWallet.addresses.some(account => {
          return (
            toChecksumAddress(account.address) === toChecksumAddress(address)
          );
        });
        if (found) {
          selectedWallet = someWallet;
        }
        return found;
      });
    }

    console.log('ADDRESS FROM KEYCHAIN?', addressFromKeychain);
    // Recover from broken state (account address not in selected wallet)
    if (!addressFromKeychain) {
      addressFromKeychain = await loadAddress();
    }

    const selectedAddress = selectedWallet.addresses.find(a => {
      return a.visible && a.address === addressFromKeychain;
    });
    console.log('SELECTED ADDRESS?', selectedAddress);

    if (!selectedAddress) {
      console.log(
        '[DEBUG] We didnt find that wallet, selecting the first one!'
      );
      const account = selectedWallet.addresses.find(a => a.visible);
      await dispatch(settingsUpdateAccountAddress(account.address));
      await saveAddress(account.address);
    }

    console.log('GUCCI');

    const walletNames = await getWalletNames();

    // Only for debugging purposes

    // Object.keys(wallets).forEach(key => {
    //   if (!wallets[key].primary) {
    //     delete wallets[key].backedUp;
    //     delete wallets[key].backupDate;
    //     delete wallets[key].backupFile;
    //     delete wallets[key].backupType;
    //   }
    // });

    dispatch({
      payload: {
        selected: selectedWallet,
        walletNames,
        wallets,
      },
      type: WALLETS_LOAD,
    });

    dispatch(fetchWalletNames());

    // eslint-disable-next-line no-empty
  } catch (error) {}
};

export const walletsUpdate = wallets => dispatch => {
  saveAllWallets(wallets);
  dispatch({
    payload: wallets,
    type: WALLETS_UPDATE,
  });
};

export const walletsSetSelected = wallet => dispatch => {
  setSelectedWallet(wallet);
  dispatch({
    payload: wallet,
    type: WALLETS_SET_SELECTED,
  });
};

export const isCreatingAccount = val => dispatch => {
  dispatch({
    payload: val,
    type: WALLETS_SET_IS_CREATING_ACCOUNT,
  });
};

export const setWalletBackedUp = (
  wallet_id,
  method,
  backupFile = null
) => async (dispatch, getState) => {
  const { wallets, selected } = getState().wallets;
  const newWallets = { ...wallets };
  newWallets[wallet_id].backedUp = true;
  newWallets[wallet_id].backupType = method;
  if (backupFile) {
    newWallets[wallet_id].backupFile = backupFile;
  }
  newWallets[wallet_id].backupDate = Date.now();
  dispatch(walletsUpdate(newWallets));
  if (selected.id === wallet_id) {
    dispatch(walletsSetSelected(newWallets[wallet_id]));
  }

  if (method === WalletBackupTypes.cloud) {
    console.log('SAVING WALLET USERDATA');
    try {
      const userData = await backupUserDataIntoCloud({ wallets: newWallets });
      console.log('WALLET  USERDATA SAVED', userData);
    } catch (e) {
      console.log('SAVING WALLET  USERDATA FAILED', e);
    }
  }
};

export const deleteCloudBackup = wallet_id => async () => {
  throw new Error('I still need to code it!', wallet_id);
};

export const addressSetSelected = address => () => saveAddress(address);

export const createAccountForWallet = (id, color, name) => async (
  dispatch,
  getState
) => {
  const { wallets } = getState().wallets;
  const newWallets = { ...wallets };
  let index = 0;
  newWallets[id].addresses.forEach(
    account => (index = Math.max(index, account.index))
  );
  const newIndex = index + 1;
  const account = await generateAccount(id, newIndex);
  newWallets[id].addresses.push({
    address: account.address,
    avatar: null,
    color,
    index: newIndex,
    label: name,
    visible: true,
  });

  // Save all the wallets
  saveAllWallets(newWallets);
  // Set the address selected (KEYCHAIN)
  await saveAddress(account.address);
  // Set the wallet selected (KEYCHAIN)
  await setSelectedWallet(newWallets[id]);

  dispatch({
    payload: { selected: newWallets[id], wallets: newWallets },
    type: WALLETS_ADDED_ACCOUNT,
  });
};

export const fetchWalletNames = () => async (dispatch, getState) => {
  const { wallets } = getState().wallets;
  const updatedWalletNames = {};

  // Fetch ENS names
  await Promise.all(
    flatMap(values(wallets), wallet => {
      const visibleAccounts = filter(wallet.addresses, 'visible');
      return map(visibleAccounts, async account => {
        try {
          const ens = await web3Provider.lookupAddress(account.address);
          if (ens && ens !== account.address) {
            updatedWalletNames[account.address] = ens;
          }
          // eslint-disable-next-line no-empty
        } catch (error) {}
        return account;
      });
    })
  );

  dispatch({
    payload: updatedWalletNames,
    type: WALLETS_UPDATE_NAMES,
  });
  saveWalletNames(updatedWalletNames);
};

// -- Reducer ----------------------------------------- //
const INITIAL_STATE = {
  isCreatingAccount: false,
  selected: undefined,
  walletNames: {},
  wallets: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WALLETS_SET_IS_CREATING_ACCOUNT:
      return { ...state, isCreatingAccount: action.payload };
    case WALLETS_SET_SELECTED:
      return { ...state, selected: action.payload };
    case WALLETS_UPDATE:
      return { ...state, wallets: action.payload };
    case WALLETS_UPDATE_NAMES:
      return { ...state, walletNames: action.payload };
    case WALLETS_LOAD:
      return {
        ...state,
        selected: action.payload.selected,
        walletNames: action.payload.walletNames,
        wallets: action.payload.wallets,
      };
    case WALLETS_ADDED_ACCOUNT:
      return {
        ...state,
        selected: action.payload.selected,
        wallets: action.payload.wallets,
      };
    default:
      return state;
  }
};
