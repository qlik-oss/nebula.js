import React, { useRef, useState } from 'react';
import { Button, List, Icon } from 'react-leonardo-ui';

import {
  Toolbar,
  Grid,
  Label,
} from '../ui-components';

import FieldsPopover from './FieldsPopover';
import useProperties from '../hooks/useProperties';

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
      return dim.qDef.qFieldDefs[0];
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
      return m.qDef.qDef;
    },
    def(f) {
      return {
        qDef: {
          qDef: `avg(${f})`,
        },
      };
    },
  };

  const arr = properties.qHyperCubeDef[t.prop];

  const onAdd = () => {
    setIsActive(!isActive);
  };

  const onSelected = ({ field }) => {
    arr.push(t.def(field));
    model.setProperties(properties);
  };

  const onRemove = (idx) => {
    arr.splice(idx, 1);
    model.setProperties(properties);
  };

  return (
    <div>
      <Label weight="semibold">{t.label}</Label>
      <List>
        {arr.map((d, i) => (
          <List.Item>
            <List.Text>{t.title(d)}</List.Text>
            <List.Aside onClick={() => onRemove(i)}><Icon name="remove" /></List.Aside>
          </List.Item>
        ))}
      </List>
      <Grid>
        <Button
          onClick={onAdd}
          active={isActive}
          ref={btn}
        >
          {t.add}
        </Button>
      </Grid>
      {isActive && (
        <FieldsPopover
          alignTo={btn}
          show={isActive}
          close={() => setIsActive(false)}
          onSelected={onSelected}
        />
      )}
    </div>
  );
};

export default function Properties({
  model,
  sn,
}) {
  const [properties] = useProperties(model);

  if (!sn || !properties) {
    return null;
  }

  return (
    <div>
      <Toolbar>
        <Label weight="semibold">Properties</Label>
      </Toolbar>
      <Fields properties={properties} model={model} type="dimension" />
      <Fields properties={properties} model={model} type="measure" />
    </div>
  );
}
