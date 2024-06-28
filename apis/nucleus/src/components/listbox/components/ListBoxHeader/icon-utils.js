import CyclicIcon from '@nebula.js/ui/icons/cyclic';
import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import ReloadIcon from '@nebula.js/ui/icons/reload';
import KEYS from '../../../../keys';
import { blur, focusRow, focusSearch } from '../../interactions/keyboard-navigation/keyboard-nav-methods';

const dimensionTypes = {
  single: 'N',
  drillDown: 'H',
  cyclic: 'C',
};

const createDimensionIconData = ({ dimInfo, app, selections, isPopover, active, keyboard }) => {
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
        onClick: clickable ? stepToNextField : undefined,
        onKeyDown: clickable
          ? (event) => {
              const container = event.currentTarget.closest('.listbox-container');
              switch (event.keyCode) {
                case KEYS.SPACE:
                case KEYS.ENTER:
                  stepToNextField();
                  break;
                case KEYS.TAB:
                  {
                    let focused;
                    if (event.shiftKey && keyboard.enabled) {
                      focused = keyboard.focusSelection();
                    } else {
                      focused = focusSearch(container) || focusRow(container);
                    }
                    if (!focused) {
                      blur(event, keyboard);
                    }
                  }
                  break;
                default:
                  return;
              }
              event.preventDefault();
              event.stopPropagation();
            }
          : undefined,
      };
    }
    default:
      return undefined;
  }
};

export default { createDimensionIconData };
