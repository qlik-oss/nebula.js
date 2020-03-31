import React, { useContext } from 'react';

import { Grid } from '@material-ui/core';

import { close } from '@nebula.js/ui/icons/close';
import { tick } from '@nebula.js/ui/icons/tick';
import { clearSelections } from '@nebula.js/ui/icons/clear-selections';

import InstanceContext from '../contexts/InstanceContext';
import Item from './SelectionToolbarItem';

const SelectionToolbar = React.forwardRef(({ layout, items }, ref) => {
  return (
    <Grid container spacing={0} wrap="nowrap">
      {items.map((e, ix) => (
        <Grid item key={e.key}>
          <Item key={e.key} layout={layout} item={e} ref={ix === 0 ? ref : null} />
        </Grid>
      ))}
    </Grid>
  );
});

const SelectionToolbarWithDefault = ({ layout, api, xItems = [], onCancel = () => {}, onConfirm = () => {} }) => {
  const { translator } = useContext(InstanceContext);

  const items = [
    ...xItems,
    {
      key: 'clear',
      type: 'icon-button',
      label: translator.get('Selection.Clear'),
      enabled: () => api.canClear(),
      action: () => api.clear(),
      getSvgIconShape: clearSelections,
    },
    {
      key: 'cancel',
      type: 'icon-button',
      label: translator.get('Selection.Cancel'),
      enabled: () => api.canCancel(),
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
      enabled: () => api.canConfirm(),
      action: () => {
        api.confirm();
        onConfirm();
      },
      getSvgIconShape: tick,
    },
  ];
  return <SelectionToolbar layout={layout} items={items} />;
};

export default SelectionToolbarWithDefault;
export { SelectionToolbar };
