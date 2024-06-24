import CyclicIcon from '@nebula.js/ui/icons/cyclic';
import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import ReloadIcon from '@nebula.js/ui/icons/reload';
import KEYS from '../../../../keys';
import { focusRow, focusSearch } from '../../interactions/keyboard-navigation/keyboard-nav-methods';

const dimensionTypes = {
  single: 'N',
  drillDown: 'H',
  cyclic: 'C',
};

const createDimensionIconData = ({ dimInfo, app, selections, isPopover, active, keyboard, container }) => {
  switch (dimInfo.qGrouping) {
    case dimensionTypes.drillDown:
      return {
        icon: DrillDownIcon,
        tooltip: 'Listbox.DrillDown',
        onClick: undefined,
      };
    case dimensionTypes.cyclic: {
      const clickable = app && active;
      const stepToNextField = () => {
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
      };
      return {
        icon: clickable ? ReloadIcon : CyclicIcon,
        tooltip: 'Listbox.Cyclic',
        onClick: clickable && stepToNextField,
        onKeyDown: clickable
          ? (event) => {
              switch (event.keyCode) {
                case KEYS.SPACE:
                case KEYS.ENTER:
                  stepToNextField();
                  break;
                case KEYS.TAB:
                  event.preventDefault();
                  event.stopPropagation();
                  if (event.shiftKey && keyboard.enabled) {
                    keyboard.focusSelection();
                  } else {
                    focusSearch(container) || focusRow(container);
                  }
                  break;
                default:
                  break;
              }
            }
          : undefined,
      };
    }
    default:
      return undefined;
  }
};

export default { createDimensionIconData };
