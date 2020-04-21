import { isArray, isString, pick } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/primitives';
import { colors, padding } from '../../../styles';
import { ButtonPressAnimation } from '../../animations';
import { Centered, InnerBorder } from '../../layout';
import { Text } from '../../text';

const ButtonSizeTypes = {
  default: {
    fontSize: 'large',
    padding: [12, 15, 16],
  },
  small: {
    fontSize: 'medium',
    padding: [5.5, 10, 6.5],
  },
};

const ButtonShapeTypes = {
  pill: 'pill',
  rounded: 'rounded',
};

const shadowStyles = `
  shadow-color: ${colors.alpha(colors.blueGreyDark, 0.5)};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 6;
`;

const Container = styled(Centered)`
  ${({ showShadow }) => (showShadow ? shadowStyles : '')}
  ${({ size }) => padding(...ButtonSizeTypes[size].padding)}
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: ${({ type }) => (type === 'rounded' ? 14 : 50)};
  flex-grow: 0;
`;

const shouldRenderChildrenAsText = children =>
  isArray(children) ? isString(children[0]) : isString(children);

const Button = ({
  backgroundColor,
  borderColor,
  borderOpacity,
  borderWidth,
  children,
  color,
  containerStyles,
  disabled,
  onPress,
  showShadow,
  size,
  style,
  textProps,
  type,
  ...props
}) => (
  <ButtonPressAnimation
    {...pick(props, Object.keys(ButtonPressAnimation.propTypes))}
    backgroundColor={backgroundColor}
    disabled={disabled}
    style={[props.style, { borderRadius: type === 'rounded' ? 14 : 50 }]}
    onPress={onPress}
  >
    <Container
      {...props}
      backgroundColor={backgroundColor}
      css={containerStyles}
      showShadow={showShadow}
      size={size}
      style={style}
      type={type}
    >
      {!shouldRenderChildrenAsText(children) ? (
        children
      ) : (
        <Text
          color={color}
          size={ButtonSizeTypes[size].fontSize}
          weight="semibold"
          {...textProps}
        >
          {children}
        </Text>
      )}
      {(!onPress || !disabled) && (
        <InnerBorder
          color={borderColor}
          opacity={borderOpacity}
          radius={type === 'rounded' ? 14 : 50}
          width={borderWidth}
        />
      )}
    </Container>
  </ButtonPressAnimation>
);

Button.propTypes = {
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
  borderOpacity: PropTypes.string,
  borderWidth: PropTypes.number,
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  containerStyles: PropTypes.string,
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
  showShadow: PropTypes.bool,
  size: PropTypes.oneOf(Object.keys(ButtonSizeTypes)),
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  textProps: PropTypes.object,
  type: PropTypes.oneOf(Object.keys(ButtonShapeTypes)),
};

Button.defaultProps = {
  backgroundColor: colors.grey,
  color: colors.white,
  showShadow: true,
  size: 'default',
  type: ButtonShapeTypes.pill,
};

export default Button;
