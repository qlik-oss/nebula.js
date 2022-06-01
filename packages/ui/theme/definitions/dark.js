import colors from './colors';

const dark = {
  mode: 'dark',
  palette: {
    primary: {
      main: colors.grey20,
      contrastText: colors.grey100,
    },
    secondary: {
      light: '#0AAF54',
      main: '#009845',
      dark: '#006937',
    },
    text: {
      primary: colors.grey100,
      secondary: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    action: {
      // active: 'rgba(0, 0, 0, 0.55)',
      active: colors.grey100,
      hover: 'rgba(255, 255, 255, 0.05)',
      hoverOpacity: 0.08,
      selected: 'rgba(0, 0, 0, 0.03)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    divider: 'rgba(0,0,0,0.3)',
    background: {
      default: '#323232',
      paper: '#323232',
      // -- custom properties --
      lightest: colors.grey25,
      lighter: colors.grey20,
      darker: colors.grey15,
      darkest: colors.grey10,
    },
    // -- custom --
    custom: {
      focusBorder: colors.blue,
      focusOutline: 'rgba(70, 157, 205, 0.3)',
      inputBackground: 'rgba(0, 0, 0, 0.2)',
    },
    selected: {
      main: colors.green,
      alternative: colors.grey20,
      excluded: colors.grey10,
      mainContrastText: colors.grey100,
      alternativeContrastText: colors.grey100,
      excludedContrastText: colors.grey100,
    },
    btn: {
      normal: 'rgba(255, 255, 255, 0.15)',
      hover: 'rgba(255, 255, 255, 0.25)',
      active: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(0, 0, 0, 0.15)',
      borderHover: 'rgba(0, 0, 0, 0.30)',
    },
  },
};

export default dark;
