import React, { useState, useEffect } from 'react';

import { FormControlLabel, Grid, Typography } from '@material-ui/core';

import { makeStyles } from '@nebula.js/ui/theme';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';
import ListBoxCheckbox from './ListBoxCheckbox';
import getSegmentsFromRanges from './listbox-highlight';

const ellipsis = {
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const useStyles = makeStyles((theme) => ({
  row: {
    flexWrap: 'nowrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
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
  },

  // The interior wrapper for all field content.
  cell: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexGrow: 1,
    // Note that this padding is overridden when using checkboxes.
    paddingLeft: '12px',
    paddingRight: '12px',
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
    // For checkboxes the first child is the checkbox container, second is the label container.
    '& > span:nth-child(2)': {
      ...ellipsis,
      display: 'flex',
      alignItems: 'center',
    },
  },

  // The icons container holding tick and lock, shown inside fields.
  icon: {
    display: 'flex',
    padding: theme.spacing(1),
  },

  // Selection styles (S=Selected, A=Available, X=Excluded).
  S: {
    background: theme.palette.selected.main,
    color: theme.palette.selected.mainContrastText,
    '&:focus': {
      boxShadow: `inset 0 0 0 2px rgba(0, 0, 0, 0.3)`,
      outline: 'none',
    },
  },
  A: {
    background: theme.palette.selected.alternative,
    color: theme.palette.selected.alternativeContrastText,
  },
  X: {
    background: theme.palette.selected.excluded,
    color: theme.palette.selected.excludedContrastText,
  },
  frequencyCount: {
    paddingLeft: '8px',
    paddingRight: '8px',
  },
}));

export default function RowColumn({ index, style, data, column = false }) {
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
  } = data;

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
    const selected = c && ['S', 'XS', 'L'].includes(c.qState);
    setSelected(selected);
    setCell(c);
  }, [pages]);

  useEffect(() => {
    if (!cell) {
      return;
    }

    const clazzArr = [column ? classes.column : classes.row];
    if (!checkboxes) {
      if (cell.qState === 'S' || cell.qState === 'L') {
        clazzArr.push(classes.S);
      } else if (cell.qState === 'A') {
        clazzArr.push(classes.A);
      } else if (cell.qState === 'X' || cell.qState === 'XS' || cell.qState === 'XL') {
        clazzArr.push(classes.X);
      }
    }
    setClassArr(clazzArr);
  }, [cell && cell.qState, checkboxes]);

  const joinClassNames = (namesArray) =>
    namesArray
      .filter((c) => !!c)
      .join(' ')
      .trim();

  const getValueField = ({ lbl, ix, color, highlighted = false }) => (
    <Typography
      component="span"
      variant="body2"
      key={ix}
      className={joinClassNames([classes.labelText, highlighted && classes.highlighted, dense && classes.labelDense])}
      color={color}
    >
      <span style={{ whiteSpace: 'pre' }}>{lbl}</span>
    </Typography>
  );

  const getCheckboxField = ({ lbl, color, qElemNumber }) => {
    const cb = <ListBoxCheckbox label={lbl} checked={isSelected} dense={dense} />;
    const labelTag = typeof lbl === 'string' ? getValueField({ lbl, color, highlighted: false }) : lbl;
    return (
      <FormControlLabel
        color={color}
        control={cb}
        className={classes.checkboxLabel}
        label={labelTag}
        key={qElemNumber}
      />
    );
  };

  const label = cell ? cell.qText : '';
  const getFrequencyText = () => {
    if (cell) {
      return cell.qFrequency ? cell.qFrequency : '-';
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

  return (
    <Grid
      container
      spacing={0}
      classes={{
        root: classes.fieldRoot,
      }}
      className={joinClassNames(['value', ...classArr])}
      style={style}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      role={column ? 'column' : 'row'}
      tabIndex={0}
      data-n={cell && cell.qElemNumber}
    >
      <Grid item style={cellStyle} className={classes.cell} title={`${label}`}>
        {ranges.length === 0 ? getField({ lbl: label, color: 'inherit' }) : getFieldWithRanges({ lbls: labels })}
      </Grid>

      {frequencyMode !== 'N' && (
        <Grid item style={{ display: 'flex', alignItems: 'center' }} className={classes.frequencyCount}>
          <Typography
            noWrap
            color="inherit"
            variant="body2"
            className={joinClassNames([dense && classes.labelDense, classes.labelText])}
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
  );
}
