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
              if (!dimensionModel.stepCycle) {
                // eslint-disable-next-line no-console
                console.log("engine version or engine api spec version doesn't have support for function stepCycle");
              }
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
