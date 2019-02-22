import preact from 'preact';

import Item from './SelectionToolbarItem';

import { prefixer } from '../utils/utils';
/* eslint react/no-multi-comp: 0 */

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

    // TODO - translations
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
