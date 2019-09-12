import React from 'react';

import { Grid, Typography } from '@nebula.js/ui/components';

import { makeStyles } from '@nebula.js/ui/theme';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';

const useStyles = makeStyles(theme => ({
  row: {
    flexWrap: 'nowrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  cell: {
    padding: '8px',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    lineHeight: '16px',
  },
  icon: {
    padding: theme.spacing(1),
  },
  D: {
    // background: '#fff',
  },
  S: {
    background: '#6CB33F',
    color: theme.palette.text.primary,
  },
  A: {
    background: theme.palette.background.lighter,
  },
  X: {
    background: theme.palette.background.darker,
  },
}));

export default function Row({ index, style, data }) {
  const classes = useStyles();
  const classArr = [classes.row];

  let label = '';
  const { onClick, pages } = data;
  let cell;
  if (pages) {
    const page = pages.filter(p => p.qArea.qTop <= index && index < p.qArea.qTop + p.qArea.qHeight)[0];
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
  return (
    <Grid
      container
      spacing={0}
      className={classArr.join(' ')}
      style={style}
      onClick={onClick}
      role="row"
      tabIndex={0}
      data-n={cell && cell.qElemNumber}
    >
      <Grid item style={{ minWidth: 0, flexGrow: 1 }}>
        <Typography className={classes.cell} noWrap>
          {cell ? `${label}` : ''}
        </Typography>
      </Grid>
      <Grid item className={classes.icon}>
        {locked && <Lock size="small" />}
        {selected && <Tick size="small" />}
      </Grid>
    </Grid>
  );
}
