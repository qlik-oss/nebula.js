import React, { useState, useEffect, useCallback } from 'react';

import { FormControlLabel, Grid, Typography } from '@material-ui/core';

import { makeStyles } from '@nebula.js/ui/theme';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';
import ListBoxCheckbox from './ListBoxCheckbox';
import getSegmentsFromRanges from './listbox-highlight';
import ListBoxRadioButton from './ListBoxRadioButton';
import { getFieldKeyboardNavigation } from './listbox-keyboard-navigation';

const ellipsis = {
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const barPadPx = 4;
const barBorderWidthPx = 1;
const barWithCheckboxLeftPadPx = 29;
const frequencyTextNone = '0';

const getSelectedStyle = ({ theme }) => ({
  background: theme.palette.selected.main,
  color: theme.palette.selected.mainContrastText,
  '&:focus': {
    boxShadow: `inset 0 0 0 2px rgba(0, 0, 0, 0.3)`,
    outline: 'none',
  },
  '& $cell': {
    paddingRight: 0,
  },
});

const useStyles = makeStyles((theme) => ({
  row: {
    flexWrap: 'nowrap',
    color: theme.palette.text.primary,
  },
  rowBorderBottom: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  column: {
    flexWrap: 'nowrap',
    borderRight: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
  },
  fieldRoot: {
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusBorder} !important`,
    },
    '&:focus-visible': {
      outline: 'none',
    },
  },

  // The interior wrapper for all field content.
  cell: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexGrow: 1,
    // Note that this padding is overridden when using checkboxes.
    paddingLeft: '9px',
    paddingRight: '9px',
  },

  // The leaf node, containing the label text.
  labelText: {
    flexBasis: 'max-content',
    lineHeight: '16px',
    userSelect: 'none',
    whiteSpace: 'pre', // to keep white-space on highlight
    ...ellipsis,
  },

  labelDense: {
    fontSize: 12,
  },

  // Highlight is added to labelText spans, which are created as siblings to original labelText,
  // when a search string is matched.
  highlighted: {
    overflow: 'visible',
    width: '100%',
    '& > span': {
      width: '100%',
      backgroundColor: '#FFC72A',
    },
  },

  // Checkbox and label container.
  checkboxLabel: {
    margin: 0,
    width: '100%',
    height: '100%',

    // The checkbox's span
    '& > span:nth-child(1)': {
      paddingRight: '8px',
    },
    // The checkbox's label container.
    '& > span:nth-child(2)': {
      ...ellipsis,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 0,
    },
  },

  // The icons container holding tick and lock, shown inside fields.
  icon: {
    display: 'flex',
    padding: theme.spacing(1, 1, 1, 0),
  },

  // Selection styles (S=Selected, XS=ExcludedSelected, A=Available, X=Excluded).
  S: {
    ...getSelectedStyle({ theme }),
  },
  XS: {
    ...getSelectedStyle({ theme }),
    background: theme.palette.selected.excluded,
    color: theme.palette.selected.mainContrastText,
  },
  A: {
    background: theme.palette.selected.alternative,
    color: theme.palette.selected.alternativeContrastText,
  },
  X: {
    background: theme.palette.selected.excluded,
    color: theme.palette.selected.mainContrastText,
  },
  frequencyCount: {
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  barContainer: {
    position: 'relative',
  },
  bar: {
    border: `${barBorderWidthPx}px solid`,
    borderColor: '#D9D9D9',
    height: '16px',
    position: 'absolute',
    zIndex: '-1',
    alignSelf: 'center',
    left: `${barPadPx}px`,
    transition: 'width 0.2s',
    backgroundColor: '#FAFAFA',
  },
  barSelected: {
    opacity: '30%',
    zIndex: '0',
    background: theme.palette.background.lighter,
  },
  barWithCheckbox: {
    left: `${barWithCheckboxLeftPadPx}px`,
  },
  barSelectedWithCheckbox: {
    background: '#BFE5D0',
    borderColor: '#BFE5D0',
  },
  excludedTextWithCheckbox: {
    color: '#828282',
  },
}));

function RowColumn({ index, style, data, column = false }) {
  const {
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    pages,
    isLocked,
    checkboxes = false,
    dense = false,
    frequencyMode = 'N',
    isSingleSelect,
    actions,
    frequencyMax = '',
    histogram = false,
    keyboard,
    showGray = true,
  } = data;

  const handleKeyDownCallback = useCallback(getFieldKeyboardNavigation(actions), [actions]);

  const [isSelected, setSelected] = useState(false);
  const [cell, setCell] = useState();

  const classes = useStyles();
  const [classArr, setClassArr] = useState([]);

  useEffect(() => {
    if (!pages) {
      return;
    }
    let c;
    const page = pages.filter((p) => p.qArea.qTop <= index && index < p.qArea.qTop + p.qArea.qHeight)[0];
    if (page) {
      const area = page.qArea;
      if (index >= area.qTop && index < area.qTop + area.qHeight) {
        [c] = page.qMatrix[index - area.qTop];
      }
    }
    setCell(c);
  }, [pages]);

  const isExcluded = (c) => (c ? c.qState === 'X' || c.qState === 'XS' || c.qState === 'XL' : null);
  const isAlternative = (c) => (c ? c.qState === 'A' : null);

  useEffect(() => {
    if (!cell) {
      return;
    }
    const selected = cell.qState === 'S' || cell.qState === 'XS' || cell.qState === 'L';
    setSelected(selected);

    const clazzArr = [column ? classes.column : classes.row];
    if (!(histogram && dense)) clazzArr.push(classes.rowBorderBottom);
    if (!checkboxes) {
      if (cell.qState === 'XS') {
        clazzArr.push(showGray ? classes.XS : classes.S);
      } else if (cell.qState === 'S' || cell.qState === 'L') {
        clazzArr.push(classes.S);
      } else if (showGray && isAlternative(cell)) {
        clazzArr.push(classes.A);
      } else if (showGray && isExcluded(cell)) {
        clazzArr.push(classes.X);
      }
    }
    setClassArr(clazzArr);
  }, [cell && cell.qState]);

  const joinClassNames = (namesArray) =>
    namesArray
      .filter((c) => !!c)
      .join(' ')
      .trim();

  const excludedOrAlternative = () => (isAlternative(cell) || isExcluded(cell)) && checkboxes;

  const getValueField = ({ lbl, ix, color, highlighted = false }) => (
    <Typography
      component="span"
      variant="body2"
      key={ix}
      className={joinClassNames([
        classes.labelText,
        highlighted && classes.highlighted,
        dense && classes.labelDense,
        showGray && excludedOrAlternative() && classes.excludedTextWithCheckbox,
      ])}
      color={color}
    >
      <span style={{ whiteSpace: 'pre' }}>{lbl}</span>
    </Typography>
  );

  const preventContextMenu = (event) => {
    if (checkboxes) {
      // Event will not propagate in the checkbox/radiobutton case
      onClick(event);
    }
    event.preventDefault();
  };
  const getCheckboxField = ({ lbl, color, qElemNumber }) => {
    const cb = (
      <ListBoxCheckbox
        label={lbl}
        checked={isSelected}
        dense={dense}
        excluded={isExcluded(cell)}
        alternative={isAlternative(cell)}
        showGray={showGray}
      />
    );
    const rb = <ListBoxRadioButton label={lbl} checked={isSelected} dense={dense} />;
    const labelTag = typeof lbl === 'string' ? getValueField({ lbl, color, highlighted: false }) : lbl;
    return (
      <FormControlLabel
        color={color}
        control={isSingleSelect ? rb : cb}
        className={classes.checkboxLabel}
        label={labelTag}
        key={qElemNumber}
      />
    );
  };

  const label = cell ? cell.qText : '';
  const getFrequencyText = () => {
    if (cell) {
      return cell.qFrequency ? cell.qFrequency : frequencyTextNone;
    }
    return '';
  };

  // Search highlights. Split up labelText span into several and add the highlighted class to matching sub-strings.
  const ranges =
    (cell && cell.qHighlightRanges && cell.qHighlightRanges.qRanges.sort((a, b) => a.qCharPos - b.qCharPos)) || [];

  const labels = getSegmentsFromRanges(label, ranges);

  const getField = checkboxes ? getCheckboxField : getValueField;
  const getFieldWithRanges = ({ lbls }) => {
    const labelsWithRanges = lbls.map(([lbl, highlighted], ix) => getValueField({ ix, highlighted, lbl }));
    return checkboxes ? getCheckboxField({ lbl: labelsWithRanges }) : labelsWithRanges;
  };

  const iconStyles = {
    alignItems: 'center',
    display: 'flex',
  };

  const showLock = isSelected && isLocked;
  const showTick = !checkboxes && isSelected && !isLocked;

  const cellStyle = {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexGrow: 1,
    padding: checkboxes ? 0 : undefined,
  };

  const hasHistogramBar = () => cell && histogram && getFrequencyText() !== frequencyTextNone;
  const getBarWidth = (qFrequency) => {
    const freqStr = String(qFrequency);
    const isPercent = freqStr.substring(freqStr.length - 1) === '%';
    const freq = parseFloat(isPercent ? freqStr : qFrequency);
    const rightSlice = checkboxes
      ? `(${barWithCheckboxLeftPadPx}px + ${barPadPx + barBorderWidthPx * 2}px)`
      : `${barPadPx * 2 + barBorderWidthPx * 2}px`;
    const width = isPercent ? freq : (freq / frequencyMax) * 100;
    return `calc(${width}% - ${rightSlice})`;
  };

  const isFirstElement = index === 0;

  return (
    <div className={classes.barContainer}>
      <Grid
        container
        spacing={0}
        className={joinClassNames(['value', ...classArr])}
        classes={{
          root: classes.fieldRoot,
        }}
        style={style}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
        onKeyDown={handleKeyDownCallback}
        onContextMenu={preventContextMenu}
        role={column ? 'column' : 'row'}
        tabIndex={isFirstElement && (!keyboard.enabled || keyboard.active) ? 0 : -1}
        data-n={cell && cell.qElemNumber}
      >
        {hasHistogramBar() && (
          <div
            className={joinClassNames([
              classes.bar,
              checkboxes && classes.barWithCheckbox,
              isSelected && (checkboxes ? classes.barSelectedWithCheckbox : classes.barSelected),
            ])}
            style={{ width: getBarWidth(cell.qFrequency) }}
          />
        )}
        <Grid
          item
          style={cellStyle}
          className={joinClassNames([classes.cell, classes.selectedCell])}
          title={`${label}`}
        >
          {ranges.length === 0 ? getField({ lbl: label, color: 'inherit' }) : getFieldWithRanges({ lbls: labels })}
        </Grid>

        {frequencyMode !== 'N' && (
          <Grid item style={{ display: 'flex', alignItems: 'center' }} className={classes.frequencyCount}>
            <Typography
              noWrap
              color="inherit"
              variant="body2"
              className={joinClassNames([
                dense && classes.labelDense,
                classes.labelText,
                showGray && excludedOrAlternative() && classes.excludedTextWithCheckbox,
              ])}
            >
              {getFrequencyText()}
            </Typography>
          </Grid>
        )}

        {(showLock || showTick) && (
          <Grid item className={classes.icon}>
            {showLock && <Lock style={iconStyles} size="small" />}
            {showTick && <Tick style={iconStyles} size="small" />}
          </Grid>
        )}
      </Grid>
    </div>
  );
}

export default RowColumn;
