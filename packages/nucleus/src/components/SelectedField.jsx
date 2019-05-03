import React, {
  useRef,
  useState,
  useMemo,
} from 'react';

import Remove from '@nebula.js/ui/icons/Remove';
import Lock from '@nebula.js/ui/icons/Lock';
import themes from '@nebula.js/ui/theme';

import ButtonInline from '@nebula.js/ui/components/ButtonInline';
import Grid from '@nebula.js/ui/components/Grid';
import Text from '@nebula.js/ui/components/Text';

import ListBoxPopover from './listbox/ListBoxPopover';

export default function SelectedField({
  field,
  api,
  theme = themes('light'),
}) {
  const alignTo = useRef();
  const [isActive, setIsActive] = useState(false);

  const classes = useMemo(() => theme.style({
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    cursor: 'pointer',
    '&:hover': {
      background: '$palette.background.hover',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: 'inset 0 0 0 2px $bluePale',
    },
  }), [theme]);

  const toggleActive = () => setIsActive(!isActive);
  const keyToggleActive = e => e.key === ' ' && setIsActive(!isActive);

  const selection = field.selections[0];
  const counts = selection.qStateCounts;
  const green = (counts.qSelected + counts.qLocked) / selection.qTotal;
  const white = counts.qAlternative / selection.qTotal;
  const grey = (counts.qExcluded + counts.qLockedExcluded + counts.qSelectedExcluded) / selection.qTotal;

  const numSelected = counts.qSelected + counts.qSelectedExcluded + counts.qLocked + counts.qLockedExcluded;
  let label = '&nbsp;'; // FIXME translate
  if (selection.qTotal === numSelected && selection.qTotal > 1) {
    label = 'All';
  } else if (numSelected > 1 && selection.qTotal) {
    label = `${numSelected} of ${selection.qTotal}`;
  } else {
    label = selection.qSelectedFieldSelectionInfo.map(v => v.qName).join(', ');
  }
  if (field.states[0] !== '$') {
    label = `${field.states[0]}: ${label}`;
  }

  return (
    <Grid
      spacing="small"
      styled={{
        position: 'relative',
        width: '148px',
        justifyContent: 'space-between',
        background: '$palette.background.default',
        borderRight: '1px solid $palette.divider',
      }}
    >
      <Grid
        vertical
        spacing="small"
        style={{ alignItems: 'normal', overflow: 'hidden', opacity: selection.qLocked ? '0.3' : '' }}
      >
        <Text size="small" weight="semibold" nowrap>{selection.qField}</Text>
        <Text size="small" faded nowrap>{label}</Text>
      </Grid>
      <div
        role="button"
        ref={alignTo}
        className={classes}
        onClick={toggleActive}
        onKeyDown={keyToggleActive}
        tabIndex="0"
      />
      {selection.qLocked ? (<Grid><Lock /></Grid>) : (
        <Grid spacing="none">
          <ButtonInline
            onClick={(e) => { e.stopPropagation(); api.clearField(selection.qField, field.states[0]); }}
            style={{ zIndex: 1 }}
          >
            <Remove />
          </ButtonInline>
        </Grid>
      )}
      <Grid
        spacing="none"
        style={{
          height: '4px',
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
        }}
      >
        <div style={{ background: '#6CB33F', height: '100%', width: `${green * 100}%` }} />
        <div style={{ background: '#D8D8D8', height: '100%', width: `${white * 100}%` }} />
        <div style={{ background: '#B4B4B4', height: '100%', width: `${grey * 100}%` }} />
      </Grid>
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
