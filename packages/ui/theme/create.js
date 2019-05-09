import { createMuiTheme } from '@material-ui/core/styles';

import defaults from './definitions/defaults';

const cache = {};

const dark = {
  type: 'dark',
  palette: {
    primary: {
      // light: '#fafafa',
      main: '#404040',
      // dark: '#f0f0f0',
      contrastText: '#fff',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    action: {
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    divider: 'rgba(0,0,0,0.3)',
    background: {
      default: '#343434',
      paper: '#343434',
      // -- custom properties --
      lightest: '#404040',
      lighter: '#333333',
      darker: '#262626',
      darkest: '#1A1A1A',
    },
  },
  overrides: {
    MuiIconButton: {
      root: {
        ...defaults.overrides.MuiIconButton.root,
        color: '#fff',
      },
    },
  },
};

const light = {
  type: 'light',
  palette: {
    primary: {
      light: '#fafafa',
      main: '#404040',
      dark: '#f0f0f0',
      contrastText: '#fff',
    },
    text: {
      primary: '#404040',
      secondary: 'rgba(0, 0, 0, 0.55)',
      disabled: 'rgba(0, 0, 0, 0.3)',
    },
    action: {
      disabled: 'rgba(0, 0, 0, 0.3)',
    },
    background: {
      // -- custom properties --
      lightest: '#fff',
      lighter: '#fafafa',
      darker: '#F2F2F2',
      darkest: '#E6E6E6',
    },
  },
  overrides: {
    MuiTypography: {
      root: {
        color: '#404040',
      },
    },
  },
};

export default function create(definition) {
  let def = light;
  if (typeof definition === 'string') {
    if (definition !== 'light' && definition !== 'dark') {
      console.warn(`Invalid theme: '${definition}'`);
    } else if (definition === 'dark') {
      def = dark;
    }
  }

  const key = JSON.stringify(def);
  if (cache[key]) {
    return cache[key];
  }

  cache[key] = createMuiTheme({
    type: def.type,
    typography: {
      ...defaults.typography,
    },
    shadows: defaults.shadows,
    props: {
      ...defaults.props,
    },
    shape: {
      ...defaults.shape,
    },
    overrides: {
      ...defaults.overrides,
      ...def.overrides,
    },
    palette: {
      secondary: {
        light: '#7cc84c',
        main: '#6cb33f',
        dark: '#589f35',
        contrastText: '#fff',
      },
      ...def.palette,
    },
  });

  return cache[key];
}
