import React from 'react';

import { IconButton, Button } from '@nebula.js/ui/components';

import CloseIcon from '@nebula.js/ui/icons/close';
import TickIcon from '@nebula.js/ui/icons/tick';
import ClearSelections from '@nebula.js/ui/icons/clear-selections';

const ICONS = {
  close: CloseIcon,
  tick: TickIcon,
  'clear-selections': ClearSelections,
};

export default class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // active: props.item.active && props.item.active(),
      disabled: props.item.enabled && !props.item.enabled(),
    };
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      disabled: nextProps.item.enabled && !nextProps.item.enabled(),
    };
  }

  componentDidMount() {
    if (this.props.item.active && this.props.item.action && this.props.item.on) {
      this.onChange = () => {
        this.setState({
          // active: this.props.item.active && this.props.item.active(),
          disabled: this.props.item.enabled && !this.props.item.enabled(),
        });
      };

      this.props.item.on('changed', this.onChange);
    }
  }

  componentWillUnmount() {
    if (this.onChange && this.props.item.removeListener) {
      this.props.item.removeListener('changed', this.onChange);
    }
    this.onChange = null;
  }

  render() {
    const { item } = this.props;
    const Icon = ICONS[item.icon] || '';
    return item.type === 'button' ? (
      <Button
        title={item.label}
        variant="contained"
        style={{ backgroundColor: item.color }}
        onClick={() => item.action()}
        disabled={this.state.disabled}
      >
        {Icon && <Icon />}
      </Button>
    ) : (
      <IconButton title={item.label} onClick={() => item.action()} disabled={this.state.disabled}>
        {Icon && <Icon />}
      </IconButton>
    );
  }
}
