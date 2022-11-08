import React, { useContext, useCallback, useRef, useEffect } from 'react';

import Lock from '@nebula.js/ui/icons/lock';
import Unlock from '@nebula.js/ui/icons/unlock';

import { IconButton, Popover, Grid } from '@mui/material';

import { useTheme } from '@nebula.js/ui/theme';
import useSessionModel from '../../hooks/useSessionModel';
import useLayout from '../../hooks/useLayout';

import ListBox from './ListBox';
import createListboxSelectionToolbar from './interactions/listbox-selection-toolbar';

import ActionsToolbar from '../ActionsToolbar';

import InstanceContext from '../../contexts/InstanceContext';

import ListBoxSearch from './components/ListBoxSearch';
import useObjectSelections from '../../hooks/useObjectSelections';
import getHasSelections from './assets/has-selections';

export default function ListBoxPopover({ alignTo, show, close, app, fieldName, stateName = '$' }) {
  const open = show && Boolean(alignTo.current);
  const theme = useTheme();
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
  const popoverRef = useRef();
  const [selections] = useObjectSelections(app, model, [popoverRef]);
  const [layout] = useLayout(model);

  useEffect(() => {
    if (selections && open) {
      if (!selections.isModal(model)) {
        selections.goModal('/qListObjectDef');
      }
    }
  }, [selections, open]);

  if (!model || !layout || !translator) {
    return null;
  }

  const isLocked = layout.qListObject.qDimensionInfo.qLocked === true;

  const popoverClose = (e, reason) => {
    const accept = reason !== 'escapeKeyDown';
    selections.noModal(accept);
    close();
  };

  const listboxSelectionToolbarItems = createListboxSelectionToolbar({
    layout,
    model,
    translator,
  });

  const hasSelections = getHasSelections(layout);

  return (
    <Popover
      open={open}
      onClose={popoverClose}
      ref={popoverRef}
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
      <Grid container direction="column" gap={0}>
        <Grid item container style={{ padding: theme.spacing(1) }}>
          <Grid item>
            {isLocked ? (
              <IconButton onClick={unlock} disabled={!isLocked} size="large">
                <Lock title={translator.get('Listbox.Unlock')} />
              </IconButton>
            ) : (
              <IconButton onClick={lock} disabled={!hasSelections} size="large">
                <Unlock title={translator.get('Listbox.Lock')} />
              </IconButton>
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
                show: true,
                api: selections,
                onConfirm: popoverClose,
                onCancel: () => popoverClose(null, 'escapeKeyDown'),
              }}
            />
          </Grid>
        </Grid>
        <Grid item xs>
          <div ref={moreAlignTo} />
          <ListBoxSearch selections={selections} model={model} visible />
          <ListBox model={model} selections={selections} direction="ltr" />
        </Grid>
      </Grid>
    </Popover>
  );
}
