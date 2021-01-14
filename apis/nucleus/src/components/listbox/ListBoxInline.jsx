import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
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

export default function ListBoxPortal({ app, fieldIdentifier, stateName, element, options }) {
  return ReactDOM.createPortal(
    <ListBoxInline app={app} fieldIdentifier={fieldIdentifier} stateName={stateName} options={options} />,
    element
  );
}

export function ListBoxInline({ app, fieldIdentifier, stateName = '$', options = {} }) {
  const { title, direction, listLayout, search = true } = options;
  const listdef = {
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
      },
    },
    title,
  };

  let fieldName;

  // Something something lib dimension
  if (fieldIdentifier.qLibraryId) {
    listdef.qListObjectDef.qLibraryId = fieldIdentifier.qLibraryId;
    fieldName = fieldIdentifier.qLibraryId;
  } else {
    listdef.qListObjectDef.qDef.qFieldDefs = [fieldIdentifier];
    fieldName = fieldIdentifier;
  }

  const theme = useTheme();
  const [model] = useSessionModel(listdef, app, fieldName, stateName);

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
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    if (selections) {
      if (!selections.isModal(model)) {
        selections.goModal('/qListObjectDef');
        selections.on('deactivated', () => {
          setShowToolbar(false);
        });
        selections.on('activated', () => {
          setShowToolbar(true);
        });
      }
    }
  }, [selections]);

  useEffect(() => {
    if (selections) {
      setShowToolbar(selections.isActive());
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

  const minHeight = 49 + (search ? 40 : 0) + 49;

  return (
    <Grid container direction="column" spacing={0} style={{ height: '100%', minHeight: `${minHeight}px` }}>
      <Grid item container style={{ padding: theme.spacing(1), borderBottom: `1px solid ${theme.palette.divider}` }}>
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
              {layout.title || layout.qListObject.qDimensionInfo.qFallbackTitle}
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
              show: showToolbar,
              api: selections,
              onConfirm: () => {},
              onCancel: () => {},
            }}
          />
        </Grid>
      </Grid>
      {search ? (
        <Grid item>
          <ListBoxSearch model={model} />
        </Grid>
      ) : (
        ''
      )}
      <Grid item xs>
        <div ref={moreAlignTo} />
        <AutoSizer>
          {({ height, width }) => (
            <ListBox
              model={model}
              selections={selections}
              direction={direction}
              listLayout={listLayout}
              height={height}
              width={width}
            />
          )}
        </AutoSizer>
      </Grid>
    </Grid>
  );
}
