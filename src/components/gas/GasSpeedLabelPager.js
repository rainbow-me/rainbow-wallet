import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components/primitives';
import { Row } from '../layout';
import GasSpeedLabelPagerItem, {
  GasSpeedLabelPagerItemHeight,
} from './GasSpeedLabelPagerItem';
import { gasUtils, magicMemo } from '@rainbow-me/utils';

const speedColorsFactory = colors => ({
  dark: [
    colors.whiteLabel,
    colors.whiteLabel,
    colors.whiteLabel,
    colors.appleBlue,
  ],
  light: [
    colors.alpha(colors.blueGreyDark, 0.8),
    colors.alpha(colors.blueGreyDark, 0.8),
    colors.alpha(colors.blueGreyDark, 0.8),
    colors.appleBlue,
  ],
});

const PagerItem = styled(Row)`
  border-radius: 2px;
  height: 3px;
  margin-left: ${({ selected }) => (selected ? '2' : '2.5')}px;
  margin-right: ${({ selected }) => (selected ? '0' : '0.5')}px;
  ${android ? `margin-top: -3px;` : ``}
  width: ${({ selected }) => (selected ? '4' : '3')}px;
`;

const GasSpeedLabelPager = ({
  label,
  theme,
  showPager = true,
  options = null,
}) => {
  const [touched, setTouched] = useState(false);
  useEffect(() => setTouched(true), [label]);
  const { colors } = useTheme();
  const speedColors = useMemo(() => speedColorsFactory(colors), [colors]);

  return (
    <Row align="center" height={GasSpeedLabelPagerItemHeight} justify="end">
      {showPager && (
        <Row self="start">
          {(options || gasUtils.GasSpeedOrder).map((speed, i) => (
            <PagerItem
              backgroundColor={
                speed === label
                  ? label === 'custom'
                    ? speedColors.appleBlue
                    : speedColors[theme][i]
                  : theme === 'dark'
                  ? speedColors.alpha(
                      speedColors.darkModeColors.blueGreyDark,
                      0.3
                    )
                  : speedColors.alpha(speedColors.blueGreyDark, 0.3)
              }
              key={`pager-${speed}-${i}`}
              selected={speed === label}
            />
          ))}
        </Row>
      )}
      <Row height={GasSpeedLabelPagerItemHeight}>
        {gasUtils.GasSpeedOrder.map(speed => (
          <GasSpeedLabelPagerItem
            key={speed}
            label={speed}
            selected={speed === label}
            shouldAnimate={touched}
            theme={theme}
          />
        ))}
      </Row>
    </Row>
  );
};

export default magicMemo(GasSpeedLabelPager, 'label');
