import AsyncStorage from '@react-native-community/async-storage';
import React, { Fragment, useCallback, useMemo } from 'react';
import {
  Linking,
  NativeModules,
  ScrollView,
  Share,
  Switch,
} from 'react-native';
import styled from 'styled-components/primitives';
import { REVIEW_ANDROID } from '../../config/experimental';
import useExperimentalFlag from '../../config/experimentalHooks';
//import { supportedLanguages } from '../../languages';
import { useTheme } from '../../context/ThemeContext';
import AppVersionStamp from '../AppVersionStamp';
import { Icon } from '../icons';
import { Column, ColumnWithDividers } from '../layout';
import {
  ListFooter,
  ListItem,
  ListItemArrowGroup,
  ListItemDivider,
} from '../list';
import { Emoji } from '../text';
import BackupIcon from '@rainbow-me/assets/settingsBackup.png';
import BackupIconDark from '@rainbow-me/assets/settingsBackupDark.png';
import CurrencyIcon from '@rainbow-me/assets/settingsCurrency.png';
import CurrencyIconDark from '@rainbow-me/assets/settingsCurrencyDark.png';
import darkModeIcon from '@rainbow-me/assets/settingsDarkmode.png';
import darkModeIconDark from '@rainbow-me/assets/settingsDarkmodeDark.png';
import NetworkIcon from '@rainbow-me/assets/settingsNetwork.png';
import NetworkIconDark from '@rainbow-me/assets/settingsNetworkDark.png';
import networkInfo from '@rainbow-me/helpers/networkInfo';
import WalletTypes from '@rainbow-me/helpers/walletTypes';
import {
  useAccountSettings,
  useDimensions,
  useSendFeedback,
  useWallets,
} from '@rainbow-me/hooks';
import { ImgixImage } from '@rainbow-me/images';
import { colors_NOT_REACTIVE, position } from '@rainbow-me/styles';
import {
  AppleReviewAddress,
  REVIEW_DONE_KEY,
} from '@rainbow-me/utils/reviewAlert';

const { RainbowRequestReview, RNReview } = NativeModules;

export const SettingsExternalURLs = {
  rainbowHomepage: 'https://rainbow.me',
  review:
    'itms-apps://itunes.apple.com/us/app/appName/id1457119021?mt=8&action=write-review',
  twitterDeepLink: 'twitter://user?screen_name=rainbowdotme',
  twitterWebUrl: 'https://twitter.com/rainbowdotme',
};

const CheckmarkIcon = styled(Icon).attrs({
  name: 'checkmarkCircled',
})`
  box-shadow: 0px 4px 6px
    ${({ isDarkMode }) =>
      colors_NOT_REACTIVE.alpha(
        isDarkMode
          ? colors_NOT_REACTIVE.shadow
          : colors_NOT_REACTIVE.blueGreyDark50,
        0.4
      )};
`;

const contentContainerStyle = { flex: 1 };
const Container = styled(ScrollView).attrs({
  contentContainerStyle,
  scrollEventThrottle: 32,
})`
  ${position.cover};
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

// ⚠️ Beware: magic numbers lol
const SettingIcon = styled(ImgixImage)`
  ${position.size(60)};
  margin-left: -16;
  margin-right: -11;
  margin-top: 8;
`;

const VersionStampContainer = styled(Column).attrs({
  align: 'center',
  justify: 'end',
})`
  flex: 1;
  padding-bottom: 19;
`;

const WarningIcon = styled(Icon).attrs({
  color: colors_NOT_REACTIVE.orangeLight,
  name: 'warning',
})`
  box-shadow: 0px 4px 6px
    ${({ theme: { colors } }) =>
      colors.alpha(colors_NOT_REACTIVE.orangeLight, 0.4)};
  margin-top: 1;
`;

const checkAllWallets = wallets => {
  if (!wallets) return false;
  let areBackedUp = true;
  let canBeBackedUp = false;
  let allBackedUp = true;
  Object.keys(wallets).forEach(key => {
    if (!wallets[key].backedUp && wallets[key].type !== WalletTypes.readOnly) {
      allBackedUp = false;
    }

    if (
      !wallets[key].backedUp &&
      wallets[key].type !== WalletTypes.readOnly &&
      !wallets[key].imported
    ) {
      areBackedUp = false;
    }
    if (!wallets[key].type !== WalletTypes.readOnly) {
      canBeBackedUp = true;
    }
  });
  return { allBackedUp, areBackedUp, canBeBackedUp };
};

export default function SettingsSection({
  onCloseModal,
  onPressBackup,
  onPressCurrency,
  onPressDev,
  onPressIcloudBackup,
  /*onPressLanguage,*/
  onPressNetwork,
  onPressShowSecret,
}) {
  const isReviewAvailable = useExperimentalFlag(REVIEW_ANDROID) || ios;
  const { wallets } = useWallets();
  const { /*language,*/ nativeCurrency, network } = useAccountSettings();
  const { isTinyPhone } = useDimensions();

  const { colors, isDarkMode, setTheme } = useTheme();

  const onSendFeedback = useSendFeedback();

  const onPressReview = useCallback(async () => {
    if (ios) {
      onCloseModal();
      RainbowRequestReview.requestReview(handled => {
        if (!handled) {
          AsyncStorage.setItem(REVIEW_DONE_KEY, 'true');
          Linking.openURL(AppleReviewAddress);
        }
      });
    } else {
      RNReview.show();
    }
  }, [onCloseModal]);

  const onPressShare = useCallback(() => {
    Share.share({
      message: `👋️ Hey friend! You should download Rainbow, it's my favorite Ethereum wallet 🌈️🌈️🌈️🌈️🌈️🌈️🌈️🌈️🌈️🌈️ ${SettingsExternalURLs.rainbowHomepage}`,
    });
  }, []);

  const onPressTwitter = useCallback(async () => {
    Linking.canOpenURL(SettingsExternalURLs.twitterDeepLink).then(supported =>
      supported
        ? Linking.openURL(SettingsExternalURLs.twitterDeepLink)
        : Linking.openURL(SettingsExternalURLs.twitterWebUrl)
    );
  }, []);

  const { allBackedUp, areBackedUp, canBeBackedUp } = useMemo(
    () => checkAllWallets(wallets),
    [wallets]
  );

  const backupStatusColor = allBackedUp
    ? colors.green
    : colors.alpha(colors.blueGreyDark, 0.5);

  const toggleDarkMode = useCallback(() => {
    setTheme(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setTheme]);

  return (
    <Container backgroundColor={colors.white} scrollEnabled={isTinyPhone}>
      <ColumnWithDividers dividerRenderer={ListItemDivider} marginTop={7}>
        {canBeBackedUp && (
          <ListItem
            icon={
              <SettingIcon source={isDarkMode ? BackupIconDark : BackupIcon} />
            }
            label="Backup"
            onPress={onPressBackup}
            onPressIcloudBackup={onPressIcloudBackup}
            onPressShowSecret={onPressShowSecret}
            testID="backup-section"
          >
            <ListItemArrowGroup>
              {areBackedUp ? (
                <CheckmarkIcon
                  color={backupStatusColor}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <WarningIcon />
              )}
            </ListItemArrowGroup>
          </ListItem>
        )}
        <ListItem
          icon={
            <SettingIcon
              source={isDarkMode ? CurrencyIconDark : CurrencyIcon}
            />
          }
          label="Currency"
          onPress={onPressCurrency}
          testID="currency-section"
        >
          <ListItemArrowGroup>{nativeCurrency || ''}</ListItemArrowGroup>
        </ListItem>
        <ListItem
          icon={
            <SettingIcon source={isDarkMode ? NetworkIconDark : NetworkIcon} />
          }
          label="Network"
          onPress={onPressNetwork}
          testID="network-section"
        >
          <ListItemArrowGroup>
            {networkInfo?.[network]?.name}
          </ListItemArrowGroup>
        </ListItem>
        <ListItem
          icon={
            <SettingIcon
              source={isDarkMode ? darkModeIconDark : darkModeIcon}
            />
          }
          label="Dark Mode"
          testID="darkmode-section"
        >
          <Column align="end" flex="1" justify="end">
            <Switch
              ios_backgroundColor={colors.alpha(colors.blueGreyDark, 0.3)}
              onValueChange={toggleDarkMode}
              thumbColor={isDarkMode ? colors.white : colors.white}
              trackColor={{
                false: '#767577',
                true: colors.green,
              }}
              value={isDarkMode}
            />
          </Column>
        </ListItem>
        {/*<ListItem
        {/*  icon={*/}
        {/*    <SettingIcon source={darkMode ? LanguageIconDark : LanguageIcon} />*/}
        {/*  }*/}
        {/*  label="Language"*/}
        {/*  onPress={onPressLanguage}*/}
        {/*>*/}
        {/*  <ListItemArrowGroup>*/}
        {/*    {supportedLanguages[language] || ''}*/}
        {/*  </ListItemArrowGroup>*/}
        {/*</ListItem>*/}
      </ColumnWithDividers>
      <ListFooter />
      <ColumnWithDividers dividerRenderer={ListItemDivider}>
        <ListItem
          icon={<Emoji name="rainbow" />}
          label="Share Rainbow"
          onPress={onPressShare}
          testID="share-section"
          value={SettingsExternalURLs.rainbowHomepage}
        />
        <ListItem
          icon={<Emoji name="bird" />}
          label="Follow Us on Twitter"
          onPress={onPressTwitter}
          testID="twitter-section"
          value={SettingsExternalURLs.twitter}
        />
        <ListItem
          icon={<Emoji name={ios ? 'speech_balloon' : 'lady_beetle'} />}
          label={ios ? 'Feedback and Support' : 'Feedback & Bug Reports'}
          onPress={onSendFeedback}
          testID="feedback-section"
        />
        {isReviewAvailable && (
          <ListItem
            icon={<Emoji name="red_heart" />}
            label="Review Rainbow"
            onPress={onPressReview}
            testID="review-section"
          />
        )}
      </ColumnWithDividers>
      {IS_DEV && (
        <Fragment>
          <ListFooter height={10} />
          <ListItem
            icon={<Emoji name="construction" />}
            label="Developer Settings"
            onPress={onPressDev}
            testID="developer-section"
          />
        </Fragment>
      )}
      <VersionStampContainer>
        <AppVersionStamp />
      </VersionStampContainer>
    </Container>
  );
}
