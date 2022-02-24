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

import ListBoxToggleButton from './ListBoxToggleButton/ListBoxToggleButton';

export default function ListBoxPortal({ app, fieldIdentifier, stateName, element, options }) {
  return ReactDOM.createPortal(
    <ListBoxInline app={app} fieldIdentifier={fieldIdentifier} stateName={stateName} options={options} />,
    element
  );
}

const switchButtonConfig = {
  option: 'checkboxes',
  invert: true,
  label: 'Associative',
  helperText: 'Response times may be affected by turning on Associative.',
  startOn: false,
  iconOn: {
    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 16 16"><path fill="${encodeURIComponent(
      'rgb(0 0 0 / 0.30)'
    )}" d="M12.5,0 C14.4,0 16,1.6 16,3.5 C16,5.4 14.4,7 12.5,7 C11.8,7 11.2,6.8 10.6,6.4 L9.8,7.2 C9.9,7.5 10,7.7 10,8 C10,9.1 9.1,10 8,10 C7.7,10 7.5,9.9 7.2,9.8 L6.4,10.6 C6.8,11.2 7,11.8 7,12.5 C7,14.4 5.4,16 3.5,16 C1.6,16 0,14.4 0,12.5 C0,10.6 1.6,9 3.5,9 C4.2,9 4.8,9.2 5.4,9.6 L6.2,8.8 C6.1,8.5 6,8.3 6,8 C6,6.9 6.9,6 8,6 C8.3,6 8.5,6.1 8.8,6.2 L9.6,5.4 C9.2,4.8 9,4.2 9,3.5 C9,1.6 10.6,0 12.5,0 Z M4.9,13.9 C5.3,13.5 5.5,13 5.5,12.5 C5.5,12 5.3,11.5 4.9,11.1 C4.5,10.7 4,10.5 3.5,10.5 C3,10.5 2.5,10.7 2.1,11.1 C1.7,11.5 1.5,12 1.5,12.5 C1.5,13 1.7,13.5 2.1,13.9 C2.5,14.3 3,14.5 3.5,14.5 C4,14.5 4.5,14.3 4.9,13.9 Z M13.9,4.9 C14.3,4.5 14.5,4 14.5,3.5 C14.5,3 14.3,2.5 13.9,2.1 C13.5,1.7 13,1.5 12.5,1.5 C12,1.5 11.5,1.7 11.1,2.1 C10.7,2.5 10.5,3 10.5,3.5 C10.5,4 10.7,4.5 11.1,4.9 C11.5,5.3 12,5.5 12.5,5.5 C13,5.5 13.5,5.3 13.9,4.9 Z"/></svg>')`,
    left: 15,
    top: 8,
    transform: 'rotate(90deg) scale(0.7)',
  },
  iconOff: {
    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 16 16"><path fill="${encodeURIComponent(
      '#FFFFFF'
    )}" d="M12.5,0 C14.4,0 16,1.6 16,3.5 C16,5.4 14.4,7 12.5,7 C11.8,7 11.2,6.8 10.6,6.4 L9.8,7.2 C9.9,7.5 10,7.7 10,8 C10,9.1 9.1,10 8,10 C7.7,10 7.5,9.9 7.2,9.8 L6.4,10.6 C6.8,11.2 7,11.8 7,12.5 C7,14.4 5.4,16 3.5,16 C1.6,16 0,14.4 0,12.5 C0,10.6 1.6,9 3.5,9 C4.2,9 4.8,9.2 5.4,9.6 L6.2,8.8 C6.1,8.5 6,8.3 6,8 C6,6.9 6.9,6 8,6 C8.3,6 8.5,6.1 8.8,6.2 L9.6,5.4 C9.2,4.8 9,4.2 9,3.5 C9,1.6 10.6,0 12.5,0 Z M4.9,13.9 C5.3,13.5 5.5,13 5.5,12.5 C5.5,12 5.3,11.5 4.9,11.1 C4.5,10.7 4,10.5 3.5,10.5 C3,10.5 2.5,10.7 2.1,11.1 C1.7,11.5 1.5,12 1.5,12.5 C1.5,13 1.7,13.5 2.1,13.9 C2.5,14.3 3,14.5 3.5,14.5 C4,14.5 4.5,14.3 4.9,13.9 Z M13.9,4.9 C14.3,4.5 14.5,4 14.5,3.5 C14.5,3 14.3,2.5 13.9,2.1 C13.5,1.7 13,1.5 12.5,1.5 C12,1.5 11.5,1.7 11.1,2.1 C10.7,2.5 10.5,3 10.5,3.5 C10.5,4 10.7,4.5 11.1,4.9 C11.5,5.3 12,5.5 12.5,5.5 C13,5.5 13.5,5.3 13.9,4.9 Z"/></svg>')`,
    right: 15,
    top: 8,
    transform: 'rotate(90deg) scale(0.7)',
  },
  // onChange: (on, { setOptions }) => {
  //   setOptions({ checkboxes: !on });
  // },
};

export function ListBoxInline({ app, fieldIdentifier, stateName = '$', options = {} }) {
  const [opts, setOpts] = useState({ ...options });
  const setOptions = (overrides) => {
    setOpts((o) => {
      const allowedOpts = ['checkboxes']; // Object.keys(o);
      const disallowed = [];
      const validOverrides = Object.fromEntries(
        Object.entries(overrides).filter(([ovKey]) => {
          const allowed = allowedOpts.includes(ovKey);
          if (!allowed) {
            disallowed.push(ovKey);
          }
          return allowed;
        })
      );
      if (disallowed.length) {
        throw new Error(`Not allowed setting these Listbox option(s) ${disallowed.join(', ')}`);
      }
      return { ...o, ...validOverrides };
    });
  };

  const {
    title,
    direction,
    listLayout,
    search = true,
    toolbar = true,
    rangeSelect = true,
    checkboxes = false,
    // checkboxFieldSwitch = false,
    switchButton = switchButtonConfig,
    // switchButton = false,
    properties = {},
    sessionModel = undefined,
    selectionsApi = undefined,
    update = undefined,
  } = opts;

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
    ...properties,
  };

  // Something something lib dimension
  let fieldName;
  if (fieldIdentifier.qLibraryId) {
    listdef.qListObjectDef.qLibraryId = fieldIdentifier.qLibraryId;
    fieldName = fieldIdentifier.qLibraryId;
  } else {
    listdef.qListObjectDef.qDef.qFieldDefs = [fieldIdentifier];
    fieldName = fieldIdentifier;
  }

  let [model] = useSessionModel(listdef, sessionModel ? null : app, fieldName, stateName);
  if (sessionModel) {
    model = sessionModel;
  }

  let selections = useObjectSelections(selectionsApi ? {} : app, model)[0];
  if (selectionsApi) {
    selections = selectionsApi;
  }

  const theme = useTheme();

  const lock = useCallback(() => {
    model.lock('/qListObjectDef');
  }, [model]);

  const unlock = useCallback(() => {
    model.unlock('/qListObjectDef');
  }, [model]);

  const onSwitchButtonChange = useCallback(
    (on) => {
      if (switchButton.option) {
        setOptions({ [switchButton.option]: switchButton.invert ? !on : on });
      }
      if (switchButton.onChange) {
        switchButton.onChange(on, { setOptions });
      }
    },
    [switchButton, setOptions]
  );

  const { translator } = useContext(InstanceContext);
  const moreAlignTo = useRef();

  const [layout] = useLayout(model);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    if (selections) {
      if (!selections.isModal(model)) {
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

  const listboxSelectionToolbarItems = toolbar
    ? createListboxSelectionToolbar({
        layout,
        model,
        translator,
      })
    : [];

  const counts = layout.qListObject.qDimensionInfo.qStateCounts;

  const hasSelections = counts.qSelected + counts.qSelectedExcluded + counts.qLocked + counts.qLockedExcluded > 0;

  const showTitle = true;

  const minHeight = 49 + (search ? 40 : 0) + 49;

  return (
    <Grid container direction="column" spacing={0} style={{ height: '100%', minHeight: `${minHeight}px` }}>
      {toolbar && (
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
      )}
      {switchButton ? (
        <ListBoxToggleButton
          label={switchButton.label}
          helperText={switchButton.helperText}
          startOn={switchButton.startOn}
          onChange={onSwitchButtonChange}
          styling={{
            iconOn: switchButton.iconOn,
            iconOff: switchButton.iconOff,
          }}
        />
      ) : (
        ''
      )}
      {search ? (
        <Grid item>
          <ListBoxSearch model={model} autoFocus={false} />
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
              rangeSelect={rangeSelect}
              checkboxes={checkboxes}
              height={height}
              width={width}
              update={update}
            />
          )}
        </AutoSizer>
      </Grid>
    </Grid>
  );
}
