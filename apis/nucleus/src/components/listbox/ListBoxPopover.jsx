import React, { useCallback } from 'react';

import Lock from '@nebula.js/ui/icons/lock';
import Unlock from '@nebula.js/ui/icons/unlock';

import { IconButton, Popover, Grid } from '@nebula.js/ui/components';

import useModel from '../../hooks/useModel';
import useLayout from '../../hooks/useLayout';

import ListBox from './ListBox';

import { createObjectSelectionAPI } from '../../selections';
import SelectionToolbar from '../SelectionToolbar';

export default function ListBoxPopover({ alignTo, show, close, app, fieldName, stateName = '$' }) {
  const [model] = useModel(
    {
      qInfo: {
        qType: 'dummy',
      },
      qListObjectDef: {
        qStateName: stateName,
        qShowAlternatives: true,
        qFrequencyMode: 'N',
        qReverseSort: false,
        qInitialDataFetch: [
          {
            qTop: 0,
            qLeft: 0,
            qHeight: 0,
            qWidth: 1,
          },
        ],
        qDef: {
          qSortCriterias: [
            {
              qSortByExpression: 0,
              qSortByFrequency: 0,
              qSortByGreyness: 0,
              qSortByLoadOrder: 1,
              qSortByNumeric: 1,
              qSortByState: 1,
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

  const [layout] = useLayout(model);

  if (!model || !layout) {
    return null;
  }

  const sel = createObjectSelectionAPI(model, app);
  sel.setLayout(layout);

  const isLocked = layout ? layout.qListObject.qDimensionInfo.qLocked === true : false;

  const open = show && Boolean(alignTo.current);

  if (open) {
    sel.goModal('/qListObjectDef');
  }
  const popoverClose = () => {
    sel.noModal(true);
    close();
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
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              {isLocked ? (
                <IconButton onClick={unlock}>
                  <Unlock />
                </IconButton>
              ) : (
                <IconButton onClick={lock}>
                  <Lock />
                </IconButton>
              )}
            </Grid>
            <Grid item>
              <SelectionToolbar api={sel} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs>
          <ListBox model={model} selections={sel} />
        </Grid>
      </Grid>
    </Popover>
  );
}
