import resolveColor from '../resolve-color';
import * as resolveProperty from '../resolve-property';

jest.mock('../resolve-property');

describe('resolveProperty', () => {
  const colorObj = {};
  const path = 'path';
  const attribute = 'attribute';
  const styleService = {};
  let objectType;

  beforeEach(() => {
    styleService.getColorPickerColor = jest.fn().mockReturnValue('resolvedColor');
    objectType = 'somechart';
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should resolve color correctly if styleService and colorObj are truthy and colorObj.color = "none"', () => {
    colorObj.color = 'none';
    jest.spyOn(resolveProperty, 'default');
    const res = resolveColor(colorObj, path, attribute, styleService, objectType);
    expect(styleService.getColorPickerColor).toHaveBeenCalledTimes(0);
    expect(resolveProperty.default).toHaveBeenCalledTimes(0);
    expect(res).toEqual(undefined);
  });

  test('should resolve color correctly if styleService and colorObj are truthy and colorObj.color != "none"', () => {
    colorObj.color = 'red';
    jest.spyOn(resolveProperty, 'default');
    const res = resolveColor(colorObj, path, attribute, styleService, objectType);
    expect(styleService.getColorPickerColor).toHaveBeenCalledTimes(1);
    expect(styleService.getColorPickerColor).toHaveBeenCalledWith(colorObj, false);
    expect(resolveProperty.default).toHaveBeenCalledTimes(0);
    expect(res).toEqual('resolvedColor');
  });

  test('should resolve color correctly if colorObj is falsy', () => {
    jest.spyOn(resolveProperty, 'default').mockReturnValue('resolvedProperty');
    const res = resolveColor(undefined, path, attribute, styleService, objectType);
    expect(styleService.getColorPickerColor).toHaveBeenCalledTimes(0);
    expect(resolveProperty.default).toHaveBeenCalledTimes(1);
    expect(resolveProperty.default).toHaveBeenCalledWith(path, attribute, styleService, objectType);
    expect(res).toEqual('resolvedProperty');
  });

  test('should resolve color correctly if styleService is falsy', () => {
    jest.spyOn(resolveProperty, 'default').mockReturnValue('resolvedProperty');
    const res = resolveColor(colorObj, path, attribute, undefined, objectType);
    expect(styleService.getColorPickerColor).toHaveBeenCalledTimes(0);
    expect(resolveProperty.default).toHaveBeenCalledTimes(1);
    expect(resolveProperty.default).toHaveBeenCalledWith(path, attribute, undefined, objectType);
    expect(res).toEqual('resolvedProperty');
  });
});
