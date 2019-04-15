import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  List,
  Icon,
} from 'react-leonardo-ui';

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

  useEffect(() => {
    app.createSessionObject({
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
    }).then((object) => {
      object.getLayout().then((layout) => {
        setFields(layout.qFieldList.qItems);
      });
    });
  }, []);

  return (
    <List>
      <List.Header>Fields</List.Header>
      {fields.map(Field)}
    </List>
  );
}
