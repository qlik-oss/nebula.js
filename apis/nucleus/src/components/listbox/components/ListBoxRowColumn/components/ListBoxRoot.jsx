import React from 'react';
import { styled } from '@mui/material/styles';
import classes from '../helpers/classes';
import { barBorderWidthPx, barPadPx, barWithCheckboxLeftPadPx, CELL_PADDING_LEFT } from '../../../constants';

const getFreqFlexBasis = ({ sizes, frequencyMode, isGridMode, freqHitsValue }) => {
  if (frequencyMode === 'P') {
    return `${sizes.freqMinWidth}px`;
  }
  const flexBasis = isGridMode && !freqHitsValue ? 'max-content' : '25%';
  return flexBasis;
};

const getMaxFreqWidth = ({ sizes, frequencyMode, isGridMode }) => {
  if (isGridMode) {
    // This makes the neighbouring value stretch farther than when using a fixed freuency width.
    return 'max-content';
  }
  if (frequencyMode === 'P') {
    return sizes.freqMinWidth; // because it will never grow beyond "100.0%"
  }
  return sizes.freqMaxWidth;
};

const getRowSelectionStyle = ({ theme, checkboxes, styles, selectionState }) => {
  if (checkboxes) {
    if (selectionState === 'selected') {
      return {
        [`& .${classes.labelText}`]: {
          // Override labels (value and frequency count) color when selected.
          color: styles.selections.selected,
        },
      };
    }
    return {};
  }
  const selectionStyles = styles.selections;
  const backgroundColor = selectionStyles[selectionState];
  const contrastTextColor = selectionStyles[`${selectionState}Contrast`];
  return {
    background: backgroundColor,
    color: contrastTextColor,
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusBorder}`,
      outline: 'none',
    },
    '& $cell': {
      paddingRight: 0,
    },
    // Override default label text style for selection states
    // when contrasting text is needed.
    [`& .${classes.labelText}`]: {
      color: contrastTextColor,
    },
    [`& .${classes.icon}`]: {
      color: contrastTextColor,
    },
  };
};

const ellipsis = {
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const iconWidth = 24; // tick and lock icon width in px

const RowColRoot = styled('div', {
  shouldForwardProp: (prop) =>
    ![
      'checkboxes',
      'isGridMode',
      'isGridCol',
      'dense',
      'direction',
      'sizes',
      'frequencyMode',
      'freqHitsValue',
      'layout',
      'styles',
    ].includes(prop),
})(({ theme, checkboxes, isGridMode, isGridCol, dense, direction, sizes, frequencyMode, freqHitsValue, styles }) => {
  const { backgroundColor: _, ...contentFontStyles } = styles.content;

  const rowSelectionStyle = getRowSelectionStyle({ theme, styles, checkboxes, selectionState: 'selected' });
  const rowExcludedStyle = getRowSelectionStyle({ theme, styles, checkboxes, selectionState: 'excluded' });
  const barDefaultFilledStyle = {
    height: '100%',
    transition: 'width 0.2s',
    border: `${barBorderWidthPx}px solid`,
    borderColor: '#D9D9D9', // overridden by selected color (classes.S),
    backgroundColor: '#FAFAFA',
  };
  const barSelectedFilledStyle = {
    opacity: '30%',
  };

  return {
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusBorder} !important`,
    },
    '&:focus-visible': {
      outline: 'none',
    },

    '& .value': {
      '&:focus': {
        boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusBorder} !important`,
      },
      '&:focus-visible': {
        outline: 'none',
      },
    },

    [`& .${classes.row}`]: {
      flexWrap: 'nowrap',
      ...styles.content,
    },

    [`& .${classes.rowBorderBottom}`]: {
      borderBottom: isGridCol ? 'none' : `1px solid ${theme.palette.divider}`,
      borderLeft: isGridCol ? `1px solid ${theme.palette.divider}` : 'none',
    },

    [`& .${classes.column}`]: {
      flexWrap: 'nowrap',
      borderRight: `1px solid ${theme.palette.divider}`,
      ...styles.content,
    },

    // The interior wrapper for all field content.
    [`& .${classes.cell}`]: {
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      flexGrow: 1,
      minWidth: checkboxes ? '52px' : '26px', // these numbers are just enough to show one letter and ellipsis: A…
      flexBasis: checkboxes ? 'auto' : 'max-content',
      // Note that this padding is overridden when using checkboxes.
      paddingLeft: `${CELL_PADDING_LEFT}px`,
      paddingRight: 0,
    },

    // The leaf node, containing the label text.
    [`& .${classes.labelText}`]: {
      lineHeight: '24px',
      userSelect: 'none',
      paddingRight: '1px',
      ...ellipsis,
      ...contentFontStyles,
    },

    [`& .${classes.labelDense}`]: {
      lineHeight: '18px',
    },

    // Highlight is added to labelText spans, which are created as children to original labelText,
    // when a search string is matched.
    [`& .${classes.highlighted}`]: {
      backgroundColor: '#FFC72A',
    },

    // Checkbox and label container.
    [`& .${classes.checkboxLabel}`]: {
      margin: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',

      // The checkbox's span
      '& > span:nth-of-type(1)': {
        paddingRight: '8px',
      },
      // The checkbox's label container.
      '& > span:nth-of-type(2)': {
        ...ellipsis,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 0,
        paddingRight: '2px',
      },
    },

    // The icons container holding tick and lock, shown inside fields.
    [`& .${classes.icon}`]: {
      display: 'flex',
      justifyContent: 'center',
      width: iconWidth,
      minWidth: iconWidth,
      maxWidth: iconWidth,
      color: contentFontStyles.color,
    },

    // Selection styles (S=Selected, XS=ExcludedSelected, A=Alternative, X=Excluded).
    [`& .${classes.S}`]: {
      ...rowSelectionStyle,
      border: isGridMode ? 'none' : undefined,
    },

    [`& .${classes.XS}`]: {
      ...getRowSelectionStyle({ theme, styles, checkboxes, selectionState: 'selectedExcluded' }),
      border: isGridMode ? 'none' : undefined,
    },

    [`& .${classes.A}`]: {
      ...getRowSelectionStyle({ theme, styles, checkboxes, selectionState: 'alternative' }),
      border: isGridMode ? 'none' : undefined,
    },

    [`& .${classes.X}`]: {
      ...rowExcludedStyle,
      border: isGridMode ? 'none' : undefined,
    },

    [`& .${classes.X}, & .${classes.XS}`]: {
      // Override the selected color for bar-filled, when the value is selected and excluded.
      border: isGridMode ? 'none' : undefined,
      [`& .${classes.barSelected} .bar-filled`]: {
        ...barDefaultFilledStyle,
      },
    },

    [`& .${classes.frequencyCount}`]: {
      zIndex: 3,
      justifyContent: 'flex-end',
      ...ellipsis,
      flex: `0 0 ${getFreqFlexBasis({ sizes, frequencyMode, isGridMode, freqHitsValue })}`,
      minWidth: !isGridMode && frequencyMode !== 'P' && freqHitsValue ? sizes.freqMinWidth : 'max-content',
      maxWidth: getMaxFreqWidth({ sizes, frequencyMode, isGridMode }),
      textAlign: direction === 'rtl' ? 'left' : 'right',
      // In RTL, we already get the 8px from the value element's padding and for
      // percent mode we have already adapted the width (fixed width) to the max number.
      paddingLeft: direction !== 'rtl' ? '8px' : 0,
    },

    [`&.${classes.barContainer}`]: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    },

    [`& .${classes.bar}`]: {
      height: dense ? '16px' : '20px',
      position: 'absolute',
      zIndex: 1,
      alignSelf: 'center',
      left: barPadPx,
      width: `calc(100% - ${barPadPx * 2}px)`,
      display: 'flex',
      alignItems: 'center',
      '& .bar-filled': {
        ...barDefaultFilledStyle,
      },
    },
    [`& .${classes.barSelected}`]: {
      '& .bar-filled': {
        ...barSelectedFilledStyle,
      },
    },
    [`& .${classes.barWithCheckbox}`]: {
      left: direction === 'rtl' ? barPadPx : barWithCheckboxLeftPadPx,
      width: `calc(100% - ${barWithCheckboxLeftPadPx + barPadPx}px)`,
    },

    [`& .${classes.barSelectedWithCheckbox}`]: {
      '& .bar-filled': {
        ...barSelectedFilledStyle,
        backgroundColor: styles.selections.selected || '#BFE5D0',
        borderColor: styles.selections.selected,
      },
    },

    [`& .${classes.excludedTextWithCheckbox}`]: {
      color: styles.content.color,
      fontStyle: 'italic',
    },
  };
});

export default React.memo(RowColRoot);
