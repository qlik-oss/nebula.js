import { createTheme, adaptV4Theme } from '@mui/material/styles';
import { buttonClasses } from '@mui/material/Button';

import base from './definitions/base';
import light from './definitions/light';
import dark from './definitions/dark';

const cache = {};

const overrides = (theme) => ({
  MuiTypography: {
    root: {
      color: theme.palette.text.primary,
    },
  },
  MuiGrid: {
    variants: {
      props: { alignItems: 'center' },
      style: {
        'align-items': 'center',
      },
    },
  },
  MuiButtonBase: {
    root: {
      borderRadius: 2,
      border: '1px solid transparent',
      // should ideally use $focusVisible, but that messes up focus in all other places where Iconbutton is used (Checkbox, Switch etc)
      '&:focus': {
        borderColor: theme.palette.custom.focusBorder,
        boxShadow: `0 0 0 2px ${theme.palette.custom.focusOutline}`,
      },
    },
  },
  MuiIconButton: {
    root: {
      padding: 7,
      borderRadius: 2,
      border: '1px solid transparent',
      // should ideally use $focusVisible, but that messes up focus in all other places where Iconbutton is used (Checkbox, Switch etc)
      '&:focus': {
        borderColor: theme.palette.custom.focusBorder,
        boxShadow: `0 0 0 2px ${theme.palette.custom.focusOutline}`,
      },
    },
  },
  MuiOutlinedInput: {
    root: {
      backgroundColor: theme.palette.custom.inputBackground,
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.btn.border,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.custom.focusBorder,
        borderWidth: 2,
      },
    },
  },
  MuiButton: {
    outlined: {
      padding: '3px 11px',
      [`&.${buttonClasses['focusVisible']}`]: {
        borderColor: theme.palette.custom.focusBorder,
        boxShadow: `0 0 0 2px ${theme.palette.custom.focusOutline}`,
      },
    },
    contained: {
      color: theme.palette.text.primary,
      padding: '3px 11px',
      border: `1px solid ${theme.palette.btn.border}`,
      backgroundColor: theme.palette.btn.normal,
      boxShadow: 'none',
      [`&.${buttonClasses['focusVisible']}`]: {
        borderColor: theme.palette.custom.focusBorder,
        boxShadow: `0 0 0 2px ${theme.palette.custom.focusOutline}`,
      },
      '&:hover': {
        backgroundColor: theme.palette.btn.hover,
        borderColor: theme.palette.btn.borderHover,
        boxShadow: 'none',
        [`&.${buttonClasses['disabled']}`]: {
          backgroundColor: theme.palette.btn.disabled,
        },
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: theme.palette.btn.active,
      },
      [`&.${buttonClasses['disabled']}`]: {
        backgroundColor: theme.palette.btn.disabled,
      },
    },
  },
  MuiExpansionPanelSummary: {
    content: {
      margin: '8px 0',
    },
  },
});

export default function create(definition) {
  let def = light;
  let name = '';
  if (typeof definition === 'string') {
    name = definition;
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

  const withDefaults = {
    palette: {
      type: def.mode,
      ...base.palette,
      ...def.palette,
    },
    typography: {
      ...base.typography,
    },
    shadows: base.shadows,
    props: {
      ...base.props,
    },
    shape: {
      ...base.shape,
    },
  };

  cache[key] = createTheme(
    adaptV4Theme({
      ...withDefaults,
      overrides: overrides(withDefaults),
    })
  );

  /*cache[key] = createTheme({
    components: {
      MuiCheckbox: {
        styleOverrides: {
          root: {
            padding: 9,
            backgroundColor: '#00ff00',
          },
        },
      },
    },
  });*/

  console.log(cache[key]);

  cache[key].name = name;

  return cache[key];
}
