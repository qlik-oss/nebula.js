/* eslint no-underscore-dangle:0 */
import * as stardustUtils from '@nebula.js/stardust';
import { create } from '../index';

jest.mock('@nebula.js/stardust');

describe('test-utils', () => {
  let hookMock;
  let hooked;

  let fnMock;
  let initiateMock;
  let runMock;
  let runRestMock;
  let teardownMock;
  let runSnapsMock;
  let observeActionsMock;
  let getImperativeHandleMock;
  let updateRectOnNextRunMock;

  beforeEach(() => {
    fnMock = jest.fn();
    initiateMock = jest.fn();
    runMock = jest.fn();
    runRestMock = jest.fn();
    runMock.reset = runRestMock;
    teardownMock = jest.fn();
    runSnapsMock = jest.fn();
    observeActionsMock = jest.fn();
    getImperativeHandleMock = jest.fn();
    updateRectOnNextRunMock = jest.fn();

    hooked = {
      __hooked: true,
      fn: fnMock,
      initiate: initiateMock,
      run: runMock,
      teardown: teardownMock,
      runSnaps: runSnapsMock,
      observeActions: observeActionsMock,
      getImperativeHandle: getImperativeHandleMock,
      updateRectOnNextRun: updateRectOnNextRunMock,
      fromTest: true,
    };

    hookMock = jest.fn().mockReturnValue(hooked);
    jest.spyOn(stardustUtils.__DO_NOT_USE__, 'hook').mockImplementation(hookMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should return api', () => {
    const c = create();
    expect(c.update instanceof Function).toBe(true);
    expect(c.unmount instanceof Function).toBe(true);
    expect(c.takeSnapshot instanceof Function).toBe(true);
    expect(c.actions instanceof Function).toBe(true);
  });

  test('should update', () => {
    const c = create();
    c.update();
    expect(runMock).toHaveBeenCalledTimes(1);

    runMock.reset();
    expect(runRestMock).toHaveBeenCalledTimes(1);

    const context = { translator: {} };
    c.update(context);
    expect(runMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context,
      })
    );
  });

  test('should update', () => {
    const c = create();
    c.unmount();
    expect(teardownMock).toHaveBeenCalledTimes(1);
  });

  test('should take snapshot', () => {
    const c = create();
    c.takeSnapshot();
    expect(runSnapsMock).toHaveBeenCalledTimes(1);
  });

  test.skip('should do actions', () => {
    // hooked.observeActions.callsArgWith(1, ['action']);
    const c = create();
    // hooked.observeActions.reset();
    expect(c.actions()).toEqual(['action']);
  });
});
