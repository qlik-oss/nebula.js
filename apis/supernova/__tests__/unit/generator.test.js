import generator from '../../src/generator';
import HyperCubeHandler from '../../src/handler/hypercube-handler';
import * as Creator from '../../src/creator';
import * as Qae from '../../src/qae';

jest.mock('../../src/handler/hypercube-handler');
describe('generator', () => {
  let creatorMock;
  let qaeMock;
  let galaxy;

  beforeEach(() => {
    galaxy = {
      flags: {
        isEnabled: jest.fn().mockReturnValue(false),
      },
    };
    creatorMock = jest.fn().mockImplementation((...a) => [...a]);
    qaeMock = jest.fn().mockImplementation((qae) => qae || 'qae');

    jest.spyOn(Qae, 'default').mockImplementation(qaeMock);
    jest.spyOn(Creator, 'default').mockImplementation(creatorMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should have a default qae property', () => {
    expect(generator({}, galaxy).qae).toBe('qae');
  });

  test('should have a component property', () => {
    expect(generator({}, galaxy).component).toEqual({});
  });

  test('should not override reserved properties with flag disabled', () => {
    expect(
      generator(
        {
          foo: 'bar',
          component: 'c',
        },
        galaxy
      ).definition
    ).toEqual({
      foo: 'bar',
    });
  });

  test('should not override reserved properties with flag enabled', () => {
    const mockDataHandler = jest.fn();
    HyperCubeHandler.mockImplementation((opts) => {
      mockDataHandler(opts);
    });

    galaxy.flags.isEnabled = jest.fn().mockReturnValue(true);

    const input = {
      foo: 'bar',
      component: 'c',
    };

    const result = generator(input, galaxy).definition;

    // Verify that the reserved property `dataHandler` is not overridden
    expect(result.dataHandler).toBeInstanceOf(Function);
    expect(result.dataHandler).not.toBe(input.dataHandler);
    expect(result).toEqual(
      expect.objectContaining({
        foo: 'bar',
      })
    );

    // `dataHandler` is the mocked HyperCubeHandler
    const opts = { someOption: true };
    result.dataHandler(opts);
    expect(mockDataHandler).toHaveBeenCalledWith(opts);
  });

  test('should accept a function', () => {
    const spy = jest.fn().mockReturnValue({});
    const isEnabled = jest.fn().mockReturnValue(false);
    generator(spy, {
      translator: 't',
      Promise: 'P',
      flags: {
        isEnabled, // Use the mock function here
      },
    });
    expect(spy).toHaveBeenCalledWith({
      translator: 't',
      flags: { isEnabled },
      Promise: 'P',
    });
  });

  test('should create an instance', () => {
    const isEnabled = jest.fn().mockReturnValue(false);
    const g = generator(
      {},
      {
        translator: 't',
        Promise: 'P',
        flags: {
          isEnabled,
        },
      }
    );
    const ret = g.create('a');
    expect(ret).toEqual([g, 'a', { translator: 't', flags: { isEnabled }, Promise: 'P' }]);
  });
});
