import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import ReloadIcon from '@nebula.js/ui/icons/reload';
import CyclicIcon from '@nebula.js/ui/icons/cyclic';
import utils from '../ListBoxHeader/icon-utils';
import KEYS from '../../../../keys';
import * as keyboardNavMethod from '../../interactions/keyboard-navigation/keyboard-nav-methods';

describe('icon-utils', () => {
  it('should return no icon data for single dimension', () => {
    const dimInfo = { qGrouping: 'N' };
    const result = utils.createDimensionIconData({ dimInfo });
    expect(result).toEqual(undefined);
  });

  it('should return icon data for drilldown dimension', () => {
    const dimInfo = { qGrouping: 'H' };
    const result = utils.createDimensionIconData({ dimInfo });
    expect(result).toMatchObject({
      icon: DrillDownIcon,
      tooltip: 'Listbox.DrillDown',
      onClick: undefined,
    });
  });

  it('should return icon data for cyclic dimension', () => {
    const dimInfo = { qGrouping: 'C' };
    const app = {};
    const result = utils.createDimensionIconData({
      dimInfo,
      app,
      selections: { confirm: () => {} },
      isPopover: false,
      active: true,
    });
    expect(result).toMatchObject({
      icon: ReloadIcon,
      tooltip: 'Listbox.Cyclic',
      onClick: expect.any(Function),
    });
  });

  it('should return non interactive icon data for cyclic dimension when there is no app', () => {
    const dimInfo = { qGrouping: 'C' };
    const app = undefined;
    const result = utils.createDimensionIconData({ dimInfo, app });
    expect(result).toMatchObject({
      icon: CyclicIcon,
      tooltip: 'Listbox.Cyclic',
      onClick: undefined,
    });
  });

  describe('keyboard support for cyclic button', () => {
    const dimInfo = { qGrouping: 'C' };
    const dimensionModel = { stepCycle: jest.fn() };
    const app = { getDimension: jest.fn().mockResolvedValue(dimensionModel) };
    const selections = { confirm: jest.fn() };
    const flushPromises = () => new Promise(process.nextTick);
    const inputs = {
      dimInfo,
      app,
      selections,
      isPopover: false,
      active: true,
      keyboard: {
        enabled: true,
        focusSelection: jest.fn(),
        blur: jest.fn(),
      },
    };

    const event = {
      currentTarget: {
        closest: () => {},
      },
      target: {
        classList: {
          contains: () => true,
        },
      },
      keyCode: KEYS.SPACE,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    it('should have keyboard support', () => {
      const result = utils.createDimensionIconData(inputs);
      expect(result).toMatchObject({
        icon: ReloadIcon,
        tooltip: 'Listbox.Cyclic',
        onClick: expect.any(Function),
        onKeyDown: expect.any(Function),
      });
    });

    it('should step to next field of cyclic dimension when pressing SPACE or ENTER', async () => {
      const result = utils.createDimensionIconData(inputs);
      event.keyCode = KEYS.ENTER;
      result.onKeyDown(event);
      event.keyCode = KEYS.ENTER;
      result.onKeyDown(event);
      await flushPromises();
      expect(selections.confirm).toHaveBeenCalledTimes(2);
      expect(dimensionModel.stepCycle).toHaveBeenCalledTimes(2);
    });

    it('press TAB should focus on search input if it is visible', async () => {
      const result = utils.createDimensionIconData(inputs);
      event.keyCode = KEYS.TAB;

      jest.spyOn(keyboardNavMethod, 'focusSearch').mockReturnValue({});
      jest.spyOn(keyboardNavMethod, 'focusRow').mockReturnValue(null);

      result.onKeyDown(event);
      expect(keyboardNavMethod.focusSearch).toHaveBeenCalledTimes(1);
      expect(keyboardNavMethod.focusRow).toHaveBeenCalledTimes(0);
    });

    it('press TAB should focus on row if search input is not visible', async () => {
      const result = utils.createDimensionIconData(inputs);
      event.keyCode = KEYS.TAB;

      jest.spyOn(keyboardNavMethod, 'focusSearch').mockReturnValue(null);
      jest.spyOn(keyboardNavMethod, 'focusRow').mockReturnValue({});

      result.onKeyDown(event);
      expect(keyboardNavMethod.focusSearch).toHaveBeenCalledTimes(1);
      expect(keyboardNavMethod.focusRow).toHaveBeenCalledTimes(1);
    });

    it('should return focus to listbox container if cannot focus anything', async () => {
      const result = utils.createDimensionIconData(inputs);
      event.keyCode = KEYS.TAB;

      jest.spyOn(keyboardNavMethod, 'focusSearch').mockReturnValue(null);
      jest.spyOn(keyboardNavMethod, 'focusRow').mockReturnValue(null);

      result.onKeyDown(event);
      expect(inputs.keyboard.blur).toHaveBeenCalledTimes(1);
    });
  });
});
