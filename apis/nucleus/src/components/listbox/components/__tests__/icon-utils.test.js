import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import CyclicIcon from '@nebula.js/ui/icons/reload';
import utils from '../ListBoxHeader/icon-utils';

describe('icon-utils', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return no icon data for single dimension', () => {
    const dimInfo = { qGrouping: 'N' };
    const result = utils.createDimensionIconData(dimInfo, undefined);
    expect(result).toEqual(undefined);
  });

  it('should return icon data for drilldown dimension', () => {
    const dimInfo = { qGrouping: 'H' };
    const result = utils.createDimensionIconData(dimInfo, undefined);
    expect(result).toMatchObject({
      icon: DrillDownIcon,
      tooltip: 'Tooltip.dimensions.drilldown',
      onClick: undefined,
    });
  });

  it('should return no icon data for cyclic dimension', () => {
    const dimInfo = { qGrouping: 'C' };
    const app = {};
    const result = utils.createDimensionIconData(dimInfo, app);
    expect(result).toMatchObject({
      icon: CyclicIcon,
      tooltip: 'Tooltip.dimensions.cyclic',
      onClick: expect.any(Function),
    });
  });
});
