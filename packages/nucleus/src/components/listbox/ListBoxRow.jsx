import React, { useMemo } from 'react';

import themes from '@nebula.js/ui/theme';
import Text from '@nebula.js/ui/components/Text';
import Grid from '@nebula.js/ui/components/Grid';
import Lock from '@nebula.js/ui/icons/Lock';
import Tick from '@nebula.js/ui/icons/Tick';

export default function Row({
  index,
  style,
  data,
  theme = themes('light'),
}) {
  const {
    D,
    S,
    A,
    X,
  } = useMemo(() => ({
    D: theme.style({
      boxSizing: 'border-box',
      borderBottom: '1px solid $palette.divider',
      background: '$palette.background.default',
      color: '$palette.text.primary',
      justifyContent: 'space-between',
      '&:focus': {
        outline: 'none',
        boxShadow: 'inset 0 0 0 2px $bluePale',
      },
    }),
    S: theme.style({
      background: '$palette.green',
      color: '$palette.grey.100',
    }),
    A: theme.style({
      background: '$palette.grey.85',
    }),
    X: theme.style({
      background: '$palette.grey.70',
    }),
  }), [theme]);

  let label = '';
  const { onClick, pages } = data;
  let cell;
  if (pages) {
    const page = pages.filter(p => p.qArea.qTop <= index && index < p.qArea.qTop + p.qArea.qHeight)[0];
    if (page) {
      const area = page.qArea;
      if (index >= area.qTop && (index < area.qTop + area.qHeight)) {
        [cell] = page.qMatrix[index - area.qTop];
      }
    }
  }
  const classes = [D];
  let locked = false;
  let selected = false;
  if (cell) {
    label = cell.qText;
    locked = cell.qState === 'L' || cell.qState === 'XL';
    selected = cell.qState === 'S' || cell.qState === 'XS';
    if (cell.qState === 'S' || cell.qState === 'L') {
      classes.push(S);
    } else if (cell.qState === 'A') {
      classes.push(A);
    } else if (cell.qState === 'X' || cell.qState === 'XS' || cell.qState === 'XL') {
      classes.push(X);
    }
  }
  return (
    <Grid
      className={classes.join(' ')}
      style={style}
      onClick={onClick}
      role="row"
      tabIndex={0}
      data-n={cell && cell.qElemNumber}
    >
      <Text nowrap>
        {cell ? `${label}` : '' }
      </Text>
      {locked && (<Lock size="small" />)}
      {selected && (<Tick size="small" />)}
    </Grid>
  );
}
