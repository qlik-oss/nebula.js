import * as muiStyles from '@mui/material/styles';
import createStyleService from '../style-service';

jest.mock('@mui/material/styles', () => ({
  __esModule: true,
  ...jest.requireActual('@mui/material/styles'),
}));

describe('style-service', () => {
  let theme = {};
  let components = [];

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
      inst = createStyleService({ theme, components: [] });
      header = inst.header.getStyle();
      expect(header.fontSize).toEqual(24);
      expect(header.fontColor).toEqual('red');

      inst = createStyleService({ theme, components });
      header = inst.header.getStyle();
      expect(header.fontSize).toEqual('size-from-component');
      expect(header.fontColor).toEqual('color-from-component');
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
      inst = createStyleService({ theme, components: [] });
      content = inst.content.getStyle();
      expect(content.fontSize).toEqual(24);
      expect(content.fontColor).toEqual('#000');

      inst = createStyleService({ theme, components });
      content = inst.content.getStyle();
      expect(content.fontSize).toEqual('size-from-component');
      expect(content.fontColor).toEqual('color-from-component');
    });

    it('palette', () => {
      components = [
        {
          key: 'palette',
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
      let palette;

      inst = createStyleService({ theme, components: [] });
      palette = inst.palette.getStyle();
      expect(palette.selected).toEqual('selected-from-theme');

      inst = createStyleService({ theme, components });
      palette = inst.palette.getStyle();
      expect(palette.selected).toEqual('selected-from-component');

      inst = createStyleService({ theme, components });
      palette = inst.palette.getStyle();
      expect(palette.alternative).toEqual('alternative-from-component');

      inst = createStyleService({ theme, components });
      palette = inst.palette.getStyle();
      expect(palette.excluded).toEqual('excluded-from-component');

      inst = createStyleService({ theme, components });
      palette = inst.palette.getStyle();
      expect(palette.selectedExcluded).toEqual('selectedExcluded-from-component');

      inst = createStyleService({ theme, components });
      palette = inst.palette.getStyle();
      expect(palette.possible).toEqual('possible-from-component');
    });
  });
});
