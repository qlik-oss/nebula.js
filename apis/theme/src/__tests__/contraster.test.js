import * as chartModules from 'qlik-chart-modules';
import create from '../contraster';

describe('contraster', () => {
  let luminanceMock;
  // let contrastMock;

  beforeEach(() => {
    luminanceMock = jest.fn();
    //   contrastMock = jest.fn();

    jest.spyOn(chartModules, 'getRelativeLuminance').mockImplementation(luminanceMock);
    //   jest.spyOn(contrastModule, 'default').mockImplementation(contrastMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should return #ffffff by default when input is dark', () => {
    expect(create().getBestContrastColor('#111111')).toBe('#ffffff');
  });

  test('should return #333333 by default when input is light', () => {
    expect(create().getBestContrastColor('#afa')).toBe('#333333');
  });

  test('should return cached value', () => {
    const c = create();
    c.getBestContrastColor('#afa');
    expect(luminanceMock).toHaveBeenCalledTimes(3);

    c.getBestContrastColor('#afa');
    c.getBestContrastColor('#afa');
    expect(luminanceMock).toHaveBeenCalledTimes(3);
  });
});
