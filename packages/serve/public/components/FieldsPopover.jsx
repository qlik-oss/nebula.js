import React, {
  useContext,
} from 'react';

import {
  Popover,
  Input,
  List,
} from 'react-leonardo-ui';

import {
  Label,
} from '../ui-components';

import AppContext from '../contexts/AppContext';


import useFields from '../hooks/useFields';

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
  const [fieldsLayout] = useFields(app);

  const onConfirm = (e) => {
    if (e.key === 'Enter') {
      onSelected({
        field: e.target.value,
      });
      close();
    }
  };

  const fields = fieldsLayout ? (fieldsLayout.qFieldList.qItems || []) : [];

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
