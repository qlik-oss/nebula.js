/* eslint-disable no-import-assign */
import glue from '../glue';
import * as CellModule from '../Cell';

jest.mock('react-dom', () => ({
  createPortal: () => {},
}));

describe('glue', () => {
  let param;
  beforeEach(() => {
    // we override default because CellModule is not a function
    // it is rendered react componet, a ready to show object presentation of component
    CellModule.default = () => 'Cell';

    param = {
      halo: {
        root: {
          add: jest.fn(),
          addCell: jest.fn(),
          remove: jest.fn(),
        },
      },
      element: {},
      model: {
        on: jest.fn(),
        removeListener: jest.fn(),
      },
      initialSnContext: {},
      initialSnOptions: {},
      onMount: () => {},
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  test('should glue outside world with react world', () => {
    const [dissolve] = glue(param);
    dissolve();
    expect(param.halo.root.add).toHaveBeenCalledTimes(1);
    expect(param.halo.root.addCell).toHaveBeenCalledTimes(1);
    expect(param.halo.root.remove).toHaveBeenCalledTimes(1);
    expect(param.model.on).toHaveBeenCalledTimes(1);
    expect(param.model.removeListener).toHaveBeenCalledTimes(1);
  });
});
