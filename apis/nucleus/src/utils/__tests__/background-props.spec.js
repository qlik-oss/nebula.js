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
        useColorExpression: true,
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

  it('should resolve background color by expression', () => {
    const color = resolveBgColor(bgCompLayout, t);
    expect(color).to.equal('rgb(255, 0, 0)');
  });
  it('should resolve background color by picker', () => {
    bgCompLayout.bgColor.useColorExpression = false;
    const color = resolveBgColor(bgCompLayout, t);
    expect(color).to.equal('aqua');
  });
  it('should resolve background image https', () => {
    const { url, pos } = resolveBgImage(bgCompLayout, app);
    expect(url).to.equal('https://example.com/media/Tulips.jpg');
    expect(pos).to.equal('top left');
  });
  it('should resolve background image http', () => {
    app.session.config.url = 'ws://example.com/lots/of/paths';
    const { url, size } = resolveBgImage(bgCompLayout, app);
    expect(url).to.equal('http://example.com/media/Tulips.jpg');
    expect(size).to.equal('contain');
  });
});
