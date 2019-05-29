import React, { useRef, useState } from 'react';

import {
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  // Divider,
  Typography,
} from '@nebula.js/ui/components';

import Remove from '@nebula.js/ui/icons/Remove';

import FieldsPopover from '../FieldsPopover';

export default function Fields({
  items,
  type = 'dimension',
  label = '',
  addLabel = 'Add',
  onAdded,
  onRemoved,
  canAdd = true,
}) {
  const [isActive, setIsActive] = useState(false);
  const btn = useRef(null);

  const t = type === 'dimension' ? {
    title(dim) {
      // TODO - get library item
      return dim.qLibraryId || dim.qDef.qFieldDefs[0];
    },
    def(f) {
      return f;
    },
  } : {
    title(m) {
      return m.qLibraryId || m.qDef.qDef;
    },
    def(f, aggr = 'sum') {
      return `${aggr}([${f}])`;
    },
  };

  // const arr = hc[t.prop];

  const onAdd = () => {
    setIsActive(!isActive);
  };

  const onSelected = ({ field, aggregation }) => {
    // arr.push(t.def(field, aggr));
    // model.setProperties(properties);
    onAdded(t.def(field, aggregation));
  };

  const onRemove = (idx) => {
    // arr.splice(idx, 1);
    // model.setProperties(properties);
    onRemoved(idx);
  };

  return (
    <div>
      <Typography variant="overline">{label}</Typography>
      <List dense>
        {items.map((d, i) => (
          <ListItem disableGutters key={d.qDef.cId}>
            <ListItemText>{t.title(d)}</ListItemText>
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => onRemove(i)}><Remove /></IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button
        variant="outlined"
        fullWidth
        onClick={onAdd}
        ref={btn}
        disabled={!canAdd}
      >
        {addLabel}
      </Button>
      {isActive && (
        <FieldsPopover
          alignTo={btn}
          show={isActive}
          close={() => setIsActive(false)}
          onSelected={onSelected}
          type={type}
        />
      )}
    </div>
  );
}
