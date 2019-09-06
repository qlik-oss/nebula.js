import { selectAll } from '@nebula.js/ui/icons/select-all';
import { selectAlternative } from '@nebula.js/ui/icons/select-alternative';
import { selectPossible } from '@nebula.js/ui/icons/select-possible';
import { selectExcluded } from '@nebula.js/ui/icons/select-excluded';

export default ({ layout, model, translator, onSelected = () => {} }) => {
  const canSelectAll = () => {
    return ['qOption', 'qAlternative', 'qExcluded', 'qDeselected'].some(sc => {
      return layout.qListObject.qDimensionInfo.qStateCounts[sc] > 0;
    });
  };
  const canSelectPossible = () => {
    return ['qOption'].some(sc => {
      return layout.qListObject.qDimensionInfo.qStateCounts[sc] > 0;
    });
  };
  const canSelectAlternative = () => {
    return ['qAlternative'].some(sc => {
      return layout.qListObject.qDimensionInfo.qStateCounts[sc] > 0;
    });
  };
  const canSelectExcluded = () => {
    return ['qAlternative', 'qExcluded'].some(sc => {
      return layout.qListObject.qDimensionInfo.qStateCounts[sc] > 0;
    });
  };

  return [
    {
      key: 'selectAll',
      type: 'menu-icon-button',
      label: translator.get('Selection.SelectAll'),
      getSvgIconShape: selectAll,
      enabled: canSelectAll,
      action: () => {
        model.selectListObjectAll('/qListObjectDef');
        onSelected();
      },
    },
    {
      key: 'selectPossible',
      type: 'menu-icon-button',
      label: translator.get('Selection.SelectPossible'),
      getSvgIconShape: selectPossible,
      enabled: canSelectPossible,
      action: () => {
        model.selectListObjectPossible('/qListObjectDef');
        onSelected();
      },
    },
    {
      key: 'selectAlternative',
      type: 'menu-icon-button',
      label: translator.get('Selection.SelectAlternative'),
      getSvgIconShape: selectAlternative,
      enabled: canSelectAlternative,
      action: () => {
        model.selectListObjectAlternative('/qListObjectDef');
        onSelected();
      },
    },
    {
      key: 'selectExcluded',
      type: 'menu-icon-button',
      label: translator.get('Selection.SelectExcluded'),
      getSvgIconShape: selectExcluded,
      enabled: canSelectExcluded,
      action: () => {
        model.selectListObjectExcluded('/qListObjectDef');
        onSelected();
      },
    },
  ];
};
