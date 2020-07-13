import PropTypes from 'prop-types';
import React from 'react';
import { Path } from 'react-native-svg';
import Svg from '../Svg';
import { colors } from '@rainbow-me/styles';

const CameraIcon = ({ color, ...props }) => (
  <Svg height="19" viewBox="0 0 18 19" width="18" {...props}>
    <Path
      d="M17.2058824,6.9886921 C16.7058824,6.9886921 16.4215686,6.70422343 16.4215686,6.18433243 L16.4215686,3.86934605 C16.4215686,2.84918256 15.8627451,2.32929155 14.9019608,2.32929155 L12.5294118,2.32929155 C12.0098039,2.32929155 11.7254902,2.04482289 11.7254902,1.53474114 C11.7254902,1.03446866 12.0098039,0.75 12.5294118,0.75 L14.9215686,0.75 C16.9803922,0.75 18,1.76035422 18,3.78106267 L18,6.18433243 C18,6.70422343 17.7254902,6.9886921 17.2058824,6.9886921 Z M0.794117647,6.9886921 C0.284313725,6.9886921 0,6.70422343 0,6.18433243 L0,3.78106267 C0,1.76035422 1.03921569,0.75 3.07843137,0.75 L5.48039216,0.75 C5.99019608,0.75 6.2745098,1.03446866 6.2745098,1.53474114 C6.2745098,2.04482289 5.99019608,2.32929155 5.48039216,2.32929155 L3.10784314,2.32929155 C2.12745098,2.32929155 1.57843137,2.84918256 1.57843137,3.86934605 L1.57843137,6.18433243 C1.57843137,6.70422343 1.30392157,6.9886921 0.794117647,6.9886921 Z M3.07843137,18.75 C1.03921569,18.75 0,17.7396458 0,15.7091281 L0,13.3156676 C0,12.7957766 0.274509804,12.5113079 0.794117647,12.5113079 C1.29411765,12.5113079 1.57843137,12.7957766 1.57843137,13.3156676 L1.57843137,15.630654 C1.57843137,16.6508174 2.12745098,17.1707084 3.10784314,17.1707084 L5.48039216,17.1707084 C5.99019608,17.1707084 6.2745098,17.4551771 6.2745098,17.9652589 C6.2745098,18.4655313 5.99019608,18.75 5.48039216,18.75 L3.07843137,18.75 Z M12.5294118,18.75 C12.0098039,18.75 11.7254902,18.4655313 11.7254902,17.9652589 C11.7254902,17.4551771 12.0098039,17.1707084 12.5294118,17.1707084 L14.9019608,17.1707084 C15.8627451,17.1707084 16.4215686,16.6508174 16.4215686,15.630654 L16.4215686,13.3156676 C16.4215686,12.7957766 16.6960784,12.5113079 17.2058824,12.5113079 C17.7156863,12.5113079 18,12.7957766 18,13.3156676 L18,15.7091281 C18,17.7298365 16.9803922,18.75 14.9215686,18.75 L12.5294118,18.75 Z M10.7391653,9.29387373 C9.87988229,9.29387373 9.46201177,8.87600321 9.46201177,7.99317817 L9.46201177,5.55069556 C9.46201177,4.66787052 9.87988229,4.25 10.7391653,4.25 L13.2228464,4.25 C14.0821295,4.25 14.5,4.66787052 14.5,5.55069556 L14.5,7.99317817 C14.5,8.87600321 14.0821295,9.29387373 13.2228464,9.29387373 L10.7391653,9.29387373 Z M4.78303906,9.29387373 C3.92375602,9.29387373 3.5,8.87600321 3.5,7.99317817 L3.5,5.55069556 C3.5,4.66787052 3.92375602,4.25 4.78303906,4.25 L7.26672017,4.25 C8.12600321,4.25 8.54387373,4.66787052 8.54387373,5.55069556 L8.54387373,7.99317817 C8.54387373,8.87600321 8.12600321,9.29387373 7.26672017,9.29387373 L4.78303906,9.29387373 Z M4.75361156,8.35219369 L7.28437667,8.35219369 C7.50214018,8.35219369 7.60807919,8.24625468 7.60807919,8.02260567 L7.60807919,5.50949706 C7.60807919,5.29173355 7.50214018,5.18579454 7.28437667,5.18579454 L4.75361156,5.18579454 C4.54173355,5.18579454 4.44168004,5.29173355 4.44168004,5.50949706 L4.44168004,8.02260567 C4.44168004,8.24625468 4.54173355,8.35219369 4.75361156,8.35219369 Z M10.7156233,8.35219369 L13.2522739,8.35219369 C13.464152,8.35219369 13.5642055,8.24625468 13.5642055,8.02260567 L13.5642055,5.50949706 C13.5642055,5.29173355 13.464152,5.18579454 13.2522739,5.18579454 L10.7156233,5.18579454 C10.4978598,5.18579454 10.3978063,5.29173355 10.3978063,5.50949706 L10.3978063,8.02260567 C10.3978063,8.24625468 10.4978598,8.35219369 10.7156233,8.35219369 Z M5.49518459,7.42228464 C5.40101659,7.42228464 5.37158909,7.38108614 5.37158909,7.27514714 L5.37158909,6.25695559 C5.37158909,6.15690209 5.40101659,6.12158909 5.49518459,6.12158909 L6.54280364,6.12158909 C6.63697164,6.12158909 6.67228464,6.15690209 6.67228464,6.25695559 L6.67228464,7.27514714 C6.67228464,7.38108614 6.63697164,7.42228464 6.54280364,7.42228464 L5.49518459,7.42228464 Z M11.4807384,7.42228464 C11.3865704,7.42228464 11.3571429,7.38108614 11.3571429,7.27514714 L11.3571429,6.25695559 C11.3571429,6.15690209 11.3865704,6.12158909 11.4807384,6.12158909 L12.5342429,6.12158909 C12.6225254,6.12158909 12.6637239,6.15690209 12.6637239,6.25695559 L12.6637239,7.27514714 C12.6637239,7.38108614 12.6225254,7.42228464 12.5342429,7.42228464 L11.4807384,7.42228464 Z M4.78303906,15.25 C3.92375602,15.25 3.5,14.8321295 3.5,13.9493044 L3.5,11.5068218 C3.5,10.6239968 3.92375602,10.2061263 4.78303906,10.2061263 L7.26672017,10.2061263 C8.12600321,10.2061263 8.54387373,10.6239968 8.54387373,11.5068218 L8.54387373,13.9493044 C8.54387373,14.8321295 8.12600321,15.25 7.26672017,15.25 L4.78303906,15.25 Z M9.87399679,11.7834403 C9.77982879,11.7834403 9.75040128,11.7422418 9.75040128,11.6363028 L9.75040128,10.6181113 C9.75040128,10.5180578 9.77982879,10.4827448 9.87399679,10.4827448 L10.9216158,10.4827448 C11.0157838,10.4827448 11.0510968,10.5180578 11.0510968,10.6181113 L11.0510968,11.6363028 C11.0510968,11.7422418 11.0157838,11.7834403 10.9216158,11.7834403 L9.87399679,11.7834403 Z M13.0227394,11.7834403 C12.9344569,11.7834403 12.9050294,11.7422418 12.9050294,11.6363028 L12.9050294,10.6181113 C12.9050294,10.5180578 12.9344569,10.4827448 13.0227394,10.4827448 L14.076244,10.4827448 C14.170412,10.4827448 14.205725,10.5180578 14.205725,10.6181113 L14.205725,11.6363028 C14.205725,11.7422418 14.170412,11.7834403 14.076244,11.7834403 L13.0227394,11.7834403 Z M4.75361156,14.3142055 L7.28437667,14.3142055 C7.50214018,14.3142055 7.60807919,14.2082665 7.60807919,13.9846174 L7.60807919,11.4715088 C7.60807919,11.2478598 7.50214018,11.1419208 7.28437667,11.1419208 L4.75361156,11.1419208 C4.54173355,11.1419208 4.44168004,11.2478598 4.44168004,11.4715088 L4.44168004,13.9846174 C4.44168004,14.2082665 4.54173355,14.3142055 4.75361156,14.3142055 Z M11.4630819,13.3607544 C11.3747994,13.3607544 11.3453719,13.3195559 11.3453719,13.2136169 L11.3453719,12.1954254 C11.3453719,12.0953719 11.3747994,12.0541734 11.4630819,12.0541734 L12.5165864,12.0541734 C12.6048689,12.0541734 12.6460674,12.0953719 12.6460674,12.1954254 L12.6460674,13.2136169 C12.6460674,13.3195559 12.6048689,13.3607544 12.5165864,13.3607544 L11.4630819,13.3607544 Z M5.49518459,13.3784109 C5.40101659,13.3784109 5.37158909,13.3430979 5.37158909,13.2371589 L5.37158909,12.2130819 C5.37158909,12.1130284 5.40101659,12.0777154 5.49518459,12.0777154 L6.54280364,12.0777154 C6.63697164,12.0777154 6.67228464,12.1130284 6.67228464,12.2130819 L6.67228464,13.2371589 C6.67228464,13.3430979 6.63697164,13.3784109 6.54280364,13.3784109 L5.49518459,13.3784109 Z M9.87399679,14.932183 C9.77982879,14.932183 9.75040128,14.89687 9.75040128,14.790931 L9.75040128,13.7668539 C9.75040128,13.6726859 9.77982879,13.6314874 9.87399679,13.6314874 L10.9216158,13.6314874 C11.0157838,13.6314874 11.0510968,13.6726859 11.0510968,13.7668539 L11.0510968,14.790931 C11.0510968,14.89687 11.0157838,14.932183 10.9216158,14.932183 L9.87399679,14.932183 Z M13.0227394,14.932183 C12.9344569,14.932183 12.9050294,14.89687 12.9050294,14.790931 L12.9050294,13.7668539 C12.9050294,13.6726859 12.9344569,13.6314874 13.0227394,13.6314874 L14.076244,13.6314874 C14.170412,13.6314874 14.205725,13.6726859 14.205725,13.7668539 L14.205725,14.790931 C14.205725,14.89687 14.170412,14.932183 14.076244,14.932183 L13.0227394,14.932183 Z"
      fill={color}
      fillRule="nonzero"
    />
  </Svg>
);

CameraIcon.propTypes = {
  color: PropTypes.string,
};

CameraIcon.defaultProps = {
  color: colors.black,
};

export default CameraIcon;
