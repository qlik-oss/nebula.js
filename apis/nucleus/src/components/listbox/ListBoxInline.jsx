import React, { useContext, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AutoSizer from 'react-virtualized-auto-sizer';

import Lock from '@nebula.js/ui/icons/lock';
import Unlock from '@nebula.js/ui/icons/unlock';

import { IconButton, Grid, Typography } from '@material-ui/core';

import { useTheme } from '@nebula.js/ui/theme';
import useSessionModel from '../../hooks/useSessionModel';
import useLayout from '../../hooks/useLayout';

import ListBox from './ListBox';
import createListboxSelectionToolbar from './listbox-selection-toolbar';

import ActionsToolbar from '../ActionsToolbar';

import InstanceContext from '../../contexts/InstanceContext';

import ListBoxSearch from './ListBoxSearch';
import useObjectSelections from '../../hooks/useObjectSelections';

export default function ListBoxPortal({ app, fieldName, stateName, element, options }) {
  return ReactDOM.createPortal(
    <ListBoxInline app={app} fieldName={fieldName} stateName={stateName} options={options} />,
    element
  );
}

export function ListBoxInline({ app, fieldName, stateName = '$', options = {} }) {
  const theme = useTheme();
  const { title } = options;
  const [model] = useSessionModel(
    {
      qInfo: {
        qType: 'njsListbox',
      },
      qListObjectDef: {
        qStateName: stateName,
        qShowAlternatives: true,
        qInitialDataFetch: [
          {
            qTop: 0,
            qLeft: 0,
            qWidth: 0,
            qHeight: 0,
          },
        ],
        qDef: {
          qSortCriterias: [
            {
              qSortByState: 1,
              qSortByAscii: 1,
              qSortByNumeric: 1,
              qSortByLoadOrder: 1,
            },
          ],
          qFieldDefs: [fieldName],
        },
      },
    },
    app,
    fieldName,
    title,
    stateName
  );

  const lock = useCallback(() => {
    model.lock('/qListObjectDef');
  }, [model]);

  const unlock = useCallback(() => {
    model.unlock('/qListObjectDef');
  }, [model]);

  const { translator } = useContext(InstanceContext);
  const moreAlignTo = useRef();
  const [selections] = useObjectSelections(app, model);
  const [layout] = useLayout(model);

  useEffect(() => {
    if (selections) {
      if (!selections.isModal(model)) {
        selections.goModal('/qListObjectDef');
      }
    }
  }, [selections]);

  if (!model || !layout || !translator) {
    return null;
  }

  const isLocked = layout.qListObject.qDimensionInfo.qLocked === true;

  const listboxSelectionToolbarItems = createListboxSelectionToolbar({
    layout,
    model,
    translator,
  });

  const counts = layout.qListObject.qDimensionInfo.qStateCounts;

  const hasSelections = counts.qSelected + counts.qSelectedExcluded + counts.qLocked + counts.qLockedExcluded > 0;

  const showTitle = true;

  return (
    <Grid container direction="column" spacing={0} style={{ height: '100%' }}>
      <Grid item container style={{ padding: theme.spacing(1) }}>
        <Grid item>
          {isLocked ? (
            <IconButton onClick={unlock} disabled={!isLocked}>
              <Lock />
            </IconButton>
          ) : (
            <IconButton onClick={lock} disabled={!hasSelections}>
              <Unlock />
            </IconButton>
          )}
        </Grid>
        <Grid item>
          {showTitle && (
            <Typography variant="h6" noWrap>
              {layout.title || fieldName}
            </Typography>
          )}
        </Grid>
        <Grid item xs />
        <Grid item>
          <ActionsToolbar
            more={{
              enabled: !isLocked,
              actions: listboxSelectionToolbarItems,
              alignTo: moreAlignTo,
              popoverProps: {
                elevation: 0,
              },
              popoverPaperStyle: {
                boxShadow: '0 12px 8px -8px rgba(0, 0, 0, 0.2)',
                minWidth: '250px',
              },
            }}
            selections={{
              show: selections.isActive(),
              api: selections,
              onConfirm: () => {},
              onCancel: () => {},
            }}
          />
        </Grid>
      </Grid>
      <Grid item>
        <ListBoxSearch model={model} />
      </Grid>
      <Grid item xs style={{ height: 'calc(100% - 32px)' }}>
        <div ref={moreAlignTo} />
        <AutoSizer disableWidth>
          {({ height }) => <ListBox model={model} selections={selections} direction="ltr" height={height} />}
        </AutoSizer>
      </Grid>
    </Grid>
  );
}
