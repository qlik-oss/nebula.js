import React from 'react';

import styled from '@nebula.js/ui/components/styled';
import Text from '@nebula.js/ui/components/Text';
import Grid from '@nebula.js/ui/components/Grid';
import Lock from '@nebula.js/ui/icons/Lock';
import Tick from '@nebula.js/ui/icons/Tick';

const defaultClasses = styled({
  boxSizing: 'border-box',
  borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
  background: '$grey100',
  color: '$grey25',
  justifyContent: 'space-between',
  '&:focus': {
    outline: 'none',
    boxShadow: 'inset 0 0 0 2px $bluePale',
  },
});

const S = styled({
  background: '$green',
  color: '$grey100',
});

const A = styled({
  background: '$grey85',
});

const X = styled({
  background: '$grey70',
});

export default function Row({
  index,
  style,
  data,
}) {
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
  const classes = [...defaultClasses];
  let locked = false;
  let selected = false;
  if (cell) {
    label = cell.qText;
    locked = cell.qState === 'L' || cell.qState === 'XL';
    selected = cell.qState === 'S' || cell.qState === 'XS';
    if (cell.qState === 'S' || cell.qState === 'L') {
      classes.push(...S);
    } else if (cell.qState === 'A') {
      classes.push(...A);
    } else if (cell.qState === 'X' || cell.qState === 'XS' || cell.qState === 'XL') {
      classes.push(...X);
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
