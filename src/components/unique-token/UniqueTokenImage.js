import React, { useCallback, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { buildUniqueTokenName } from '../../helpers/assets';
import { magicMemo } from '../../utils';
import { Centered } from '../layout';
import { Monospace } from '../text';
import { ImageWithCachedMetadata, ImgixImage } from '@rainbow-me/images';
import { colors, position } from '@rainbow-me/styles';

const FallbackTextColorVariants = darkMode => ({
  dark: darkMode
    ? colors.alpha(colors.white, 0.25)
    : colors.alpha(colors.blueGreyDark, 0.5),
  light: darkMode ? colors.alpha(colors.blueGreyDark, 0.25) : colors.white,
});

const getFallbackTextColor = (bg, darkMode) =>
  colors.getTextColorForBackground(bg, FallbackTextColorVariants(darkMode));

const UniqueTokenImage = ({
  backgroundColor,
  imageUrl,
  item,
  resizeMode = ImgixImage.resizeMode.cover,
}) => {
  const [error, setError] = useState(null);
  const handleError = useCallback(error => setError(error), [setError]);
  const { isDarkMode } = useTheme();

  return (
    <Centered backgroundColor={backgroundColor} style={position.coverAsObject}>
      {imageUrl && !error ? (
        <ImageWithCachedMetadata
          imageUrl={imageUrl}
          onError={handleError}
          resizeMode={ImgixImage.resizeMode[resizeMode]}
          style={position.coverAsObject}
        />
      ) : (
        <Monospace
          align="center"
          color={getFallbackTextColor(backgroundColor, isDarkMode)}
          lineHeight="looser"
          size="smedium"
        >
          {buildUniqueTokenName(item)}
        </Monospace>
      )}
    </Centered>
  );
};

export default magicMemo(UniqueTokenImage, 'imageUrl');
