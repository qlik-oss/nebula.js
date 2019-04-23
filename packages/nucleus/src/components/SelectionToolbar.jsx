import React from 'react';
import styled from '@nebula.js/ui/components/styled';

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

    this.styledClasses = styled({
      position: 'absolute',
      left: '0',
      right: '0',
      top: '-48px',
      padding: '8px',
      boxSizing: 'border-box',
      background: '$grey100',
      display: 'flex',
      justifyContent: 'flex-end',
    }).join(' ');

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
      <div className={this.styledClasses}>
        {this.state.items.map(itm => <Item key={itm.key} item={itm} isCustom={!!this.custom[itm.key]} />)}
      </div>
    );
  }
}

export default Component;
