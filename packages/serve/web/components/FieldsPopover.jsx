import React, {
  useContext,
} from 'react';

import {
  Popover,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
} from '@nebula.js/ui/components';

import useModel from '@nebula.js/nucleus/src/hooks/useModel';
import useLayout from '@nebula.js/nucleus/src/hooks/useLayout';


import AppContext from '../contexts/AppContext';

const Field = ({ field, onSelect }) => (
  <ListItem button onClick={() => onSelect(field.qName)} data-key={field.qName}>
    <ListItemText>{field.qName}</ListItemText>
  </ListItem>
);

export default function FieldsPopover({
  alignTo,
  show,
  close,
  onSelected,
}) {
  const app = useContext(AppContext);
  const [model] = useModel({
    qInfo: {
      qType: 'FieldList',
      qId: 'FieldList',
    },
    qFieldListDef: {
      qShowDerivedFelds: false,
      qShowHidden: false,
      qShowSemantic: true,
      qShowSrcTables: true,
      qShowSystem: false,
    },
  }, app);

  const [layout] = useLayout(model, app);

  const fields = layout ? (layout.qFieldList.qItems || []) : [];

  const onSelect = (s) => {
    onSelected({
      field: s,
    });
    close();
  };

  return (
    <Popover
      open={show}
      onClose={close}
      anchorEl={alignTo.current}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        style: { minWidth: '250px' },
      }}
    >
      {fields.length > 0 && (
        <List dense>
          <ListSubheader>Fields</ListSubheader>
          {fields.map(field => <Field key={field.qName} field={field} onSelect={onSelect} />)}
        </List>
      )}
    </Popover>
  );
}
