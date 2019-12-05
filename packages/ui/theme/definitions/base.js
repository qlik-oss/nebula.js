export default {
  typography: {
    fontSize: 14,
    htmlFontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontFamily: ['"Source Sans Pro"', '"Segoe UI"', '"Helvetica Neue"', '-apple-system', 'Arial', 'sans-serif'].join(
      ','
    ),
    button: {
      textTransform: 'initial',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 2,
  },
  shadows: [
    'none',
    '0px 1px 2px 0px rgba(0,0,0,0.15)',
    '0px 1px 2px 0px rgba(0,0,0,0.15)',
    '0px 1px 2px 0px rgba(0,0,0,0.15)',
    '0px 1px 2px 0px rgba(0,0,0,0.15)',
    '0px 1px 2px 0px rgba(0,0,0,0.15)',
    '0px 1px 2px 0px rgba(0,0,0,0.15)',

    '0px 2px 4px 0px rgba(0,0,0,0.15)',
    '0px 2px 4px 0px rgba(0,0,0,0.15)',
    '0px 2px 4px 0px rgba(0,0,0,0.15)',
    '0px 2px 4px 0px rgba(0,0,0,0.15)',
    '0px 2px 4px 0px rgba(0,0,0,0.15)',
    '0px 2px 4px 0px rgba(0,0,0,0.15)',

    '0px 4px 10px 0px rgba(0,0,0,0.15)',
    '0px 4px 10px 0px rgba(0,0,0,0.15)',
    '0px 4px 10px 0px rgba(0,0,0,0.15)',
    '0px 4px 10px 0px rgba(0,0,0,0.15)',
    '0px 4px 10px 0px rgba(0,0,0,0.15)',
    '0px 4px 10px 0px rgba(0,0,0,0.15)',

    '0px 6px 20px 0px rgba(0,0,0,0.15)',
    '0px 6px 20px 0px rgba(0,0,0,0.15)',
    '0px 6px 20px 0px rgba(0,0,0,0.15)',
    '0px 6px 20px 0px rgba(0,0,0,0.15)',
    '0px 6px 20px 0px rgba(0,0,0,0.15)',
    '0px 6px 20px 0px rgba(0,0,0,0.15)',
  ],
  props: {
    MuiButtonBase: {
      disableRipple: true,
      disableTouchRipple: true,
      focusRipple: false,
    },
  },
};
