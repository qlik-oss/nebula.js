import colors from './colors';

const light = {
  mode: 'light',
  palette: {
    primary: {
      main: colors.grey25,
      contrastText: colors.grey100,
    },
    secondary: {
      main: '#009845',
      light: '#0AAF54',
      dark: '#006937',
    },
    text: {
      primary: colors.grey25,
      secondary: 'rgba(0, 0, 0, 0.55)',
      disabled: 'rgba(0, 0, 0, 0.3)',
    },
    action: {
      active: colors.grey25, // color for actionable things like icon buttons
      hover: 'rgba(0, 0, 0, 0.03)', // color for hoverable things like list items
      hoverOpacity: 0.08, // used to fade primary/secondary colors
      selected: 'rgba(0, 0, 0, 0.05)', // focused things like list items
      disabled: 'rgba(0, 0, 0, 0.3)', // usually text
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    background: {
      paper: colors.grey100,
      default: colors.grey100,
      // -- custom properties --
      lightest: colors.grey100,
      lighter: colors.grey98,
      darker: colors.grey95,
      darkest: colors.grey90,
    },
    // --- custom stuff ---
    custom: {
      focusBorder: colors.blue,
      focusOutline: 'rgba(70, 157, 205, 0.3)',
      inputBackground: 'rgba(255, 255, 255, 1)',
    },
    selected: {
      main: colors.green,
      alternative: '#E4E4E4',
      excluded: '#BEBEBE',
      mainContrastText: colors.grey100,
      alternativeContrastText: colors.grey25,
      excludedContrastText: colors.grey25,
    },
    btn: {
      normal: 'rgba(255, 255, 255, 0.6)',
      hover: 'rgba(0, 0, 0, 0.03)',
      active: 'rgba(0, 0, 0, 0.1)',
      disabled: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(0, 0, 0, 0.15)',
      borderHover: 'rgba(0, 0, 0, 0.15)',
    },
  },
};

export default light;
