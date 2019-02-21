import preact from 'preact';
import Button from './Button';
import FadeButton from './FadeButton';
import Icon from './Icon';

import { prefixer } from '../utils/utils';
/* eslint react/no-multi-comp: 0 */

class Item extends preact.Component {
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
    const Btn = props.type === 'fade-button' || this.props.isCustom ? FadeButton : Button;
    return (
      <Btn
        onClick={() => props.action()}
        variant={props.variant}
        active={this.state.active}
        disabled={this.state.disabled}
      >
        {props.icon ? <Icon name={props.icon} /> : props.label}
      </Btn>
    );
  }
}

class Component extends preact.Component {
  constructor(props) {
    super(props);
    const api = props.sn.component.selections;

    this.state = {
      confirmable: api.canConfirm(),
      cancelable: api.canCancel(),
      clearable: api.canClear(),
    };

    const items = [];

    items.push({
      key: 'confirm',
      type: 'fade-button',
      label: 'Confirm',
      // variant: 'success',
      icon: 'tick',
      enabled: () => this.state.confirmable,
      action: () => api.confirm(props.sn.component),
    });

    items.push({
      key: 'cancel',
      type: 'fade-button',
      label: 'Cancel',
      // variant: 'danger',
      icon: 'close',
      enabled: () => this.state.cancelable,
      action: () => api.cancel(props.sn.component),
    });

    items.push({
      key: 'clear',
      type: 'fade-button',
      label: 'Clear',
      icon: 'clear-selections',
      enabled: () => this.state.clearable,
      action: () => api.clear(props.sn.component),
    });

    this.listeners = [];
    this.custom = {};

    (props.sn.selectionToolbar.items || []).forEach((item) => {
      this.custom[item.key] = true;
      items.push(item);
    });

    items.reverse();

    this.state.items = items;
  }

  static getDerivedStateFromProps(nextProps) {
    const api = nextProps.sn.component.selections;
    return {
      confirmable: api.canConfirm(),
      cancelable: api.canCancel(),
      clearable: api.canClear(),
    };
  }

  render() {
    return (
      <div className={prefixer('selection-toolbar')}>
        {this.state.items.map(itm => <Item key={itm.key} item={itm} isCustom={!!this.custom[itm.key]} />)}
      </div>
    );
  }
}

export default Component;
