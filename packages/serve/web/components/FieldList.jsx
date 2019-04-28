import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  List,
  Icon,
} from 'react-leonardo-ui';

import useModel from '@nebula.js/nucleus/src/hooks/useModel';
import useLayout from '@nebula.js/nucleus/src/hooks/useLayout';

import AppContext from '../contexts/AppContext';

const Field = ({ qName }) => (
  <List.Item key={qName}>
    <List.Text>{qName}</List.Text>
    <List.Aside>
      <Icon name="draggable" />
    </List.Aside>
  </List.Item>
);

export default function FieldList() {
  const app = useContext(AppContext);
  const [fields, setFields] = useState([]);

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
  }, [app && app.id]);

  const [layout] = useLayout(model, app);

  useEffect(() => {
    setFields(layout.qFieldList.qItems);
  }, [layout]);

  return (
    <List>
      <List.Header>Fields</List.Header>
      {fields.map(Field)}
    </List>
  );
}
