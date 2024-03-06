import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import CyclicIcon from '@nebula.js/ui/icons/reload';

const dimensionTypes = {
  single: 'N',
  drillDown: 'H',
  cyclic: 'C',
};

const createDimensionIconData = (dimInfo, app) => {
  switch (dimInfo.qGrouping) {
    case dimensionTypes.drillDown:
      return {
        icon: DrillDownIcon,
        tooltip: 'Listbox.DrillDown',
        onClick: undefined,
      };
    case dimensionTypes.cyclic:
      return {
        icon: CyclicIcon,
        tooltip: 'Listbox.Cyclic',
        onClick: () => {
          app
            .getDimension(dimInfo.qLibraryId)
            .then((dimensionModel) => {
              dimensionModel.stepCycle(1);
            })
            .catch(() => null);
        },
      };
    default:
      return undefined;
  }
};

export default { createDimensionIconData };
