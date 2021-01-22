import PropTypes from 'prop-types';
import React from 'react';
import { Path } from 'react-native-svg';
import Svg from '../Svg';
import { colors_NOT_REACTIVE } from '@rainbow-me/styles';

const CloseCircledIcon = ({ color, ...props }) => (
  <Svg height="12" viewBox="0 0 12 12" width="12" {...props}>
    <Path
      d="M6.00283152,12 C9.29306277,12 12,9.29872581 12,6.00283152 C12,2.70693723 9.29306277,0 5.99716848,0 C2.70127419,0 0,2.70693723 0,6.00283152 C0,9.29872581 2.70693723,12 6.00283152,12 Z M7.91,8.57039062 C7.70492187,8.57039062 7.54085937,8.5059375 7.41195312,8.37117187 L5.99398437,6.96492187 L4.58773437,8.37117187 C4.45296875,8.5059375 4.28890625,8.57039062 4.0896875,8.57039062 C3.70296875,8.57039062 3.41,8.27742187 3.41,7.89070312 C3.41,7.71492187 3.4803125,7.55085937 3.60921875,7.42195312 L5.03304687,5.998125 L3.60921875,4.57429687 C3.4803125,4.44539062 3.41,4.28132812 3.41,4.10554687 C3.41,3.71882812 3.70296875,3.42585937 4.0896875,3.42585937 C4.28890625,3.42585937 4.44710937,3.4903125 4.581875,3.62507812 L5.99398437,5.0371875 L7.4178125,3.61921875 C7.55257812,3.47859375 7.71078125,3.42 7.91,3.42 C8.29671875,3.42 8.5896875,3.71296875 8.5896875,4.0996875 C8.5896875,4.27546875 8.519375,4.43953125 8.38460937,4.5684375 L6.96664062,5.998125 L8.38460937,7.41609375 C8.51351562,7.545 8.58382812,7.7090625 8.58382812,7.89070312 C8.58382812,8.27742187 8.29085937,8.57039062 7.91,8.57039062 Z"
      fill={color}
      fillRule="nonzero"
    />
  </Svg>
);

CloseCircledIcon.propTypes = {
  color: PropTypes.string,
};

CloseCircledIcon.defaultProps = {
  color: colors_NOT_REACTIVE.black,
};

export default CloseCircledIcon;
