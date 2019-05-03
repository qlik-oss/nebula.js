const theme = {
  palette: {
    grey: {
      100: '#ffffff',
      98: '#fafafa',
      95: '#f2f2f2',
      90: '#e6e6e6',
      85: '#D9D9D9',
      70: '#B3B3B3',
      25: '#404040',
    },
    black: {
      '03': 'rgba(0, 0, 0, 0.03)',
      '05': 'rgba(0, 0, 0, 0.05)',
      10: 'rgba(0, 0, 0, 0.10)',
      15: 'rgba(0, 0, 0, 0.15)',
      55: 'rgba(0, 0, 0, 0.55)',
    },
    text: {
      primary: '$palette.grey.25',
      secondary: '$palette.black.55',
    },
    divider: '$palette.black.15',
    background: {
      lightest: '$palette.grey.100',
      lighter: '$palette.grey.98',
      darker: '$palette.grey.95',
      darkest: '$palette.grey.90',
      default: '$palette.background.lightest',
      hover: '$palette.black.03',
      focus: '$palette.black.03',
      active: '$palette.black.05',
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
