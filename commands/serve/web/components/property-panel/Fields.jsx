import React, { useRef, useState, useContext } from 'react';

import {
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  // Divider,
  Typography,
} from '@material-ui/core';

import Remove from '@nebula.js/ui/icons/remove';

import useLibraryList from '../../hooks/useLibraryList';

import AppContext from '../../contexts/AppContext';
import FieldsPopover from '../FieldsPopover';

const FieldTitle = ({ field, libraryItems }) => {
  if (field.qLibraryId) {
    const f = libraryItems.filter((ff) => ff.qInfo.qId === field.qLibraryId)[0];
    return f ? f.qData.title : '!!!';
  }
  if (field.qDef && field.qDef.qFieldDefs) {
    return field.qDef.qFieldDefs[0];
  }
  if (field.qDef && field.qDef.qDef) {
    return field.qDef.qDef;
  }
  return '???';
};

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
  const app = useContext(AppContext);
  const [libraryItems] = useLibraryList(app, type);

  const onAdd = () => {
    setIsActive(!isActive);
  };

  const onSelected = (o) => {
    if (o.qId) {
      onAdded(o);
    } else if (o) {
      if (type === 'dimension') {
        onAdded(o.field);
      } else {
        onAdded(`${o.aggregation || 'sum'}([${o.field}])`);
      }
    }
  };

  const onRemove = (idx) => {
    onRemoved(idx);
  };

  return (
    <div>
      <Typography variant="overline">{label}</Typography>
      <List dense>
        {items.map((d, i) => (
          <ListItem disableGutters key={(d.qDef && d.qDef.cId) || i}>
            <ListItemText>
              <FieldTitle field={d} libraryItems={libraryItems} type={type} />
            </ListItemText>
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => onRemove(i)}>
                <Remove />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button variant="contained" fullWidth onClick={onAdd} ref={btn} disabled={!canAdd}>
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
