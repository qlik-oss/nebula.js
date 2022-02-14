import React, { useState, useEffect } from 'react';

import { FormControlLabel, Grid, Typography } from '@material-ui/core';

import { makeStyles } from '@nebula.js/ui/theme';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';
import ListBoxCheckbox from './ListBoxCheckbox';

const useStyles = makeStyles((theme) => ({
  column: {
    flexWrap: 'nowrap',
    borderRight: `1px solid ${theme.palette.divider}`,
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusOutline}`,
      outline: 'none',
    },
  },
  cell: {
    padding: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    '& span': {
      whiteSpace: 'nowrap',
      fontSize: '12px',
      lineHeight: '16px',
      userSelect: 'none',
    },
  },
  valueLabel: {
    paddingLeft: '6px',
    paddingRight: '6px',
  },
  icon: {
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

export default function Column({ index, style, data }) {
  const { onClick, onMouseDown, onMouseUp, onMouseEnter, pages, checkboxes = false } = data;

  const [isSelected, setSelected] = useState(false);
  const [isLocked, setLocked] = useState(false);
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
    const locked = cell.qState === 'L' || cell.qState === 'XL';
    const selected = cell.qState === 'S' || cell.qState === 'XS';
    setLocked(locked);
    setSelected(selected);

    const clazzArr = [classes.column];
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
  }, [cell]);

  const getCheckboxField = ({ lbl, highlighted, color, qElemNumber }) => {
    const cb = <ListBoxCheckbox label={lbl} highlighted={highlighted} checked={isSelected} />;
    return (
      <FormControlLabel
        color={color}
        control={cb}
        className={classes.checkboxLabel}
        label={<Typography>{lbl}</Typography>}
        key={qElemNumber}
      />
    );
  };
  const getValueField = ({ lbl, highlighted, ix, color }) => (
    <Typography
      component="span"
      key={ix}
      className={[classes.valueLabel, highlighted].join(' ').trim()}
      noWrap
      color={color}
    >
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

  return (
    <Grid
      container
      spacing={0}
      className={classArr.join(' ').trim()}
      style={style}
      onClick={onClick}
      alignItems="center"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      role="row"
      tabIndex={0}
      data-n={cell && cell.qElemNumber}
    >
      <Grid
        item
        style={{ display: 'flex', alignItems: 'center', minWidth: 0, flexGrow: 1 }}
        className={classes.cell}
        title={`${label}`}
      >
        {ranges.length === 0
          ? getField({ lbl: label, color: 'inherit' })
          : labels.map(([lbl, highlighted], ix) => getField({ ix, highlighted, lbl }))}
      </Grid>
      <Grid item className={!checkboxes && classes.icon}>
        {isLocked && <Lock sx={{ verticalAlign: 'middle' }} size="small" />}
        {!checkboxes && isSelected && <Tick sx={{ verticalAlign: 'middle' }} size="small" />}
      </Grid>
    </Grid>
  );
}
