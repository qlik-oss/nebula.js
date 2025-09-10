import { createTheme } from '@mui/material/styles';
import { buttonClasses } from '@mui/material/Button';

import base from './definitions/base';
import light from './definitions/light';
import dark from './definitions/dark';

const cache = {};

const componentOverrides = (theme) => ({
  MuiCheckbox: {
    defaultProps: {
      color: 'secondary',
    },
  },
  MuiRadio: {
    defaultProps: {
      color: 'secondary',
    },
  },
  MuiTabs: {
    defaultProps: {
      indicatorColor: 'secondary',
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: {
        color: theme.palette.text.primary,
      },
    },
  },
  MuiGrid: {
    styleOverrides: {
      variants: [
        {
          props: { alignItems: 'center' },
          style: {
            'align-items': 'center',
          },
        },
      ],
    },
  },
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
      disableTouchRipple: true,
      focusRipple: false,
    },
    styleOverrides: {
      root: {
        borderRadius: 2,
        border: '1px solid transparent',
        // should ideally use $focusVisible, but that messes up focus in all other places where Iconbutton is used (Checkbox, Switch etc)
        '&.Mui-focused': {
          borderColor: theme.palette.custom.focusBorder,
          boxShadow: `0 0 0 2px ${theme.palette.custom.focusOutline}`,
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        padding: 7,
        borderRadius: 2,
        border: '1px solid transparent',
        '&:hover': {
          backgroundColor: theme.palette.btn.hover,
        },
        '&.Mui-focusVisible': {
          borderColor: theme.palette.custom.focusBorder,
          boxShadow: `0 0 0 2px ${theme.palette.custom.focusOutline}`,
        },
        '&.Mui-active': {
          borderColor: 'transparent',
          boxShadow: 'none',
          backgroundColor: theme.palette.btn.active,
        },
        '&:not(.Mui-active):not(.Mui-focusVisible)': {
          borderColor: 'transparent',
          boxShadow: 'none',
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
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
  },
  MuiButton: {
    styleOverrides: {
      outlined: {
        padding: '3px 11px',
        [`&.${buttonClasses.focusVisible}`]: {
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
        [`&.${buttonClasses.focusVisible}`]: {
          borderColor: theme.palette.custom.focusBorder,
          boxShadow: `0 0 0 2px ${theme.palette.custom.focusOutline}`,
        },
        '&:hover': {
          backgroundColor: theme.palette.btn.hover,
          borderColor: theme.palette.btn.borderHover,
          boxShadow: 'none',
          [`&.${buttonClasses.disabled}`]: {
            backgroundColor: theme.palette.btn.disabled,
          },
        },
        '&.Mui-active': {
          boxShadow: 'none',
          backgroundColor: theme.palette.btn.active,
        },
        [`&.${buttonClasses.disabled}`]: {
          backgroundColor: theme.palette.btn.disabled,
        },
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      content: {
        margin: '8px 0',
      },
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
    shape: {
      ...base.shape,
    },
  };

  const adaptedTheme = {
    ...withDefaults,
    components: componentOverrides(withDefaults),
  };

  cache[key] = createTheme(adaptedTheme);

  cache[key].name = name;

  return cache[key];
}
