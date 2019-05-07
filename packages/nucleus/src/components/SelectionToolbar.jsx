import React from 'react';

import Item from './SelectionToolbarItem';

class Component extends React.Component {
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
      type: 'icon-button',
      label: 'Confirm',
      icon: 'tick',
      enabled: () => this.state.confirmable,
      action: () => api.confirm(props.sn.component),
    });

    items.push({
      key: 'cancel',
      type: 'icon-button',
      label: 'Cancel',
      icon: 'close',
      enabled: () => this.state.cancelable,
      action: () => api.cancel(props.sn.component),
    });

    items.push({
      key: 'clear',
      type: 'icon-button',
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
      <div>
        {this.state.items.map(itm => <Item key={itm.key} item={itm} isCustom={!!this.custom[itm.key]} />)}
      </div>
    );
  }
}

export default Component;
