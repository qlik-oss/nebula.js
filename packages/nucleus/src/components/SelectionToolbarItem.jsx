import React from 'react';

import ButtonInline from '@nebula.js/ui/components/ButtonInline';

import CloseIcon from '@nebula.js/ui/icons/Close';
import TickIcon from '@nebula.js/ui/icons/Tick';
import ClearSelections from '@nebula.js/ui/icons/ClearSelections';

const ICONS = {
  close: CloseIcon,
  tick: TickIcon,
  'clear-selections': ClearSelections,
};

export default class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.item.active && props.item.active(),
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
          active: this.props.item.active && this.props.item.active(),
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
    const props = this.props.item;
    const Icon = ICONS[props.icon] || null;
    return (
      <ButtonInline
        onClick={() => props.action()}
        active={this.state.active}
        disabled={this.state.disabled}
      >
        {<Icon />}
      </ButtonInline>
    );
  }
}
