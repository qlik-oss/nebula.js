import React, {
  useContext,
  useMemo,
} from 'react';

import Item from './SelectionToolbarItem';
import LocaleContext from '../contexts/LocaleContext';

function Component({
  sn,
}) {
  const translator = useContext(LocaleContext);
  const api = sn.component.selections;

  const s = {
    confirmable: api.canConfirm(),
    cancelable: api.canCancel(),
    clearable: api.canClear(),
  };

  const { items, custom } = useMemo(() => {
    const arr = [{
      key: 'confirm',
      type: 'icon-button',
      label: translator.get('Selection.Confirm'),
      icon: 'tick',
      enabled: () => s.confirmable,
      action: () => api.confirm(sn.component),
    }, {
      key: 'cancel',
      type: 'icon-button',
      label: translator.get('Selection.Cancel'),
      icon: 'close',
      enabled: () => s.cancelable,
      action: () => api.cancel(sn.component),
    }, {
      key: 'clear',
      type: 'icon-button',
      label: translator.get('Selection.Clear'),
      icon: 'clear-selections',
      enabled: () => s.clearable,
      action: () => api.clear(sn.component),
    }];
    const c = {};
    (sn.selectionToolbar.items || []).forEach((item) => {
      c[item.key] = true;
      arr.push(item);
    });

    return { items: arr.reverse(), custom: c };
  }, [s.confirmable, s.cancelable, s.clearable, sn && sn.selectionToolbar.items]);

  return (
    <div>
      {items.map((itm) => <Item key={itm.key} item={itm} isCustom={!!custom[itm.key]} />)}
    </div>
  );
}

export default Component;
