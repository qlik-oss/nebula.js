import * as muiStyles from '@mui/material/styles';
import getStyling, { convertNamedColor, getOverridesAsObject, hasEnoughContrast } from '../styling';

jest.mock('@mui/material/styles', () => ({
  __esModule: true,
  ...jest.requireActual('@mui/material/styles'),
}));

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
    beforeAll(() => {
      jest.spyOn(muiStyles, 'getContrastRatio').mockReturnValue(0.5);
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

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

    it('content - should not attempt to use contrast when there are no components', () => {
      const styles = getStyling({ themeApi, theme, components: [] });
      const { content } = styles;
      expect(content.fontSize).toEqual('object.listBox,content,fontSize');
      expect(content.color).toEqual('object.listBox,content,color'); // no contrast
    });

    it('content - should only use contrast when there are components with text color overrides', () => {
      jest.restoreAllMocks();
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
      const styles = getStyling({ themeApi, theme, components });
      const { content } = styles;
      expect(content.fontSize).toEqual('size-from-component');
      expect(content.color).toEqual('object.listBox,content,color'); // still no contrast
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
      const POSSIBLE_COLOR = 'white';
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

  describe('hasEnoughContrast', () => {
    it('should not throw on unsupported color and fall back to true', () => {
      expect(() => hasEnoughContrast('rgb(0,0,0)', 'transparent')).not.toThrow();
      expect(() => hasEnoughContrast('transparent', 'transparent')).not.toThrow();
      expect(() => hasEnoughContrast('red', 'blue')).not.toThrow();
      expect(() => hasEnoughContrast('misspelled', 'hey hey')).not.toThrow();
      expect(hasEnoughContrast('misspelled', 'hey hey')).toEqual(true);
      expect(hasEnoughContrast('transparent', 'transparent')).toEqual(false);
    });
  });

  describe('convertNamedColor', () => {
    it('should return a hex color or fallback to the input', () => {
      expect(convertNamedColor('red')).toEqual('#FF0000');
      expect(convertNamedColor('blue')).toEqual('#0000FF');
      expect(convertNamedColor('transparent')).toEqual('rgba(255, 255, 255, 0)');
      expect(convertNamedColor('misspelled')).toEqual('misspelled');
    });
  });
});
