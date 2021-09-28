import React from 'react';

import { Grid, Typography } from '@mui/material';

import { useTheme } from '@nebula.js/ui/theme';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';

const useStyles = (theme) => ({
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
});

export default function Column({ index, style, data }) {
  const theme = useTheme();
  const styles = useStyles(theme);
  let sxProp = styles.column;

  let label = '';
  const { onClick, pages } = data;
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
      sxProp = { ...sxProp, ...styles.S };
    } else if (cell.qState === 'A') {
      sxProp = { ...sxProp, ...styles.A };
    } else if (cell.qState === 'X' || cell.qState === 'XS' || cell.qState === 'XL') {
      sxProp = { ...sxProp, ...styles.X };
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
    acc.push([label.slice(curr.qCharPos, curr.qCharPos + curr.qCharCount), styles.highlighted]);

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
      sx={sxProp}
      style={style}
      onClick={onClick}
      alignItems="center"
      role="row"
      tabIndex={0}
      data-n={cell && cell.qElemNumber}
    >
      <Grid item style={{ minWidth: 0, flexGrow: 1 }} sx={styles.cell} title={`${label}`}>
        {ranges.length === 0 ? (
          <Typography component="span" noWrap color="inherit">{`${label}`}</Typography>
        ) : (
          labels.map(([l, highlighted], ix) => (
            // eslint-disable-next-line react/no-array-index-key
            <Typography component="span" key={ix} sx={highlighted} noWrap>
              {l}
            </Typography>
          ))
        )}
      </Grid>
      <Grid item sx={styles.icon}>
        {locked && <Lock size="small" />}
        {selected && <Tick size="small" />}
      </Grid>
    </Grid>
  );
}
