import React, { useContext, useState, useMemo } from 'react';

import { Popover, List, ListSubheader, ListItem, ListItemText, ListItemIcon, Divider } from '@nebula.js/ui/components';

import { ChevronRight, ChevronLeft } from '@nebula.js/ui/icons';

import { useTheme } from '@nebula.js/ui/theme';

import useModel from '@nebula.js/nucleus/src/hooks/useModel';
import useLayout from '@nebula.js/nucleus/src/hooks/useLayout';
import useLibraryList from '../hooks/useLibraryList';

import AppContext from '../contexts/AppContext';

const Field = ({ field, onSelect, sub }) => (
  <ListItem button onClick={() => onSelect(field.qName)} data-key={field.qName}>
    <ListItemText>{field.qName}</ListItemText>
    {sub && <ChevronRight fontSize="small" />}
  </ListItem>
);

const LibraryItem = ({ item, onSelect }) => (
  <ListItem button onClick={() => onSelect(item.qInfo)} data-key={item.qInfo.qId}>
    <ListItemText>{item.qData.title}</ListItemText>
  </ListItem>
);

const Aggr = ({ aggr, field, onSelect }) => (
  <ListItem button onClick={() => onSelect(aggr)} data-key={aggr}>
    <ListItemText>{`${aggr}(${field})`}</ListItemText>
  </ListItem>
);

const LibraryList = ({ app, onSelect, title = '', type = 'dimension' }) => {
  const [libraryItems] = useLibraryList(app, type);
  const sortedLibraryItems = useMemo(
    () => libraryItems.slice().sort((a, b) => a.qData.title.toLowerCase().localeCompare(b.qData.title.toLowerCase())),
    [libraryItems]
  );

  return libraryItems.length > 0 ? (
    <>
      <ListSubheader component="div" style={{ backgroundColor: 'inherit' }}>
        {title}
      </ListSubheader>
      {sortedLibraryItems.map(item => (
        <LibraryItem key={item.qInfo.qId} item={item} onSelect={onSelect} />
      ))}
    </>
  ) : null;
};

export default function FieldsPopover({ alignTo, show, close, onSelected, type }) {
  const app = useContext(AppContext);
  const [selectedField, setSelectedField] = useState(null);
  const theme = useTheme();
  const [model] = useModel(
    {
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
    },
    app
  );

  const [layout] = useLayout(model, app);

  const fields = useMemo(
    () =>
      (layout ? layout.qFieldList.qItems || [] : [])
        .slice()
        .sort((a, b) => a.qName.toLowerCase().localeCompare(b.qName.toLowerCase())),
    [layout]
  );

  const onSelect = s => {
    if (s && s.qId) {
      onSelected(s);
      close();
    } else if (type === 'measure') {
      setSelectedField(s);
    } else {
      onSelected({
        field: s,
      });
      close();
    }
  };

  const onAggregateSelected = s => {
    onSelected({
      field: selectedField,
      aggregation: s,
    });
    close();
  };

  return (
    <Popover
      open={show}
      onClose={close}
      anchorEl={alignTo.current}
      marginThreshold={theme.spacing(1)}
      elevation={3}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        style: { minWidth: '250px', maxHeight: '300px', background: theme.palette.background.lightest },
      }}
    >
      {selectedField && (
        <List dense component="nav">
          <ListItem button onClick={() => setSelectedField(null)}>
            <ListItemIcon>
              <ChevronLeft />
            </ListItemIcon>
            <ListItemText>Back</ListItemText>
          </ListItem>
          <Divider />
          <ListSubheader component="div">Aggregation</ListSubheader>
          {['sum', 'count', 'avg', 'min', 'max'].map(v => (
            <Aggr key={v} aggr={v} field={selectedField} onSelect={onAggregateSelected} />
          ))}
        </List>
      )}
      {!selectedField && fields.length > 0 && (
        <List dense component="nav" style={{ background: theme.palette.background.lightest }}>
          <LibraryList
            app={app}
            onSelect={onSelect}
            type={type}
            title={type === 'measure' ? 'Measures' : 'Dimensions'}
          />
          <ListSubheader component="div" style={{ backgroundColor: 'inherit' }}>
            Fields
          </ListSubheader>
          {fields.map(field => (
            <Field key={field.qName} field={field} onSelect={onSelect} sub={type === 'measure'} />
          ))}
        </List>
      )}
    </Popover>
  );
}
