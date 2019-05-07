import React, {
  useCallback,
} from 'react';

import Lock from '@nebula.js/ui/icons/Lock';
import Unlock from '@nebula.js/ui/icons/Unlock';

import {
  IconButton,
  Popover,
  Grid,
} from '@nebula.js/ui/components';

import useModel from '../../hooks/useModel';
import useLayout from '../../hooks/useLayout';

import ListBox from './ListBox';

export default function ListBoxPopover({
  alignTo,
  show,
  close,
  app,
  fieldName,
  stateName = '$',
}) {
  const [model] = useModel({
    qInfo: {
      qType: 'dummy',
    },
    qListObjectDef: {
      qStateName: stateName,
      qShowAlternatives: true,
      qFrequencyMode: 'N',
      qReverseSort: false,
      qInitialDataFetch: [{
        qTop: 0, qLeft: 0, qHeight: 0, qWidth: 1,
      }],
      qDef: {
        qSortCriterias: [{
          qSortByExpression: 0,
          qSortByFrequency: 0,
          qSortByGreyness: 0,
          qSortByLoadOrder: 1,
          qSortByNumeric: 1,
          qSortByState: 1,
        }],
        qFieldDefs: [fieldName],
      },
    },
  }, app, fieldName, stateName);

  const lock = useCallback(() => {
    model.lock('/qListObjectDef');
  }, [model]);

  const unlock = useCallback(() => {
    model.unlock('/qListObjectDef');
  }, [model]);

  const [layout] = useLayout(model);

  const isLocked = layout ? layout.qListObject.qDimensionInfo.qLocked === true : false;

  const open = show && Boolean(alignTo.current);

  return (
    <Popover
      open={open}
      onClose={close}
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
        <Grid item xs>
          <ListBox model={model} />
        </Grid>
      </Grid>
    </Popover>
  );
}
