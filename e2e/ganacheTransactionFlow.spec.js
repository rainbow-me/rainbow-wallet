/* eslint-disable no-undef */
/* eslint-disable jest/expect-expect */
import * as Helpers from './helpers';

describe('Ganache Transaction Flow', () => {
  it('Should show the welcome screen', async () => {
    await device.disableSynchronization();
    await Helpers.checkIfVisible('welcome-screen');
  });

  it('Should show the "Restore Sheet" after tapping on "I already have a wallet"', async () => {
    await Helpers.tap('already-have-wallet-button');
    await Helpers.delay(2000);
    await Helpers.checkIfExists('restore-sheet');
  });

  it('show the "Import Sheet" when tapping on "Restore with a recovery phrase or private key"', async () => {
    await Helpers.tap('restore-with-key-button');
    await Helpers.delay(2000);
    await Helpers.checkIfExists('import-sheet');
  });

  it('Should show the "Add wallet modal" after tapping import with a valid seed"', async () => {
    await Helpers.typeText('import-sheet-input', process.env.DEV_SEEDS, false);
    await Helpers.delay(1500);
    await Helpers.checkIfElementHasString(
      'import-sheet-button-label',
      'Import'
    );
    await Helpers.tap('import-sheet-button');
    await Helpers.checkIfVisible('wallet-info-modal');
  });

  it('Should navigate to the Wallet screen after tapping on "Import Wallet"', async () => {
    await Helpers.delay(1000);
    await Helpers.tap('wallet-info-submit-button');
    await Helpers.delay(3000);
    await Helpers.checkIfVisible('wallet-screen');
  });

  it('Should navigate to the Profile screen after swiping right', async () => {
    await Helpers.delay(1000);
    await Helpers.swipe('wallet-screen', 'right', 'slow');
    await Helpers.delay(2000);
    await Helpers.checkIfVisible('profile-screen');
    await Helpers.delay(3000);
  });

  it('Should navigate to Settings Modal after tapping Settings Button', async () => {
    await Helpers.tap('settings-button');
    await Helpers.delay(2000);
    await Helpers.checkIfVisible('settings-modal');
  });

  it('Should navigate to Developer Settings after tapping Developer Section', async () => {
    await Helpers.tap('developer-section');
    await Helpers.delay(2000);
    await Helpers.checkIfVisible('developer-settings-modal');
  });

  it('Should show Ganache Toast after pressing Connect To Ganache', async () => {
    await Helpers.tap('ganache-section');
    await Helpers.delay(15000);
    await Helpers.checkIfVisible('testnet-toast-Ganache');
    await Helpers.swipe('profile-screen', 'left', 'slow');
    await Helpers.delay(2000);
  });

  //SwapSheet Transactions
  it('Should open and complete SwapSheet for ETH -> ERC20', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.delay(2000);
    await Helpers.typeText('exchange-modal-input', '0.03', true);
    await Helpers.delay(2000);
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.delay(2000);
    await Helpers.typeText('currency-select-search-input', 'DAI', true);
    await Helpers.delay(2000);
    await Helpers.tap('exchange-coin-row-DAI');
    await Helpers.delay(2000);
    await Helpers.tapAndLongPressByText('Hold to Swap');
    await Helpers.delay(6000);
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should open and complete SwapSheet for ERC20 -> ERC20', async () => {
    await Helpers.delay(2000);
    await Helpers.tap('exchange-fab');
    await Helpers.delay(2000);
    await Helpers.tap('exchange-modal-input-selection-button');
    await Helpers.delay(2000);
    await Helpers.tap('exchange-coin-row-DAI');
    await Helpers.delay(2000);
    await Helpers.typeText('exchange-modal-input', '10', true);
    await Helpers.delay(2000);
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.delay(2000);
    await Helpers.tap('exchange-coin-row-ZRX');
    await Helpers.delay(2000);
    await Helpers.tapAndLongPressByText('Hold to Swap');
    await Helpers.delay(6000);
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should open and complete SwapSheet for ERC20 -> ETH', async () => {
    await Helpers.delay(2000);
    await Helpers.tap('exchange-fab');
    await Helpers.delay(2000);
    await Helpers.tap('exchange-modal-input-selection-button');
    await Helpers.delay(2000);
    await Helpers.tap('exchange-coin-row-DAI');
    await Helpers.delay(2000);
    await Helpers.typeText('exchange-modal-input', '10', true);
    await Helpers.delay(2000);
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.delay(2000);
    await Helpers.typeText('currency-select-search-input', 'ETH', true);
    await Helpers.delay(2000);
    await Helpers.tap('exchange-coin-row-ETH');
    await Helpers.delay(2000);
    await Helpers.tapAndLongPressByText('Hold to Swap');
    await Helpers.delay(6000);
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  afterAll(async () => {
    // Reset the app state
    await device.clearKeychain();
  });
});
