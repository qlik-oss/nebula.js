import resolveProperty from '../resolve-property';

describe('resolveProperty', () => {
  const path = 'path';
  const attribute = 'attribute';
  const styleService = {};
  let objectType;

  beforeEach(() => {
    styleService.getStyle = jest.fn().mockReturnValue('resolvedStyle');
    objectType = 'somechart';
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should resolve property correctly if styleService and objectType are truthy', () => {
    const res = resolveProperty(path, attribute, styleService, objectType);
    expect(styleService.getStyle).toHaveBeenCalledTimes(1);
    expect(styleService.getStyle).toHaveBeenCalledWith(`object.${objectType}`, path, attribute);
    expect(res).toEqual('resolvedStyle');
  });

  test('should resolve property correctly if styleService is truthy and objectType is falsy', () => {
    const res = resolveProperty(path, attribute, styleService, undefined);
    expect(styleService.getStyle).toHaveBeenCalledTimes(1);
    expect(styleService.getStyle).toHaveBeenCalledWith('', path, attribute);
    expect(res).toEqual('resolvedStyle');
  });

  test('should resolve property correctly if styleService and objectType are falsy', () => {
    const res = resolveProperty(path, attribute, undefined, undefined);
    expect(styleService.getStyle).toHaveBeenCalledTimes(0);
    expect(res).toEqual(undefined);
  });
});
