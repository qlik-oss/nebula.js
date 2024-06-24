import { selectAll } from '@nebula.js/ui/icons/select-all';
import { selectAlternative } from '@nebula.js/ui/icons/select-alternative';
import { selectPossible } from '@nebula.js/ui/icons/select-possible';
import { selectExcluded } from '@nebula.js/ui/icons/select-excluded';

export default ({ layout, model, translator, selectionState, isDirectQuery = false, selections }) => {
  if (layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne) {
    return [];
  }
  const path = '/qListObjectDef';
  const activateSelection = () => {
    if (!selections.isActive()) {
      selections.begin(path);
    }
  };
  const canSelectAll = () =>
    ['qOption', 'qAlternative', 'qExcluded', 'qDeselected'].some(
      (sc) => layout.qListObject.qDimensionInfo.qStateCounts[sc] > 0
    );
  const canSelectPossible = () => ['qOption'].some((sc) => layout.qListObject.qDimensionInfo.qStateCounts[sc] > 0);
  const canSelectAlternative = () =>
    ['qAlternative'].some((sc) => layout.qListObject.qDimensionInfo.qStateCounts[sc] > 0);
  const canSelectExcluded = () =>
    ['qAlternative', 'qExcluded'].some((sc) => layout.qListObject.qDimensionInfo.qStateCounts[sc] > 0);

  return [
    {
      key: 'selectAll',
      type: 'menu-icon-button',
      label: translator.get('Selection.SelectAll'),
      getSvgIconShape: selectAll,
      enabled: canSelectAll,
      action: () => {
        activateSelection();
        selectionState.clearItemStates(false);
        model.selectListObjectAll(path);
      },
    },
    {
      key: 'selectPossible',
      type: 'menu-icon-button',
      label: translator.get('Selection.SelectPossible'),
      getSvgIconShape: selectPossible,
      enabled: canSelectPossible,
      action: () => {
        activateSelection();
        selectionState.clearItemStates(false);
        model.selectListObjectPossible(path);
      },
    },
    isDirectQuery
      ? false
      : {
          key: 'selectAlternative',
          type: 'menu-icon-button',
          label: translator.get('Selection.SelectAlternative'),
          getSvgIconShape: selectAlternative,
          enabled: canSelectAlternative,
          action: () => {
            activateSelection();
            selectionState.clearItemStates(false);
            model.selectListObjectAlternative(path);
          },
        },
    isDirectQuery
      ? false
      : {
          key: 'selectExcluded',
          type: 'menu-icon-button',
          label: translator.get('Selection.SelectExcluded'),
          getSvgIconShape: selectExcluded,
          enabled: canSelectExcluded,
          action: () => {
            activateSelection();
            selectionState.clearItemStates(false);
            model.selectListObjectExcluded(path);
          },
        },
  ].filter(Boolean);
};
