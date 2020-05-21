import PropTypes from 'prop-types';
import React from 'react';
import { Path } from 'react-native-svg';
import { colors } from '../../../styles';
import Svg from '../Svg';

const CopyIcon = ({ color, ...props }) => (
  <Svg fill="none" height="16" width="16" viewBox="0 0 16 16" {...props}>
    <Path
      clipRule="evenodd"
      d="M5 4.26667C5 2.77319 5 2.02646 5.29065 1.45603C5.54631 0.95426 5.95426 0.546312 6.45603 0.290649C7.02646 0 7.77319 0 9.26667 0H11.7333C13.2268 0 13.9735 0 14.544 0.290649C15.0457 0.546312 15.4537 0.95426 15.7094 1.45603C16 2.02646 16 2.77319 16 4.26667V6.73333C16 8.22681 16 8.97354 15.7094 9.54397C15.4537 10.0457 15.0457 10.4537 14.544 10.7094C13.9735 11 13.2268 11 11.7333 11H11.5333C11.3466 11 11.2533 11 11.182 11.0363C11.1193 11.0683 11.0683 11.1193 11.0363 11.182C11 11.2533 11 11.3466 11 11.5333V11.7333C11 13.2268 11 13.9735 10.7094 14.544C10.4537 15.0457 10.0457 15.4537 9.54397 15.7094C8.97354 16 8.22681 16 6.73333 16H4.26667C2.77319 16 2.02646 16 1.45603 15.7094C0.95426 15.4537 0.546312 15.0457 0.290649 14.544C0 13.9735 0 13.2268 0 11.7333V9.26667C0 7.77319 0 7.02646 0.290649 6.45603C0.546312 5.95426 0.95426 5.54631 1.45603 5.29065C2.02646 5 2.77319 5 4.26667 5H4.46667C4.65335 5 4.74669 5 4.818 4.96367C4.88072 4.93171 4.93171 4.88072 4.96367 4.818C5 4.74669 5 4.65335 5 4.46667V4.26667ZM5 6.73333C5 6.69651 4.97015 6.66667 4.93333 6.66667H3.49524C2.85518 6.66667 2.53515 6.66667 2.29068 6.79123C2.07564 6.9008 1.9008 7.07564 1.79123 7.29068C1.66667 7.53515 1.66667 7.85518 1.66667 8.49524V12.5048C1.66667 13.1448 1.66667 13.4649 1.79123 13.7093C1.9008 13.9244 2.07564 14.0992 2.29068 14.2088C2.53515 14.3333 2.85518 14.3333 3.49524 14.3333H7.50476C8.14482 14.3333 8.46485 14.3333 8.70932 14.2088C8.92437 14.0992 9.0992 13.9244 9.20877 13.7093C9.33333 13.4649 9.33333 13.1448 9.33333 12.5048V11.0667C9.33333 11.0298 9.30349 11 9.26667 11C7.77319 11 7.02646 11 6.45603 10.7094C5.95426 10.4537 5.54631 10.0457 5.29065 9.54397C5 8.97354 5 8.22681 5 6.73333ZM6.79123 2.29068C6.66667 2.53515 6.66667 2.85518 6.66667 3.49524V7.50476C6.66667 8.14482 6.66667 8.46485 6.79123 8.70932C6.9008 8.92437 7.07564 9.0992 7.29068 9.20877C7.53515 9.33333 7.85518 9.33333 8.49524 9.33333H12.5048C13.1448 9.33333 13.4649 9.33333 13.7093 9.20877C13.9244 9.0992 14.0992 8.92437 14.2088 8.70932C14.3333 8.46485 14.3333 8.14482 14.3333 7.50476V3.49524C14.3333 2.85518 14.3333 2.53515 14.2088 2.29068C14.0992 2.07564 13.9244 1.9008 13.7093 1.79123C13.4649 1.66667 13.1448 1.66667 12.5048 1.66667H8.49524C7.85518 1.66667 7.53515 1.66667 7.29068 1.79123C7.07564 1.9008 6.9008 2.07564 6.79123 2.29068Z"
      fillRule="evenodd"
      fill={color}
    />
  </Svg>
);

CopyIcon.propTypes = {
  color: PropTypes.string,
};

CopyIcon.defaultProps = {
  color: colors.black,
};

export default CopyIcon;
