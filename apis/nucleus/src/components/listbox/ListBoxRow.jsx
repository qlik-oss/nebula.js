import React from 'react';

import { Grid, Typography } from '@material-ui/core';

import { makeStyles } from '@nebula.js/ui/theme';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';

const useStyles = makeStyles((theme) => ({
  row: {
    flexWrap: 'nowrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusOutline}`,
      outline: 'none',
    },
    userSelect: 'none',
  },
  cell: {
    padding: '8px',
    '& span': {
      whiteSpace: 'nowrap',
      fontSize: '12px',
      lineHeight: '16px',
    },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  icon: {
    padding: theme.spacing(1),
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

export default function Row({ index, style, data }) {
  const classes = useStyles();
  const classArr = [classes.row];

  let label = '';
  const { onMouseDown, onMouseUp, onMouseEnter, pages } = data;
  let cell;
  if (pages) {
    const page = pages.filter((p) => p.qArea.qTop <= index && index < p.qArea.qTop + p.qArea.qHeight)[0];
    if (page) {
      const area = page.qArea;
      if (index >= area.qTop && index < area.qTop + area.qHeight) {
        [cell] = page.qMatrix[index - area.qTop];
      }
    }
  }
  let locked = false;
  let selected = false;
  if (cell) {
    label = cell.qText;
    locked = cell.qState === 'L' || cell.qState === 'XL';
    selected = cell.qState === 'S' || cell.qState === 'XS';
    if (cell.qState === 'S' || cell.qState === 'L') {
      classArr.push(classes.S);
    } else if (cell.qState === 'A') {
      classArr.push(classes.A);
    } else if (cell.qState === 'X' || cell.qState === 'XS' || cell.qState === 'XL') {
      classArr.push(classes.X);
    }
  }

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

  return (
    <Grid
      container
      spacing={0}
      className={classArr.join(' ').trim()}
      style={style}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      role="row"
      tabIndex={0}
      data-n={cell && cell.qElemNumber}
    >
      <Grid item style={{ minWidth: 0, flexGrow: 1 }} className={classes.cell} title={`${label}`}>
        {ranges.length === 0 ? (
          <Typography component="span" noWrap color="inherit">{`${label}`}</Typography>
        ) : (
          labels.map(([l, highlighted], ix) => (
            // eslint-disable-next-line react/no-array-index-key
            <Typography component="span" key={ix} className={highlighted} noWrap>
              {l}
            </Typography>
          ))
        )}
      </Grid>
      <Grid item className={classes.icon}>
        {locked && <Lock size="small" />}
        {selected && <Tick size="small" />}
      </Grid>
    </Grid>
  );
}
