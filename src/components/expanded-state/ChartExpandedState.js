import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { InteractionManager } from 'react-native';
import {
  compose,
  onlyUpdateForKeys,
  withHandlers,
  withProps,
  withState,
} from 'recompact';
import styled from 'styled-components/primitives';
import { withAccountData, withAccountSettings } from '../../hoc';
import { ethereumUtils, deviceUtils } from '../../utils';
import ValueChart from '../value-chart/ValueChart';
import { BalanceCoinRow } from '../coin-row';
import BottomSendButtons from '../value-chart/BottomSendButtons';
import { colors } from '../../styles';
import Divider from '../Divider';
import { Icon } from '../icons';
import { data1, data2, data3, data4 } from '../value-chart/data';

const HandleIcon = styled(Icon).attrs({
  color: '#C4C6CB',
  name: 'handle',
})`
  margin-top: 12px;
`;

const ChartContainer = styled.View`
  align-items: center;
  overflow: hidden;
  padding-top: 18px;
  padding-bottom: ${deviceUtils.isTallPhone ? '60px' : '30px'};
`;

const BottomContainer = styled.View`
  background-color: ${colors.white};
  width: ${deviceUtils.dimensions.width};
  padding-top: 8px;
  padding-bottom: 25px;
`;

const Container = styled.View`
  background-color: ${colors.white};
  width: ${deviceUtils.dimensions.width};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  bottom: 0;
  position: absolute;
  align-items: center;
`;

const TokenExpandedState = ({ onPressSend, onPressSwap, selectedAsset }) => {
  const data = [data1, data2, data3, data4];
  return (
    <Container>
      <HandleIcon />
      <BottomContainer>
        <BalanceCoinRow {...selectedAsset} />
        <BottomSendButtons
          onPressSend={onPressSend}
          onPressSwap={onPressSwap}
        />
      </BottomContainer>
      <Divider />
      <ChartContainer>
        <ValueChart
          // DONE:
          mode="detailed" // "gesture-managed" / "detailed" / "simplified"
          enableSelect // enable checking value in touched point of chart

          // TODO:
          sectionsRender="switch-between" // "switch-between" (for switch between there must be fixed amount of points in every section, if you want to lower amount is points to some certain value specify amountOfPoints prop) / "one-chart"
          amountOfPathPoints={288} // amount of points for switch between charts
          generateImportantPoints // you can specify if you want to select important points in data or do it automatically inside chart
          data={data}
          // data={[
          //   {
          //     name: '1W',
          //     segments: [
          //       {
          //         color: 'red',
          //         line: 'dotted',
          //         points: [
          //           {
          //             important: true,
          //             timestamp: 0,
          //             value: 0,
          //           },
          //         ],
          //         renderStartSeparator: () => null, // or renderEndSeparator
          //       },
          //     ],
          //   },
          // ]}
          // onValueUpdate={onValueUpdate}
          // currentDataSource={0}
        />
      </ChartContainer>
    </Container>
  );
};

TokenExpandedState.propTypes = {
  change: PropTypes.string,
  changeDirection: PropTypes.bool,
  isOpen: PropTypes.bool,
  onPressSend: PropTypes.func,
  onPressSwap: PropTypes.func,
  price: PropTypes.string,
  selectedAsset: PropTypes.object,
  subtitle: PropTypes.string,
  title: PropTypes.string,
};

export default compose(
  withAccountData,
  withAccountSettings,
  withState('isOpen', 'setIsOpen', false),
  withProps(({ asset: { address, ...asset }, assets }) => {
    let selectedAsset = ethereumUtils.getAsset(assets, address);
    if (!selectedAsset) {
      selectedAsset = asset;
    }
    return {
      change: get(selectedAsset, 'native.change', '-'),
      changeDirection: get(selectedAsset, 'price.relative_change_24h', 0) > 0,
      selectedAsset,
    };
  }),
  withHandlers({
    onOpen: ({ setIsOpen }) => () => {
      setIsOpen(true);
    },
    onPressSend: ({ navigation, asset }) => () => {
      navigation.goBack();

      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('SendSheet', { asset });
      });
    },
    onPressSwap: ({ navigation, asset }) => () => {
      navigation.goBack();

      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('ExchangeModal', { asset });
      });
    },
  }),
  onlyUpdateForKeys(['price', 'subtitle'])
)(TokenExpandedState);
