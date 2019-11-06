import React, { useContext } from 'react';
import { close } from '@nebula.js/ui/icons/close';
import { tick } from '@nebula.js/ui/icons/tick';
import { clearSelections } from '@nebula.js/ui/icons/clear-selections';

import LocaleContext from '../contexts/LocaleContext';
import Item from './SelectionToolbarItem';

const SelectionToolbar = React.forwardRef(({ items }, ref) => {
  return (
    <>
      {items.map((e, ix) => (
        <Item key={e.key} item={e} ref={ix === 0 ? ref : null} />
      ))}
    </>
  );
});

const SelectionToolbarWithDefault = ({ api, xItems = [], onCancel = () => {}, onConfirm = () => {} }) => {
  const translator = useContext(LocaleContext);

  const items = [
    ...xItems,
    {
      key: 'clear',
      type: 'icon-button',
      label: translator.get('Selection.Clear'),
      icon: 'clear-selections',
      enabled: () => api.canClear(),
      disabled: !api.canClear(),
      action: () => api.clear(),
      getSvgIconShape: clearSelections,
    },
    {
      key: 'cancel',
      type: 'icon-button',
      label: translator.get('Selection.Cancel'),
      icon: 'close',
      enabled: () => api.canCancel(),
      disabled: !api.canCancel(),
      action: () => {
        api.cancel();
        onCancel();
      },
      getSvgIconShape: close,
    },
    {
      key: 'confirm',
      type: 'icon-button',
      label: translator.get('Selection.Confirm'),
      icon: 'tick',
      enabled: () => api.canConfirm(),
      disabled: !api.canConfirm(),
      action: () => {
        api.confirm();
        onConfirm();
      },
      getSvgIconShape: tick,
    },
  ];

  return <SelectionToolbar items={items} />;
};

export default SelectionToolbarWithDefault;
export { SelectionToolbar };
