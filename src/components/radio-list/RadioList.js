import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { PropTypes } from 'prop-types';
import React, { createElement, PureComponent } from 'react';
import { ListItem, ListItemDivider } from '../list';
import RadioListItem from './RadioListItem';

const getListItemLayout = (data, index) => ({
  index,
  length: ListItem.height,
  offset: ListItem.height * index,
});

export default class RadioList extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
          .isRequired,
      })
    ),
    onChange: PropTypes.func,
    renderItem: PropTypes.func,
    value: PropTypes.string,
  };

  static defaultProps = {
    renderItem: RadioListItem,
  };

  state = { selected: this.props.value };

  handleChange = selected => {
    this.setState({ selected }, () => {
      if (this.props.onChange) {
        this.props.onChange(selected);
      }
    });
  };

  renderItem = ({ item }) =>
    createElement(this.props.renderItem, {
      ...item,
      onPress: this.handleChange,
      selected: item.forceSelected || item.value === this.state.selected,
    });

  render = () => (
    <BottomSheetFlatList
      {...this.props}
      ItemSeparatorComponent={ListItemDivider}
      data={this.props.items}
      getItemLayout={this.props.getItemLayout ?? getListItemLayout}
      removeClippedSubviews
      renderItem={this.renderItem}
    />
  );
}
