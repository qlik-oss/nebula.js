import React, { useState, useEffect, useCallback } from 'react';

import { styled } from '@mui/material/styles';

import { FormControlLabel, Grid, Typography } from '@mui/material';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';
import ListBoxCheckbox from './ListBoxCheckbox';
import getSegmentsFromRanges from './listbox-highlight';
import ListBoxRadioButton from './ListBoxRadioButton';
import { getFieldKeyboardNavigation } from '../interactions/listbox-keyboard-navigation';

const PREFIX = 'RowColumn';

const classes = {
  row: `${PREFIX}-row`,
  rowBorderBottom: `${PREFIX}-rowBorderBottom`,
  column: `${PREFIX}-column`,
  fieldRoot: `${PREFIX}-fieldRoot`,
  cell: `${PREFIX}-cell`,
  labelText: `${PREFIX}-labelText`,
  labelDense: `${PREFIX}-labelDense`,
  highlighted: `${PREFIX}-highlighted`,
  checkboxLabel: `${PREFIX}-checkboxLabel`,
  icon: `${PREFIX}-icon`,
  S: `${PREFIX}-S`,
  XS: `${PREFIX}-XS`,
  A: `${PREFIX}-A`,
  X: `${PREFIX}-X`,
  frequencyCount: `${PREFIX}-frequencyCount`,
  barContainer: `${PREFIX}-barContainer`,
  bar: `${PREFIX}-bar`,
  barSelected: `${PREFIX}-barSelected`,
  barWithCheckbox: `${PREFIX}-barWithCheckbox`,
  barSelectedWithCheckbox: `${PREFIX}-barSelectedWithCheckbox`,
  excludedTextWithCheckbox: `${PREFIX}-excludedTextWithCheckbox`,
};

const ellipsis = {
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const barPadPx = 4;
const barBorderWidthPx = 1;
const barWithCheckboxLeftPadPx = 29;
const frequencyTextNone = '-';

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

const Root = styled('div', {
  shouldForwardProp: (props) => props !== 'flexBasisProp',
})(({ theme, flexBasisProp }) => ({
  [`& .${classes.row}`]: {
    flexWrap: 'nowrap',
    color: theme.listBox?.content?.color ?? theme.palette.text.primary,
  },

  [`& .${classes.rowBorderBottom}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  [`& .${classes.column}`]: {
    flexWrap: 'nowrap',
    borderRight: `1px solid ${theme.palette.divider}`,
    color: theme.listBox?.content?.color ?? theme.palette.text.primary,
  },

  [`& .${classes.fieldRoot}`]: {
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusBorder} !important`,
    },
    '&:focus-visible': {
      outline: 'none',
    },
  },

  // The interior wrapper for all field content.
  [`& .${classes.cell}`]: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexGrow: 1,
    // Note that this padding is overridden when using checkboxes.
    paddingLeft: '9px',
    paddingRight: '9px',
  },

  // The leaf node, containing the label text.
  [`& .${classes.labelText}`]: {
    flexBasis: flexBasisProp,
    lineHeight: '16px',
    userSelect: 'none',
    whiteSpace: 'pre', // to keep white-space on highlight
    paddingRight: '9px',
    ...ellipsis,
    fontSize: theme.listBox?.content?.fontSize,
    fontFamily: theme.listBox?.content?.fontFamily,
  },

  [`& .${classes.labelDense}`]: {
    fontSize: 12,
  },

  // Highlight is added to labelText spans, which are created as siblings to original labelText,
  // when a search string is matched.
  [`& .${classes.highlighted}`]: {
    overflow: 'visible',
    width: '100%',
    '& > span': {
      width: '100%',
      backgroundColor: '#FFC72A',
    },
  },

  // Checkbox and label container.
  [`& .${classes.checkboxLabel}`]: {
    margin: 0,
    width: '100%',
    height: '100%',

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
    },
  },

  // The icons container holding tick and lock, shown inside fields.
  [`& .${classes.icon}`]: {
    display: 'flex',
    padding: theme.spacing(1, 1, 1, 0),
  },

  // Selection styles (S=Selected, XS=ExcludedSelected, A=Available, X=Excluded).
  [`& .${classes.S}`]: {
    ...getSelectedStyle({ theme }),
  },

  [`& .${classes.XS}`]: {
    ...getSelectedStyle({ theme }),
    background: theme.palette.selected.excluded,
    color: theme.palette.selected.mainContrastText,
  },

  [`& .${classes.A}`]: {
    background: theme.palette.selected.alternative,
    color: theme.palette.selected.alternativeContrastText,
  },

  [`& .${classes.X}`]: {
    background: theme.palette.selected.excluded,
    color: theme.palette.selected.excludedContrastText,
  },

  [`& .${classes.frequencyCount}`]: {
    width: '66px',
    justifyContent: 'flex-end',
  },

  [`&.${classes.barContainer}`]: {
    height: '100%',
    display: 'inline-block',
  },

  [`& .${classes.bar}`]: {
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

  [`& .${classes.barSelected}`]: {
    opacity: '30%',
    zIndex: '0',
    background: theme.palette.background.lighter,
  },

  [`& .${classes.barWithCheckbox}`]: {
    left: `${barWithCheckboxLeftPadPx}px`,
  },

  [`& .${classes.barSelectedWithCheckbox}`]: {
    background: '#BFE5D0',
    borderColor: '#BFE5D0',
  },

  [`& .${classes.excludedTextWithCheckbox}`]: {
    color: '#828282',
    fontStyle: 'italic',
  },
}));

function RowColumn({ index, style, data }) {
  const {
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    pages,
    isLocked,
    column = false,
    checkboxes = false,
    textAlign,
    direction,
    dense = false,
    freqIsAllowed,
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

  const isNumeric = !['NaN', undefined].includes(cell?.qNum);
  let valueTextAlign;
  const isAutoTextAlign = textAlign === undefined || textAlign.auto;
  const dirToTextAlignMap = {
    rtl: 'right',
    ltr: 'left',
  };

  if (isAutoTextAlign) {
    valueTextAlign = isNumeric ? 'right' : dirToTextAlignMap[direction];
  } else {
    valueTextAlign = textAlign?.align || 'left';
  }

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
      justifyContent={valueTextAlign}
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
      <ListBoxCheckbox label={lbl} checked={isSelected} dense={dense} excluded={isExcluded(cell)} showGray={showGray} />
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
    justifyContent: valueTextAlign,
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
  const flexBasisVal = checkboxes ? 'auto' : 'max-content';

  return (
    <Root className={classes.barContainer} flexBasisProp={flexBasisVal}>
      <Grid
        container
        gap={0}
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

        {freqIsAllowed && (
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

        {!checkboxes && (
          <Grid item className={classes.icon}>
            {!showLock && !showTick && <span style={{ minWidth: '12px' }} />}
            {showLock && <Lock style={iconStyles} size="small" />}
            {showTick && <Tick style={iconStyles} size="small" />}
          </Grid>
        )}
      </Grid>
    </Root>
  );
}

export default RowColumn;
