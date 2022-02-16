import React, { useState, useEffect } from 'react';

import { FormControlLabel, Grid, Typography } from '@material-ui/core';

import { makeStyles } from '@nebula.js/ui/theme';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';
import ListBoxCheckbox from './ListBoxCheckbox';

const useStyles = makeStyles((theme) => ({
  row: {
    flexWrap: 'nowrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusOutline}`,
      outline: 'none',
    },
  },
  column: {
    flexWrap: 'nowrap',
    borderRight: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusOutline}`,
      outline: 'none',
    },
  },
  cell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexGrow: 1,
    paddingLeft: '6px',
    paddingRight: '6px',
    '& span': {
      fontSize: '0.9rem',
      whiteSpace: 'nowrap',
      lineHeight: '16px',
      userSelect: 'none',
    },
  },
  icon: {
    display: 'flex',
    padding: theme.spacing(1),
  },
  checkboxLabel: {
    margin: 0,
  },
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
  highlighted: {
    backgroundColor: '#FFC72A',
  },
}));

export default function RowColumn({ index, style, data, column = false }) {
  const { onClick, onMouseDown, onMouseUp, onMouseEnter, pages, isLocked, checkboxes = false } = data;

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

  useEffect(() => {
    if (!cell) {
      return;
    }
    const selected = cell.qState === 'S' || cell.qState === 'XS' || cell.qState === 'L';
    setSelected(selected);

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
  }, [cell && cell.qState]);

  const getCheckboxField = ({ lbl, color, qElemNumber }) => {
    const cb = <ListBoxCheckbox label={lbl} checked={isSelected} />;
    const labelTag =
      typeof lbl === 'string' ? (
        <Typography component="span" noWrap>
          {lbl}
        </Typography>
      ) : (
        lbl
      );
    return (
      <FormControlLabel
        color={color}
        control={cb}
        className={[classes.checkboxLabel].join(' ').trim()}
        label={labelTag}
        key={qElemNumber}
      />
    );
  };
  const getValueField = ({ lbl, highlighted, ix, color }) => (
    <Typography component="span" key={ix} className={highlighted} noWrap color={color}>
      {lbl}
    </Typography>
  );

  const label = cell ? cell.qText : '';

  // Handle search highlights
  const ranges =
    (cell && cell.qHighlightRanges && cell.qHighlightRanges.qRanges.sort((a, b) => a.qCharPos - b.qCharPos)) || [];

  const labels = ranges.reduce((acc, curr, ix) => {
    // First non highlighted segment
    if (curr.qCharPos > 0 && ix === 0) {
      acc.push([label.slice(0, curr.qCharPos)]);
    }

    // Previous non highlighted segment
    const prev = ranges[ix - 1];
    if (prev) {
      acc.push([label.slice(prev.qCharPos + prev.qCharPos + 1, curr.qCharPos)]);
    }

    // Highlighted segment
    acc.push([label.slice(curr.qCharPos, curr.qCharPos + curr.qCharCount), classes.highlighted]);

    // Last non highlighted segment
    if (ix === ranges.length - 1 && curr.qCharPos + curr.qCharCount < label.length) {
      acc.push([label.slice(curr.qCharPos + curr.qCharCount)]);
    }
    return acc;
  }, []);

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
      className={classArr.join(' ').trim()}
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
      {(showLock || showTick) && (
        <Grid item className={classes.icon}>
          {showLock && <Lock style={iconStyles} size="small" />}
          {showTick && <Tick style={iconStyles} size="small" />}
        </Grid>
      )}
    </Grid>
  );
}
