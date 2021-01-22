import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '../../navigation/Navigation';
import { magicMemo } from '../../utils';
import { Icon } from '../icons';
import FloatingActionButton from './FloatingActionButton';
import Routes from '@rainbow-me/routes';
import { colors } from '@rainbow-me/styles';

const FabShadowDark = [[0, 10, 30, colors.shadow, 1]];
const FabShadowLight = [
  [0, 10, 30, colors.shadow, 0.8],
  [0, 5, 15, colors.paleBlue, 1],
];

const SendFab = ({ disabled, isReadOnlyWallet, ...props }) => {
  const { navigate } = useNavigation();

  const handlePress = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.SEND_FLOW);
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [navigate, isReadOnlyWallet]);

  const { isDarkMode } = useTheme();

  const FabShadow = isDarkMode ? FabShadowDark : FabShadowLight;

  return (
    <FloatingActionButton
      {...props}
      backgroundColor={colors.paleBlue}
      disabled={disabled}
      onPress={handlePress}
      shadows={FabShadow}
      testID="send-fab"
    >
      <Icon
        color={colors.whiteLabel}
        height={22}
        marginBottom={4}
        name="send"
        width={23}
      />
    </FloatingActionButton>
  );
};

export default magicMemo(SendFab, ['disabled', 'isReadOnlyWallet']);
