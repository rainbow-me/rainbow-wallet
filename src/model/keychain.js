import { captureException } from '@sentry/react-native';
import { isNil } from 'lodash';
import {
  getAllInternetCredentials,
  getInternetCredentials,
  resetInternetCredentials,
  setInternetCredentials,
} from 'react-native-keychain';
import logger from 'logger';

// NOTE: implement access control for iOS keychain
export async function saveString(key, value, accessControlOptions) {
  try {
    await setInternetCredentials(
      key,
      key,
      value,
      accessControlOptions && { accessControl: accessControlOptions }
    );
    logger.log(`Keychain: saved string for key: ${key}`);
  } catch (err) {
    logger.sentry(
      `Keychain: failed to save string for key: ${key} error: ${err}`
    );
    captureException(err);
  }
}

export async function loadString(key, authenticationPrompt) {
  try {
    const credentials = await getInternetCredentials(key, authenticationPrompt);
    if (credentials) {
      logger.log(`Keychain: loaded string for key: ${key}`);
      return credentials.password;
    }
    logger.sentry(`Keychain: string does not exist for key: ${key}`);
  } catch (err) {
    logger.sentry(
      `Keychain: failed to load string for key: ${key} error: ${err}`
    );
    captureException(err);
  }
  return null;
}

export async function saveObject(key, value, accessControlOptions) {
  const jsonValue = JSON.stringify(value);
  await saveString(key, jsonValue, accessControlOptions);
}

export async function loadObject(key, authenticationPrompt) {
  const jsonValue = await loadString(key, authenticationPrompt);
  try {
    const objectValue = JSON.parse(jsonValue);
    logger.log(`Keychain: parsed object for key: ${key}`);
    return objectValue;
  } catch (err) {
    logger.sentry(
      `Keychain: failed to parse object for key: ${key} error: ${err}`
    );
    captureException(err);
  }
  return null;
}

export async function remove(key) {
  try {
    await resetInternetCredentials(key);
    logger.log(`Keychain: removed value for key: ${key}`);
  } catch (err) {
    logger.log(
      `Keychain: failed to remove value for key: ${key} error: ${err}`
    );
    captureException(err);
  }
}

export async function loadAllKeys(authenticationPrompt) {
  try {
    const { results } = await getAllInternetCredentials(authenticationPrompt);
    return results;
  } catch (err) {
    logger.log(`Keychain: failed to loadAllKeys error: ${err}`);
    captureException(err);
  }
  return null;
}

export async function getAllKeysAnonymized() {
  const data = {};
  const results = await loadAllKeys();
  results.forEach(async result => {
    data[result.username] = {
      length: result.password.length,
      nil: isNil(result.password),
      type: typeof result.password,
    };
  });
}
