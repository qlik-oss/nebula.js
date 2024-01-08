import * as extendModule from 'extend';
import create from '../set-theme';
import base from '../themes/base.json';
import light from '../themes/light.json';
import dark from '../themes/dark.json';
import baseIn from '../themes/base_inherit.json';

jest.mock('extend');
jest.mock('../themes/base.json', () => ({
  font: 'Arial',
}));
jest.mock('../themes/light.json', () => ({
  background: 'white',
}));
jest.mock('../themes/dark.json', () => ({
  background: 'black',
}));

describe('set theme', () => {
  let extendMock;
  let resolveMock;

  beforeEach(() => {
    extendMock = jest.fn();
    resolveMock = jest.fn();

    jest.spyOn(extendModule, 'default').mockImplementation(extendMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should extend from light theme by default', () => {
    extendMock.mockReturnValue({
      palettes: {},
    });

    create({ _inherit: false }, resolveMock);
    expect(extendMock.mock.calls[0]).toEqual([true, {}, base, {}, light]);
  });

  test('should extend from dark theme when type is dark', () => {
    extendMock.mockReturnValue({
      palettes: {},
    });

    create({ type: 'dark', _inherit: false }, resolveMock);
    expect(extendMock.mock.calls[0]).toEqual([true, {}, base, {}, dark]);
  });

  test('should extend and add base inheritance', () => {
    extendMock.mockReturnValue({
      palettes: {},
    });

    create({}, resolveMock);
    expect(extendMock.mock.calls[0]).toEqual([true, {}, base, baseIn, light]);
  });

  test('should not extend scales and palette arrays', () => {
    const root = { color: 'pink', palettes: {} };
    const merged = { palettes: { data: [], ui: [] }, scales: [] };
    extendMock.mockReturnValueOnce(root);
    extendMock.mockReturnValueOnce(merged);
    const t = { color: 'red' };
    const prevent = { scales: null, palettes: { data: null, ui: null } };
    create(t, resolveMock);
    expect(extendMock.mock.calls[1]).toEqual([true, {}, root, prevent, t]);
    expect(resolveMock).toHaveBeenCalledWith(merged);
  });

  test('should add defaults if custom scales and palettes are not provided', () => {
    const root = { color: 'pink', palettes: { data: 'data', ui: 'ui' }, scales: 'scales' };
    const merged = { palettes: {} };
    extendMock.mockReturnValueOnce(root);
    extendMock.mockReturnValueOnce(merged);
    const custom = { color: 'red' };
    create(custom, resolveMock);
    expect(resolveMock).toHaveBeenCalledWith({
      palettes: { data: 'data', ui: 'ui' },
      scales: 'scales',
    });
  });

  test('should add defaults if custom scales and palettes are empty', () => {
    const root = { color: 'pink', palettes: { data: 'data', ui: 'ui' }, scales: 'scales' };
    const merged = { palettes: { data: [], ui: [] }, scales: [] };
    extendMock.mockReturnValueOnce(root);
    extendMock.mockReturnValueOnce(merged);
    const custom = { color: 'red' };
    create(custom, resolveMock);
    expect(resolveMock).toHaveBeenCalledWith({
      palettes: { data: 'data', ui: 'ui' },
      scales: 'scales',
    });
  });

  test('should return resolved theme', () => {
    extendMock.mockReturnValueOnce({ palettes: { data: [], ui: [] }, scales: [] });
    extendMock.mockReturnValueOnce({ palettes: { data: [], ui: [] }, scales: [] });
    resolveMock.mockReturnValue('resolved');
    expect(create({}, resolveMock)).toBe('resolved');
  });
});
