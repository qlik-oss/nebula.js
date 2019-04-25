import React, {
  useContext,
} from 'react';

import {
  Popover,
  Input,
  List,
} from 'react-leonardo-ui';

import useModel from '@nebula.js/nucleus/src/hooks/useModel';
import useLayout from '@nebula.js/nucleus/src/hooks/useLayout';

import {
  Label,
} from '../ui-components';

import AppContext from '../contexts/AppContext';

const Field = ({ field, onSelect }) => (
  <List.Item onClick={() => onSelect(field.qName)} data-key={field.qName}>
    <List.Text>{field.qName}</List.Text>
  </List.Item>
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

  const onConfirm = (e) => {
    if (e.key === 'Enter') {
      onSelected({
        field: e.target.value,
      });
      close();
    }
  };

  const fields = layout ? (layout.qFieldList.qItems || []) : [];

  const onSelect = (s) => {
    onSelected({
      field: s,
    });
    close();
  };

  return (
    <Popover
      onOutside={close}
      alignTo={alignTo.current ? alignTo.current.element : null}
      show={show}
    >
      <Popover.Header>
        <Input onKeyPress={onConfirm} />
      </Popover.Header>
      <Popover.Body nopad>
        {fields.length > 0 && (
          <List>
            <Label>From a field</Label>
            {fields.map(field => <Field key={field.qName} field={field} onSelect={onSelect} />)}
          </List>
        )}
      </Popover.Body>
    </Popover>
  );
}
