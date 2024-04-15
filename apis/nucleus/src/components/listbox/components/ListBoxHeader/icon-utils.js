import CyclicIcon from '@nebula.js/ui/icons/cyclic';
import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import ReloadIcon from '@nebula.js/ui/icons/reload';

const dimensionTypes = {
  single: 'N',
  drillDown: 'H',
  cyclic: 'C',
};

const createDimensionIconData = (dimInfo, app, selections, isPopover, active) => {
  switch (dimInfo.qGrouping) {
    case dimensionTypes.drillDown:
      return {
        icon: DrillDownIcon,
        tooltip: 'Listbox.DrillDown',
        onClick: undefined,
      };
    case dimensionTypes.cyclic: {
      const clickable = app && active;
      return {
        icon: clickable ? ReloadIcon : CyclicIcon,
        tooltip: 'Listbox.Cyclic',
        onClick: clickable
          ? () => {
              if (!isPopover) {
                selections.confirm();
              }
              app
                .getDimension(dimInfo.qLibraryId)
                .then((dimensionModel) => {
                  if (!dimensionModel.stepCycle) {
                    // eslint-disable-next-line no-console
                    console.log("engine api spec version doesn't have support for function stepCycle");
                    return;
                  }
                  dimensionModel.stepCycle(1);
                })
                .catch(() => null);
            }
          : undefined,
      };
    }
    default:
      return undefined;
  }
};

export default { createDimensionIconData };
