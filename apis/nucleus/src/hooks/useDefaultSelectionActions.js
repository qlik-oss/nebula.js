import { useContext } from 'react';

import { close } from '@nebula.js/ui/icons/close';
import { tick } from '@nebula.js/ui/icons/tick';
import { clearSelections } from '@nebula.js/ui/icons/clear-selections';
import InstanceContext from '../contexts/InstanceContext';

export default function useDefaultSelectionActions({ api, onConfirm = () => {}, onCancel = () => {} }) {
  const { translator } = useContext(InstanceContext);
  return [
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
      action: (evt) => {
        api.cancel();
        onCancel(evt);
      },
      getSvgIconShape: close,
    },
    {
      key: 'confirm',
      type: 'icon-button',
      label: translator.get('Selection.Confirm'),
      enabled: () => api.canConfirm(),
      action: (evt) => {
        api.confirm();
        onConfirm(evt);
      },
      getSvgIconShape: tick,
    },
  ];
}
