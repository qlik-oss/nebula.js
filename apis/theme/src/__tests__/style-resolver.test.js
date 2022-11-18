import * as extendModule from 'extend';
import create from '../style-resolver';

describe('style-resolver', () => {
  let extendMock;

  beforeEach(() => {
    extendMock = jest.fn();
    jest.spyOn(extendModule, 'default').mockImplementation(extendMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('getStyle from root', () => {
    const t = {
      fontSize: '16px',
    };
    const s = create('base.path', t);

    expect(s.getStyle('', 'fontSize')).toBe('16px');
  });

  test('getStyle from object', () => {
    const t = {
      object: {
        bar: {
          legend: {
            title: {
              fontSize: '13px',
            },
          },
        },
      },
      fontSize: '16px',
    };
    const s = create('object.bar', t);

    expect(s.getStyle('', 'fontSize')).toBe('16px');
    expect(s.getStyle('legend', 'fontSize')).toBe('16px');
    expect(s.getStyle('legend.content', 'fontSize')).toBe('16px');
    expect(s.getStyle('title', 'fontSize')).toBe('16px');

    expect(s.getStyle('legend.title', 'fontSize')).toBe('13px');
    expect(s.getStyle('legend.content', 'color')).toBe(undefined);

    expect(s.getStyle('.', 'legend.title.fontSize')).toBe('13px');
    expect(s.getStyle('legend.', 'title.fontSize')).toBe('13px');
    expect(s.getStyle('legend.', 'content.fontSize')).toBe(undefined);
    expect(s.getStyle('legend.', 'content.color')).toBe(undefined);

    expect(s.getStyle('table', 'fontSize')).toBe('16px');
    expect(s.getStyle('table', 'content.fontSize')).toBe(undefined);
  });

  test('resolveRawTheme', () => {
    const variables = {
      '@text': 'pink',
      '@size': 'mini',
    };
    const raw = {
      chart: {
        bg: 'red',
        color: '@text',
      },
      responsive: '@size',
      _variables: variables,
    };
    extendMock.mockReturnValue(raw);
    expect(create.resolveRawTheme(raw)).toEqual({
      chart: {
        bg: 'red',
        color: 'pink',
      },
      responsive: 'mini',
      _variables: variables,
    });
  });
});
