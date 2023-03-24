import theme from '@nebula.js/theme';
import { resolveBgColor, resolveBgImage, resolveTextStyle } from '../background-props';

describe('Background property resolver', () => {
  let bgCompLayout;

  const t = theme().externalAPI;

  const app = {
    session: {
      config: {
        url: 'wss://example.com/lots/of/paths',
      },
    },
  };

  beforeEach(() => {
    bgCompLayout = {
      key: 'general',
      bgColor: {
        useExpression: true,
        colorExpression: '#ff0000',
        color: { index: -1, color: 'aqua' },
      },
      bgImage: {
        mode: 'media',
        mediaUrl: {
          qStaticContentUrl: {
            qUrl: '/media/Tulips.jpg',
          },
        },
        position: 'top-left',
        sizing: 'alwaysFit',
      },
    };
  });

  test('should resolve background color to empty', () => {
    const color = resolveBgColor({});
    expect(color).toBeUndefined();
  });
  test('should resolve background color by expression', () => {
    const color = resolveBgColor(bgCompLayout, t);
    expect(color).toBe('rgb(255, 0, 0)');
  });
  test('should resolve background color by picker', () => {
    bgCompLayout.bgColor.useExpression = false;
    const color = resolveBgColor(bgCompLayout, t);
    expect(color).toBe('aqua');
  });
  test('should resolve background image https', () => {
    const { url, pos } = resolveBgImage(bgCompLayout, app);
    expect(url).toBe('https://example.com/media/Tulips.jpg');
    expect(pos).toBe('top left');
  });
  test('should resolve background image http', () => {
    app.session.config.url = 'ws://example.com/lots/of/paths';
    const { url, size } = resolveBgImage(bgCompLayout, app);
    expect(url).toBe('http://example.com/media/Tulips.jpg');
    expect(size).toBe('contain');
  });
  test('should resolve background color by theme', () => {
    const color = resolveBgColor({}, t, 'peoplechart');
    expect(color).toBe('transparent');
  });

  test('should resolve background color by custom theme', () => {
    const color = resolveBgColor(
      {},
      {
        getStyle: (obj, path, attr) => {
          if (obj === 'object.gantt' && path === '' && attr === 'backgroundColor') {
            return '#ff00ff';
          }
          return undefined;
        },
      },
      'gantt'
    );
    expect(color).toBe('#ff00ff');
  });

  test('should resolve text style by props', () => {
    const prop = {
      title: {
        main: {
          color: { color: 'red' },
          fontFamily: 'familiiii',
          fontStyle: ['underline'],
        },
      },
    };
    const style = resolveTextStyle(prop, 'main', t, 'peoplechart');
    expect(style).toEqual({
      color: 'red',
      fontFamily: 'familiiii',
      fontWeight: 'bold',
      fontStyle: 'normal',
      textDecoration: 'underline',
    });
  });

  test('should resolve text style by theme', () => {
    const prop = {
      title: {
        footer: {
          color: { color: 'red' },
          fontStyle: '',
        },
      },
    };
    const style = resolveTextStyle(
      prop,
      'footer',
      {
        getStyle: (obj, path, attr) => {
          if (obj === 'object.peoplechart' && path === 'title.footer' && attr === 'fontFamily') {
            return 'a font';
          }
          return 'wrong';
        },
        getColorPickerColor: (color) => color.color,
      },
      'peoplechart'
    );

    expect(style).toEqual({
      color: 'red',
      fontFamily: 'a font',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'initial',
    });
  });
});
