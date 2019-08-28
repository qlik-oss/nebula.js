import React, { useContext, useMemo } from 'react';

import Item from './SelectionToolbarItem';
import LocaleContext from '../contexts/LocaleContext';

function Component({ api, items = [] }) {
  const translator = useContext(LocaleContext);

  const s = {
    confirmable: api.canConfirm(),
    cancelable: api.canCancel(),
    clearable: api.canClear(),
  };

  const { allItems, custom } = useMemo(() => {
    const arr = [
      {
        key: 'confirm',
        type: 'icon-button',
        label: translator.get('Selection.Confirm'),
        icon: 'tick',
        enabled: () => s.confirmable,
        action: () => api.confirm(),
      },
      {
        key: 'cancel',
        type: 'icon-button',
        label: translator.get('Selection.Cancel'),
        icon: 'close',
        enabled: () => s.cancelable,
        action: () => api.cancel(),
      },
      {
        key: 'clear',
        type: 'icon-button',
        label: translator.get('Selection.Clear'),
        icon: 'clear-selections',
        enabled: () => s.clearable,
        action: () => api.clear(),
      },
    ];
    const c = {};
    items.forEach(item => {
      c[item.key] = true;
      arr.push(item);
    });

    return { allItems: arr.reverse(), custom: c };
  }, [s.confirmable, s.cancelable, s.clearable, items]);

  return (
    <div>
      {allItems.map(itm => (
        <Item key={itm.key} item={itm} isCustom={!!custom[itm.key]} />
      ))}
    </div>
  );
}

export default Component;
