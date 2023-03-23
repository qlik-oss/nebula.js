import theme from '@nebula.js/theme';
import { resolveBgColor, resolveBgImage } from '../background-props';

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
});
