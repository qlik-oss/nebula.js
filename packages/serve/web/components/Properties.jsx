import React, { useRef, useState } from 'react';

import {
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Typography,
} from '@nebula.js/ui/components';

import Remove from '@nebula.js/ui/icons/Remove';

import useProperties from '@nebula.js/nucleus/src/hooks/useProperties';

import FieldsPopover from './FieldsPopover';

const Fields = ({
  model,
  properties,
  type = 'dimension',
}) => {
  const [isActive, setIsActive] = useState(false);
  const btn = useRef(null);

  const t = type === 'dimension' ? {
    prop: 'qDimensions',
    label: 'Dimensions',
    add: 'Add dimension',
    title(dim) {
      // TODO - get library item
      return dim.qLibraryId || dim.qDef.qFieldDefs[0];
    },
    def(f) {
      return {
        qDef: {
          qFieldDefs: [f],
        },
      };
    },
  } : {
    prop: 'qMeasures',
    label: 'Measures',
    add: 'Add measure',
    title(m) {
      return m.qLibraryId || m.qDef.qDef;
    },
    def(f, aggr = 'sum') {
      return {
        qDef: {
          qDef: `${aggr}([${f}])`,
        },
      };
    },
  };

  const arr = properties.qHyperCubeDef[t.prop];

  const onAdd = () => {
    setIsActive(!isActive);
  };

  const onSelected = ({ field, aggr }) => {
    arr.push(t.def(field, aggr));
    model.setProperties(properties);
  };

  const onRemove = (idx) => {
    arr.splice(idx, 1);
    model.setProperties(properties);
  };

  return (
    <div>
      <Typography variant="overline">{t.label}</Typography>
      <List dense>
        {arr.map((d, i) => (
          <ListItem disableGutters>
            <ListItemText>{t.title(d)}</ListItemText>
            <ListItemSecondaryAction>
              <IconButton onClick={() => onRemove(i)}><Remove /></IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button
        variant="outlined"
        fullWidth
        onClick={onAdd}
        ref={btn}
      >
        {t.add}
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
};

export default function Properties({
  viz,
  sn,
}) {
  const [properties] = useProperties(viz ? viz.model : null);

  if (!sn) {
    return null;
  }

  if (!viz || !properties) {
    return (
      <div style={{
        minWidth: '250px',
        padding: '8px',
      }}
      >
        <Typography>Nothing selected</Typography>
      </div>
    );
  }

  return (
    <div style={{
      minWidth: '250px',
      padding: '8px',
    }}
    >
      <Fields properties={properties} model={viz.model} type="dimension" />
      <Divider />
      <Fields properties={properties} model={viz.model} type="measure" />
    </div>
  );
}
