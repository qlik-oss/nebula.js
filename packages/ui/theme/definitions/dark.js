const theme = {
  palette: {
    grey: {
      100: '#ffffff',
      98: '#fafafa',
      95: '#f2f2f2',
      90: '#e6e6e6',
      85: '#D9D9D9',
      70: '#B3B3B3',
      30: '#4d4d4d',
      25: '#404040',
      20: '#333333',
      15: '#262626',
      10: '#1a1a1a',
    },
    black: {
      '03': 'rgba(0, 0, 0, 0.03)',
      '05': 'rgba(0, 0, 0, 0.05)',
      10: 'rgba(0, 0, 0, 0.10)',
      15: 'rgba(0, 0, 0, 0.15)',
      30: 'rgba(0, 0, 0, 0.30)',
      55: 'rgba(0, 0, 0, 0.55)',
    },
    white: {
      10: 'rgba(255, 255, 255, 0.1)',
      60: 'rgba(255, 255, 255, 0.6)',
    },
    text: {
      primary: '$palette.grey.100',
      secondary: '$palette.white.60',
    },
    divider: '$palette.black.30',
    background: {
      lightest: '$palette.grey.30',
      lighter: '$palette.grey.20',
      darker: '$palette.grey.15',
      darkest: '$palette.grey.10',
      default: '$palette.background.lightest',
      hover: '$palette.white.10',
      focus: '$palette.white.10 ',
      active: '$palette.black.10',
    },
    green: '#6CB33F',
  },
  typography: {
    fontFamily: '"Source Sans Pro", Arial, sans-serif',
    weight: {
      light: '300',
      regular: '400',
      semibold: '600',
    },
    small: {
      fontSize: '12px',
      lineHeight: '16px',
    },
    medium: {
      fontSize: '14px',
      lineHeight: '16px',
    },
    large: {
      fontSize: '16px',
      lineHeight: '24px',
    },
    xlarge: {
      fontSize: '24px',
      lineHeight: '32px',
    },
  },
  shadows: {
    0: 'none',
    1: '0 1px 2px $palette.black.15',
    2: '0 2px 4px $palette.black.15',
    3: '0 4px 10px $palette.black.15',
    4: '0 6px 20px $palette.black.15',
  },
  shape: {
    borderRadius: '2px',
  },
  spacing: {
    0: '0',
    1: '2px',
    3: '4px',
    4: '8px',
    5: '16px',
  },
};

export default theme;
