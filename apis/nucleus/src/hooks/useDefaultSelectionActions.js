import { useContext } from 'react';

import { close } from '@nebula.js/ui/icons/close';
import { tick } from '@nebula.js/ui/icons/tick';
import { clearSelections } from '@nebula.js/ui/icons/clear-selections';
import InstanceContext from '../contexts/InstanceContext';

export default function useDefaultSelectionActions({
  api,
  layout,
  onConfirm = () => {},
  onCancel = () => {},
  onKeyDeactivate = () => {},
}) {
  const { translator } = useContext(InstanceContext);
  return [
    {
      key: 'clear',
      type: 'icon-button',
      label: translator.get('Selection.Clear'),
      enabled: () => api.canClear(layout),
      action: () => api.clear(),
      getSvgIconShape: clearSelections,
    },
    {
      key: 'cancel',
      type: 'icon-button',
      label: translator.get('Selection.Cancel'),
      enabled: () => api.canCancel(layout),
      action: () => {
        onCancel();
        api.cancel();
      },
      keyboardAction: () => {
        onKeyDeactivate();
        onCancel();
        api.cancel();
      },
      getSvgIconShape: close,
    },
    {
      key: 'confirm',
      type: 'icon-button',
      label: translator.get('Selection.Confirm'),
      enabled: () => api.canConfirm(layout),
      action: () => {
        onConfirm();
        api.confirm();
      },
      keyboardAction: () => {
        onKeyDeactivate();
        onConfirm();
        api.confirm();
      },
      getSvgIconShape: tick,
    },
  ];
}
