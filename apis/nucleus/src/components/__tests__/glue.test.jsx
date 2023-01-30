/* eslint-disable no-import-assign */
import * as ReactDOM from 'react-dom';
import glue from '../glue';
import * as CellModule from '../Cell';

jest.mock('react-dom', () => ({
  createPortal: jest.fn(),
}));

describe('glue', () => {
  let param;
  let createPortalMock;
  beforeEach(() => {
    // we override default because CellModule is not a function
    // it is rendered react componet, a ready to show object presentation of component
    CellModule.default = () => 'Cell';
    createPortalMock = jest.fn();

    param = {
      halo: {
        root: {
          add: jest.fn(),
          addCell: jest.fn(),
          remove: jest.fn(),
        },
      },
      model: {
        on: jest.fn(),
        removeListener: jest.fn(),
      },
      initialSnContext: {},
      initialSnOptions: {},
      onMount: () => {},
      element: document.createElement('div'),
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

  test('should run create portal with `uid()`', () => {
    jest.spyOn(ReactDOM, 'createPortal').mockImplementation(createPortalMock);
    glue(param);
    expect(createPortalMock).toHaveBeenCalledTimes(1);
    expect(createPortalMock).toHaveBeenCalledWith(expect.anything(), expect.any(HTMLDivElement), expect.any(String));
  });
});
