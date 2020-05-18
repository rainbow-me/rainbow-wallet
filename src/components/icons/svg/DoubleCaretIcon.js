import PropTypes from 'prop-types';
import React from 'react';
import { Path } from 'react-native-svg';
import { colors } from '../../../styles';
import Svg from '../Svg';

const DoubleCaretIcon = ({ color, ...props }) => (
  <Svg height="20" width="13" viewBox="0 0 13 20" {...props}>
    <Path
      d="M12.6247321,15.3546242 L7.74942733,19.2548701 C7.01898988,19.8392204 5.98108377,19.8392204 5.25064631,19.2548701 L0.375341568,15.3546242 C-0.0559202758,15.0096145 -0.125841483,14.3803221 0.219168179,13.9490603 C0.564177842,13.5177984 1.19347023,13.4478772 1.62473208,13.7928869 L6.50003682,17.6931328 L11.3753416,13.7928869 C11.8066034,13.4478772 12.4358958,13.5177984 12.7809055,13.9490603 C13.1259151,14.3803221 13.0559939,15.0096145 12.6247321,15.3546242 Z M12.6247321,5.03850863 C13.0559939,5.3835183 13.1259151,6.01281069 12.7809055,6.44407253 C12.4358958,6.87533438 11.8066034,6.94525558 11.3753416,6.60024592 L6.50003682,2.7 L1.62473208,6.60024592 C1.19347023,6.94525558 0.564177842,6.87533438 0.219168179,6.44407253 C-0.125841483,6.01281069 -0.0559202758,5.3835183 0.375341568,5.03850863 L5.25064631,1.13826271 C5.98108377,0.553912429 7.01898988,0.553912429 7.74942733,1.13826271 L12.6247321,5.03850863 Z"
      fill={color}
      fillRule="nonzero"
    />
  </Svg>
);

DoubleCaretIcon.propTypes = {
  color: PropTypes.string,
};

DoubleCaretIcon.defaultProps = {
  color: colors.dark,
};

export default DoubleCaretIcon;
