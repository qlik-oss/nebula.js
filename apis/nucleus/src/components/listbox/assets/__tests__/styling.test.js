import getStyling, { CONTRAST_THRESHOLD, getContrast, getContrastingColor, getOverridesAsObject } from '../styling';

describe('styling', () => {
  let theme = {};
  let components = [];
  let themeApi;

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    themeApi = {
      getStyle: (ns, path, prop) => `${ns},${path},${prop}`,
    };
    theme = {
      listBox: {
        title: {
          main: {
            color: 'red',
            fontSize: 24,
          },
        },
        content: {
          color: 'red',
          fontSize: 24,
        },
      },
      palette: {
        text: {
          primary: 'primary',
        },
        selected: {
          main: 'selected-from-theme',
        },
        alternative: {
          main: 'alternative-from-theme',
        },
        excluded: {
          main: 'excluded-from-theme',
        },
      },
    };
  });

  describe('should return expected header style based on theme and then overridden by components', () => {
    it('header', () => {
      components = [
        {
          key: 'theme',
          header: {
            fontSize: 'size-from-component',
            fontColor: {
              color: 'color-from-component',
            },
          },
        },
      ];
      let inst;
      let header;
      inst = getStyling({ themeApi, theme, components: [] });
      header = inst.header;
      expect(header.fontSize).toEqual('object.listBox,title.main,fontSize');
      expect(header.color).toEqual('object.listBox,title.main,color');

      inst = getStyling({ themeApi, theme, components });
      header = inst.header;
      expect(header.fontSize).toEqual('size-from-component');
      expect(header.color).toEqual('color-from-component');
    });

    it('content - should override text color with a contrasting color since we have specified a text color and useContrastColor is true', () => {
      components = [
        {
          key: 'theme',
          content: {
            fontSize: 'size-from-component',
            fontColor: {
              color: undefined, // <- should not trigger a contrast color
            },
            useContrastColor: true,
          },
        },
      ];
      const POSSIBLE_COLOR = 'rgb(255, 255, 255)';
      const CONTRASTING_TO_POSSIBLE = '#000';

      themeApi.getStyle = (a, b, c) => (c === 'backgroundColor' ? POSSIBLE_COLOR : `${a},${b},${c}`);
      components[0].content.fontColor.color = '#FFFFFF';
      const styles2 = getStyling({ themeApi, theme, components });
      expect(styles2.content.color).toEqual(CONTRASTING_TO_POSSIBLE);
    });

    it('content - should override with component properties', () => {
      components = [
        {
          key: 'theme',
          content: {
            fontSize: 'size-from-component',
            fontColor: {
              color: 'color-from-component',
            },
            useContrastColor: false,
          },
        },
      ];
      const styles = getStyling({ themeApi, theme, components });
      const { content } = styles;
      expect(content.fontSize).toEqual('size-from-component');
      expect(content.color).toEqual('color-from-component');
    });

    it('selected', () => {
      components = [
        {
          key: 'selections',
          colors: {
            selected: {
              color: 'selected-from-component',
            },
            alternative: {
              color: 'alternative-from-component',
            },
            excluded: {
              color: 'excluded-from-component',
            },
            selectedExcluded: {
              color: 'selectedExcluded-from-component',
            },
            possible: {
              color: 'possible-from-component',
            },
          },
        },
      ];
      let inst;
      let selections;

      inst = getStyling({ themeApi, theme, components: [] });
      selections = inst.selections;
      expect(selections.selected).toEqual('selected-from-theme');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.selected).toEqual('selected-from-component');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.alternative).toEqual('alternative-from-component');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.excluded).toEqual('excluded-from-component');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.selectedExcluded).toEqual('selectedExcluded-from-component');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.possible).toEqual('possible-from-component');
    });

    it('using not supported or empty components should throw error', () => {
      const inputComponents = ['general', 'selections', 'theme', 'not-supported', undefined].map((key) => ({ key }));
      expect(inputComponents).toHaveLength(5);
      expect(Object.keys(getOverridesAsObject(inputComponents)).sort()).toEqual(['selections', 'theme']);
    });
  });

  const hasEnoughContrast = (a, b) => getContrast(a, b) > CONTRAST_THRESHOLD;

  describe('contrast', () => {
    it('should return undefined for unsupported or invalid color(s)', () => {
      expect(getContrast('rgb(0,0,0)', 'transparent')).toEqual(undefined);
      expect(getContrast('rgb(0,0,0)', 'asdasd')).toEqual(undefined);
      expect(getContrast('dsadasd', 'rgb(0,0,0)')).toEqual(undefined);
    });

    it('should fallback to false when contrast is undefined for unsupported or invalid color(s)', () => {
      expect(hasEnoughContrast('#ddd', 'white')).toEqual(false);
      expect(hasEnoughContrast('#ccc', 'white')).toEqual(true);
      expect(hasEnoughContrast('rgb(0,0,0)', 'transparent')).toEqual(false);
      expect(hasEnoughContrast('transparent', 'transparent')).toEqual(false);
      expect(hasEnoughContrast('red', 'blue')).toEqual(true);
      expect(hasEnoughContrast('misspelled', 'hey hey')).toEqual(false);
      expect(hasEnoughContrast('misspelled', 'hey hey')).toEqual(false);
      expect(hasEnoughContrast('transparent', 'transparent')).toEqual(false);
      expect(hasEnoughContrast('  hsl   (0,   0  ,  0  ,  1.0      )', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('hsl(0, 0, 0, 1)', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('hsl(0,0,0,1.0)', '#FFF')).toEqual(false);
      expect(hasEnoughContrast(undefined, '#FFF')).toEqual(false);
      expect(hasEnoughContrast('', '#FFF')).toEqual(false);
    });
    it('should detect transparent colors and then always return false since we do not know color is behind the transparent color', () => {
      expect(hasEnoughContrast('  rgba   (0,   0  ,  0  ,  0.2      )', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('  hsla   (0,   0  ,  0  ,  0.2      )', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('  rgba   (0,   0  ,  0  ,  .2      )', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('  hsla   (0,   0  ,  0  ,  .2      )', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('rgba(0, 0, 0, 0)', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('rgba(0,0,0,0)', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('hsla(0, 0, 0, 0)', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('hsla(0,0,0,0)', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('transparent', '#FFF')).toEqual(false);
    });
    it('should fallback to false for unsupported formats', () => {
      expect(hasEnoughContrast('rgb(0 0 0 / 0%', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('rgb(0 0 0 / 100%)', '#FFF')).toEqual(false);
      expect(hasEnoughContrast('rgb(255 255 255 / 0%)', '#000')).toEqual(false);
      expect(hasEnoughContrast('rgb(255 255 255 / 100%)', '#000')).toEqual(false);
    });

    it('should not detect as transparent colors', () => {
      expect(hasEnoughContrast('rgba(0, 0, 0, 1)', '#FFF')).toEqual(true);
      expect(hasEnoughContrast('hsla(0,0,0,1.0)', '#FFF')).toEqual(true);
      expect(hasEnoughContrast('rgba(0,0,0,1.0)', '#FFF')).toEqual(true);
      expect(hasEnoughContrast('red', '#FFF')).toEqual(true);
    });
  });

  describe('get contrasting color', () => {
    it('should prefer light color even though contrast is higher for desired color', () => {
      const bg = '#474747';
      const c1 = getContrast('#000', bg);
      const c2 = getContrast('#fff', bg);
      expect(c1 > c2).toBeTruthy(); // although it does not make sense when comparing with the eye
      expect(getContrastingColor(bg, '#000')).toEqual('#FFF');
    });
  });
});
