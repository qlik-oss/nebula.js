import React, { useRef, useState, useContext } from 'react';

import Remove from '@nebula.js/ui/icons/remove';
import Lock from '@nebula.js/ui/icons/lock';
// import themes from '@nebula.js/ui/theme';

import { IconButton, Grid, Typography } from '@nebula.js/ui/components';

import { makeStyles } from '@nebula.js/ui/theme';

import ListBoxPopover from '../listbox/ListBoxPopover';

import LocaleContext from '../../contexts/LocaleContext';

const useStyles = makeStyles(theme => ({
  item: {
    cursor: 'pointer',
    padding: '4px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export default function OneField({
  field,
  api,
  // theme = themes('light'),
}) {
  const translator = useContext(LocaleContext);
  const alignTo = useRef();
  const [isActive, setIsActive] = useState(false);

  const classes = useStyles();

  const toggleActive = e => {
    if (e.currentTarget.contains(e.target)) {
      // because click in popover will propagate to parent
      setIsActive(!isActive);
    }
  };

  const selection = field.selections[0];
  if (typeof selection.qTotal === 'undefined') {
    selection.qTotal = 0;
  }
  const counts = selection.qStateCounts || {
    qSelected: 0,
    qLocked: 0,
    qExcluded: 0,
    qLockedExcluded: 0,
    qSelectedExcluded: 0,
    qAlternative: 0,
  };
  const green = (counts.qSelected + counts.qLocked) / selection.qTotal;
  const white = counts.qAlternative / selection.qTotal;
  const grey = (counts.qExcluded + counts.qLockedExcluded + counts.qSelectedExcluded) / selection.qTotal;

  const numSelected = counts.qSelected + counts.qSelectedExcluded + counts.qLocked + counts.qLockedExcluded;
  // Maintain modal state in app selections
  const noSegments = numSelected === 0 && selection.qTotal === 0;
  let label = '&nbsp;'; // FIXME translate
  if (selection.qTotal === numSelected && selection.qTotal > 1) {
    label = translator.get('CurrentSelections.All');
  } else if (numSelected > 1 && selection.qTotal) {
    label = translator.get('CurrentSelections.Of', [numSelected, selection.qTotal]);
  } else if (noSegments) {
    label = translator.get('CurrentSelections.None');
  } else {
    label = selection.qSelectedFieldSelectionInfo.map(v => v.qName).join(', ');
  }
  if (field.states[0] !== '$') {
    label = `${field.states[0]}: ${label}`;
  }

  const segments = [
    { color: '#6CB33F', ratio: green },
    { color: '#D8D8D8', ratio: white },
    { color: '#B4B4B4', ratio: grey },
  ];
  segments.forEach((s, i) => {
    s.offset = i ? segments[i - 1].offset + segments[i - 1].ratio : 0; // eslint-disable-line
  });

  return (
    <Grid container spacing={0} ref={alignTo} className={classes.item} onClick={toggleActive}>
      <Grid item xs style={{ minWidth: 0, flexGrow: 1, opacity: selection.qLocked ? '0.3' : '' }}>
        <Typography noWrap style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 600 }}>
          {selection.qField}
        </Typography>
        <Typography noWrap style={{ fontSize: '12px', opacity: 0.55, lineHeight: '16px' }}>
          {label}
        </Typography>
      </Grid>
      {selection.qLocked ? (
        <Grid item>
          <IconButton>
            <Lock />
          </IconButton>
        </Grid>
      ) : (
        <Grid item>
          <IconButton
            title={translator.get('Selection.Clear')}
            onClick={e => {
              e.stopPropagation();
              api.clearField(selection.qField, field.states[0]);
            }}
            style={{ zIndex: 1 }}
          >
            <Remove />
          </IconButton>
        </Grid>
      )}
      <div
        style={{
          height: '4px',
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
        }}
      >
        {noSegments === false &&
          segments.map(s => (
            <div
              key={s.color}
              style={{
                position: 'absolute',
                background: s.color,
                height: '100%',
                top: 0,
                width: `${s.ratio * 100}%`,
                left: `${s.offset * 100}%`,
              }}
            />
          ))}
      </div>
      {isActive && (
        <ListBoxPopover
          alignTo={alignTo}
          show={isActive}
          close={() => setIsActive(false)}
          app={api.model}
          fieldName={selection.qField}
          stateName={field.states[0]}
        />
      )}
    </Grid>
  );
}
