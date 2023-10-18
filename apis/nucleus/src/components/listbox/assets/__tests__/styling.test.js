import * as muiStyles from '@mui/material/styles';
import getStyling from '../styling';

jest.mock('@mui/material/styles', () => ({
  __esModule: true,
  ...jest.requireActual('@mui/material/styles'),
}));

describe('styling', () => {
  let theme = {};
  let components = [];
  let themeApi;

  beforeAll(() => {
    jest.spyOn(muiStyles, 'getContrastRatio').mockReturnValue(0.5);
  });

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
          key: 'header',
          fontSize: 'size-from-component',
          fontColor: {
            color: 'color-from-component',
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

    it('content', () => {
      components = [
        {
          key: 'content',
          fontSize: 'size-from-component',
          fontColor: {
            color: 'color-from-component',
          },
          useContrastColor: false,
        },
      ];
      let inst;
      let content;
      inst = getStyling({ themeApi, theme, components: [] });
      content = inst.content;
      expect(content.fontSize).toEqual('object.listBox,content,fontSize');
      expect(content.color).toEqual('#000');

      inst = getStyling({ themeApi, theme, components });
      content = inst.content;
      expect(content.fontSize).toEqual('size-from-component');
      expect(content.color).toEqual('color-from-component');
    });

    it('selected', () => {
      components = [
        {
          key: 'selected',
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
      ];
      let inst;
      let selections;

      inst = getStyling({ themeApi, theme, components: [] });
      selections = inst.selections;
      expect(selections.selected).toEqual('selected-from-theme');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.selected).toEqual('selected-from-theme');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.alternative).toEqual('#E4E4E4');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.excluded).toEqual('#A9A9A9');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.selectedExcluded).toEqual('#A9A9A9');

      inst = getStyling({ themeApi, theme, components });
      selections = inst.selections;
      expect(selections.possible).toEqual('object.listBox,,backgroundColor');
    });
  });
});