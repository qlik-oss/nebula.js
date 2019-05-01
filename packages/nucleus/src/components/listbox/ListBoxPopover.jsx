import React, {
  useCallback,
} from 'react';

import Lock from '@nebula.js/ui/icons/Lock';
import Unlock from '@nebula.js/ui/icons/Unlock';
import ButtonInline from '@nebula.js/ui/components/ButtonInline';
import Popover from '@nebula.js/ui/components/popover';

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

  return (
    <Popover
      onOutside={close}
      alignTo={alignTo.current}
      show={alignTo.current && show}
    >
      <Popover.Header>
        {isLocked ? (
          <ButtonInline onClick={unlock}>
            <Unlock />
          </ButtonInline>
        ) : (
          <ButtonInline onClick={lock}>
            <Lock />
          </ButtonInline>
        )
      }
      </Popover.Header>
      <Popover.Body>
        <ListBox model={model} />
      </Popover.Body>
    </Popover>
  );
}
