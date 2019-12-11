import React, { useContext, useCallback, useRef, useState } from 'react';

import Lock from '@nebula.js/ui/icons/lock';
import Unlock from '@nebula.js/ui/icons/unlock';

import { IconButton, Popover, Grid, MenuList } from '@material-ui/core';

import { more } from '@nebula.js/ui/icons/more';
import { useTheme } from '@nebula.js/ui/theme';
import useModel from '../../hooks/useModel';
import useLayout from '../../hooks/useLayoutStore';

import ListBox from './ListBox';
import createListboxSelectionToolbar from './listbox-selection-toolbar';

import { createObjectSelectionAPI } from '../../selections';
import SelectionToolbarWithDefault, { SelectionToolbar } from '../SelectionToolbar';

import LocaleContext from '../../contexts/LocaleContext';
import DirectionContext from '../../contexts/DirectionContext';

import ListBoxSearch from './ListBoxSearch';

export default function ListBoxPopover({ alignTo, show, close, app, fieldName, stateName = '$' }) {
  const theme = useTheme();
  const [model] = useModel(
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

  const [{ layout }] = useLayout(model);

  const translator = useContext(LocaleContext);
  const direction = useContext(DirectionContext);

  const moreAlignTo = useRef();
  const [showSelectionsMenu, setShowSelectionsMenu] = useState(false);

  if (!model || !layout || !translator) {
    return null;
  }

  const sel = createObjectSelectionAPI(model, app);
  sel.setLayout(layout);

  const isLocked = layout.qListObject.qDimensionInfo.qLocked === true;
  const open = show && Boolean(alignTo.current);

  if (open) {
    sel.goModal('/qListObjectDef');
  }
  const popoverClose = (e, reason) => {
    const accept = reason !== 'escapeKeyDown';
    sel.noModal(accept);
    close();
  };

  const listboxSelectionToolbarItems = createListboxSelectionToolbar({
    layout,
    model,
    translator,
    onSelected: () => setShowSelectionsMenu(false),
  });

  const moreItem = {
    key: 'more',
    type: 'icon-button',
    label: translator.get('Selection.Menu'),
    getSvgIconShape: more,
    enabled: () => isLocked,
    action: () => setShowSelectionsMenu(!showSelectionsMenu),
  };

  return (
    <Popover
      open={open}
      onClose={popoverClose}
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
      <Grid container direction="column" spacing={0}>
        <Grid item container style={{ padding: theme.spacing(1) }}>
          <Grid item>
            {isLocked ? (
              <IconButton onClick={unlock}>
                <Lock />
              </IconButton>
            ) : (
              <IconButton onClick={lock}>
                <Unlock />
              </IconButton>
            )}
          </Grid>
          <Grid item xs />
          <Grid item>
            <SelectionToolbarWithDefault
              layout={layout}
              api={sel}
              xItems={[moreItem]}
              onConfirm={popoverClose}
              onCancel={() => popoverClose(null, 'escapeKeyDown')}
            />
          </Grid>
        </Grid>
        <Grid item xs>
          <div ref={moreAlignTo} />
          <ListBoxSearch model={model} />
          <ListBox model={model} selections={sel} direction={direction} />
          {showSelectionsMenu && (
            <Popover
              open={showSelectionsMenu}
              anchorEl={moreAlignTo.current}
              getContentAnchorEl={null}
              container={moreAlignTo.current}
              disablePortal
              hideBackdrop
              style={{ pointerEvents: 'none' }}
              transitionDuration={0}
              elevation={0}
              PaperProps={{
                style: {
                  boxShadow: '0 12px 8px -8px rgba(0, 0, 0, 0.2)',
                  minWidth: '250px',
                  pointerEvents: 'auto',
                },
              }}
            >
              <MenuList>
                <SelectionToolbar layout={layout} items={listboxSelectionToolbarItems} />
              </MenuList>
            </Popover>
          )}
        </Grid>
      </Grid>
    </Popover>
  );
}
