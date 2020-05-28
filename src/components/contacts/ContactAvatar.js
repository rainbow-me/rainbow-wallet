import { toUpper } from 'lodash';
import React from 'react';
import ShadowStack from 'react-native-shadow-stack/dist/ShadowStack';
import { borders, colors } from '../../styles';
import { getFirstGrapheme } from '../../utils';
import { Centered } from '../layout';
import { Text } from '../text';

const DefaultContactAvatarShadow = [
  [0, 4, 6, colors.dark, 0.04],
  [0, 1, 3, colors.dark, 0.08],
];

const ContactAvatarSizeTypes = {
  large: 'large',
  medium: 'medium',
  small: 'small',
};

const ContactAvatarSizeConfigs = {
  large: {
    dimensions: 60,
    shadows: DefaultContactAvatarShadow,
    textSize: 'bigger',
  },
  medium: {
    dimensions: 40,
    shadows: DefaultContactAvatarShadow,
    textSize: 'larger',
  },
  small: {
    dimensions: 34,
    shadows: [
      [0, 3, 5, colors.dark, 0.2],
      [0, 6, 10, colors.dark, 0.14],
    ],
    textSize: 'large',
  },
};

const ContactAvatar = ({
  color,
  size = ContactAvatarSizeTypes.medium,
  value,
  ...props
}) => {
  const { dimensions, shadows, textSize } = ContactAvatarSizeConfigs[size];

  return (
    <ShadowStack
      {...props}
      {...borders.buildCircleAsObject(dimensions)}
      backgroundColor={colors.avatarColor[color] || color}
      shadows={shadows}
    >
      <Centered flex={1}>
        <Text align="center" color="white" size={textSize} weight="bold">
          {value && getFirstGrapheme(toUpper(value))}
        </Text>
      </Centered>
    </ShadowStack>
  );
};

export default React.memo(ContactAvatar);
