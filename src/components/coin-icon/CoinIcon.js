import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import { View } from 'react-native';
import { css } from 'styled-components/primitives';
import ReactCoinIcon, { FallbackIcon } from 'react-coin-icon';
import { onlyUpdateForKeys } from 'recompact';
import { ShadowStack } from '../shadow-stack';
import { toChecksumAddress } from '../../handlers/web3';
import { borders, colors, fonts } from '../../styles';
import { Icon } from '../icons';
const CoinIconSize = 40;

const fallbackTextStyles = css`
  font-family: ${fonts.family.SFMono};
  margin-bottom: 1;
`;

const CoinIconFallback = fallbackProps => {
  const { height, width, address, symbol } = fallbackProps;
  const [remoteIconUrl, setRemoteIconUrl] = useState(null);
  const checkIfRemoteIconIsAvailable = useCallback(async () => {
    try {
      const checksummedAddress = toChecksumAddress(address);
      const potentialIconUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksummedAddress}/logo.png`;
      const response = await fetch(potentialIconUrl);
      if (response.status >= 400) {
        setRemoteIconUrl(false);
      } else {
        setRemoteIconUrl(potentialIconUrl);
      }
    } catch (e) {
      setRemoteIconUrl(false);
    }
  }, [address]);

  checkIfRemoteIconIsAvailable();

  if (remoteIconUrl) {
    return (
      <FastImage
        {...fallbackProps}
        style={{ height, width }}
        source={{ uri: remoteIconUrl }}
      />
    );
  } else {
    return (
      <FallbackIcon
        {...fallbackProps}
        textStyles={fallbackTextStyles}
        symbol={symbol || ''}
      />
    );
  }
};

const enhance = onlyUpdateForKeys([
  'bgColor',
  'symbol',
  'address',
  'isCoinListEdited',
  'isPinned',
  'isHidden',
]);
const CoinIcon = enhance(
  ({
    bgColor,
    showShadow,
    size,
    symbol,
    address,
    isPinned,
    isHidden,
    isCoinListEdited,
    ...props
  }) =>
    showShadow ? (
      <>
        {(isPinned || isHidden) && isCoinListEdited ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.darkerGrey,
              borderRadius: 10,
              bottom: 3,
              height: 20,
              justifyContent: 'center',
              left: 14,
              position: 'absolute',
              width: 20,
              zIndex: 10,
            }}
          >
            <Icon
              name={isPinned ? 'pin' : 'hidden'}
              size={20}
              color={colors.white}
            />
          </View>
        ) : null}
        <ShadowStack
          {...props}
          {...borders.buildCircleAsObject(size)}
          backgroundColor={bgColor}
          shadows={[
            [0, 4, 6, colors.dark, 0.04],
            [0, 1, 3, colors.dark, 0.08],
          ]}
          shouldRasterizeIOS
        >
          <ReactCoinIcon
            bgColor={bgColor}
            fallbackRenderer={CoinIconFallback}
            size={size}
            symbol={symbol || ''}
            address={address || ''}
          />
        </ShadowStack>
      </>
    ) : (
      <ReactCoinIcon
        {...props}
        bgColor={bgColor}
        fallbackRenderer={CoinIconFallback}
        size={size}
        symbol={symbol}
        address={address || ''}
      />
    )
);

CoinIcon.propTypes = {
  address: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.string]),
  bgColor: PropTypes.string,
  showShadow: PropTypes.bool,
  size: PropTypes.number,
  symbol: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.string]),
};

CoinIcon.defaultProps = {
  showShadow: true,
  size: CoinIconSize,
};

CoinIcon.size = CoinIconSize;

export default CoinIcon;
