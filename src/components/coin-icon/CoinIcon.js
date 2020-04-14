import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import ShadowStack from 'react-native-shadow-stack';
import { css } from 'styled-components/primitives';
import ReactCoinIcon, { FallbackIcon } from 'react-coin-icon';
import { onlyUpdateForKeys } from 'recompact';
import { toChecksumAddress } from '../../handlers/web3';
import { borders, colors, fonts } from '../../styles';
const CoinIconSize = 40;

const fallbackTextStyles = css`
  font-family: ${fonts.family.SFProRounded};
  letter-spacing: ${fonts.letterSpacing.roundedTight};
  margin-bottom: 1;
  text-align: center;
`;

const CoinIconFallback = fallbackProps => {
  const { height, width, address, symbol } = fallbackProps;
  const [remoteIconUrl, setRemoteIconUrl] = useState(null);
  const [iconNotAvailable, setIconNotAvailable] = useState(false);
  const loadRemoteIcon = useCallback(async () => {
    if (address) {
      const checksummedAddress = toChecksumAddress(address);
      const potentialIconUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksummedAddress}/logo.png`;
      setRemoteIconUrl(potentialIconUrl);
    }
  }, [address]);

  if (!iconNotAvailable) {
    loadRemoteIcon();
  }

  if (iconNotAvailable) {
    return (
      <FallbackIcon
        {...fallbackProps}
        bgColor={colors.blueGreyDark}
        symbol={symbol || ''}
        textStyles={fallbackTextStyles}
      />
    );
  } else if (remoteIconUrl) {
    return (
      <FastImage
        {...fallbackProps}
        onError={() => {
          setIconNotAvailable(true);
        }}
        source={{ uri: remoteIconUrl }}
        style={{ height, width }}
      />
    );
  }
  return null;
};

const enhance = onlyUpdateForKeys(['bgColor', 'symbol', 'address']);

const CoinIcon = enhance(
  ({ bgColor, showShadow, size, symbol, address, ...props }) =>
    showShadow ? (
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
          address={address || ''}
          bgColor={bgColor}
          fallbackRenderer={CoinIconFallback}
          size={size}
          symbol={symbol || ''}
        />
      </ShadowStack>
    ) : (
      <ReactCoinIcon
        {...props}
        address={address || ''}
        bgColor={bgColor}
        fallbackRenderer={CoinIconFallback}
        size={size}
        symbol={symbol}
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
