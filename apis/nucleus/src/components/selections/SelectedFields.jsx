import React, { useEffect, useState, useContext } from 'react';

import { Grid } from '@mui/material';

import { useTheme } from '@nebula.js/ui/theme';
import useCurrentSelectionsModel from '../../hooks/useCurrentSelectionsModel';
import useLayout from '../../hooks/useLayout';
import useRect from '../../hooks/useRect';
import InstanceContext from '../../contexts/InstanceContext';
import useSingleObject from './hooks/useSingleObject';
import useSingleObjectProps from './hooks/useSingleObjectProps';
import useModel from '../../hooks/useModel';
import useFieldList from './hooks/useFieldList';
import useDimensionList from './hooks/useDimenisonList';
import { sortAllFields, sortSelections } from './utils';

import OneField from './OneField';
import MultiState from './MultiState';
import More from './More';

const MIN_WIDTH = 120;
const MIN_WIDTH_MORE = 72;

function getItems(layout) {
  if (!layout) {
    return [];
  }
  const fields = {};

  // There is one qSelectionObject for the default state $,
  // and an array of one qSelectionObject for each alternate state.
  function collectFields(qSelectionObject, state) {
    qSelectionObject.qSelections.forEach((selection) => {
      const name = selection.qField;
      let currentField = fields[name];
      if (currentField === undefined) {
        currentField = {
          name,
          label:
            selection.qDimensionReferences?.find((element) => element.qLabel)?.qLabel ||
            selection.qReadableName ||
            name,
          states: [],
          selections: [],
        };
        fields[name] = currentField;
      }
      currentField.states.push(state);
      currentField.selections.push(selection);
    });
  }
  if (layout.qSelectionObject) {
    collectFields(layout.qSelectionObject, '$');
  }
  if (layout.alternateStates) {
    layout.alternateStates.forEach((s) => collectFields(s.qSelectionObject, s.stateName));
  }
  return Object.keys(fields)
    .map((key) => fields[key])
    .filter((f) => !f.selections.some((s) => s.qIsHidden));
}

export default function SelectedFields({ api, app, halo }) {
  const theme = useTheme();
  const [currentSelectionsModel] = useCurrentSelectionsModel(app);
  const [layout] = useLayout(currentSelectionsModel);
  const [fieldModel] = useModel(app, 'FieldList');
  const [fieldList] = useFieldList(fieldModel);
  const [masterDimModel] = useModel(app, 'DimensionList');
  const [masterDimList] = useDimensionList(masterDimModel);
  const [singleObjectModel] = useSingleObject(app);
  const [singleObjectProps] = useSingleObjectProps(singleObjectModel);
  const [state, setState] = useState({ items: [], more: [] });

  const { modalObjectStore } = useContext(InstanceContext).selectionStore;
  const [containerRef, containerRect] = useRect();
  const [maxItems, setMaxItems] = useState(0);
  const flags = halo.public.galaxy?.flags;
  const isPinFieldEnabled = flags?.isEnabled('TLV_1394_PIN_FIELD_TO_TOOLBAR');
  const isRefactoringEnabled = flags?.isEnabled('TLV_1394_REFACTORING_SELECTIONS');

  const isInListboxPopover = () => {
    const { model } = modalObjectStore.get(app.id) || {};
    return model?.genericType === 'njsListbox';
  };

  useEffect(() => {
    if (!containerRect) return;
    const { width } = containerRect;
    const maxWidth = Math.floor(width) - MIN_WIDTH_MORE;
    const items = Math.floor(maxWidth / MIN_WIDTH);
    setMaxItems(items);
  }, [containerRect]);

  useEffect(() => {
    if (!app || !currentSelectionsModel || !layout || !maxItems || !fieldList || !masterDimList) {
      return;
    }
    let items = isRefactoringEnabled ? getItems(layout).sort(sortSelections) : getItems(layout);
    if (isPinFieldEnabled) {
      const pinnedItems = singleObjectProps?.pinnedItems || [];
      items = sortAllFields(fieldList, pinnedItems, items, masterDimList);
    }
    setState((currState) => {
      const newItems = items;
      // Maintain modal state in app selections
      if (isInListboxPopover() && newItems.length + 1 === currState.items.length) {
        const lastDeselectedField = currState.items.filter(
          (f1) => newItems.some((f2) => f1.name === f2.name) === false
        )[0];
        if (!isPinFieldEnabled || (lastDeselectedField && !lastDeselectedField.isPinned)) {
          const { qField } = lastDeselectedField.selections[0];
          lastDeselectedField.selections = [{ qField }];
          const wasIx = currState.items.indexOf(lastDeselectedField);
          newItems.splice(wasIx, 0, lastDeselectedField);
        }
      }
      let newMoreItems = [];
      if (maxItems < newItems.length) {
        if (isRefactoringEnabled) {
          newMoreItems = newItems.splice(0, newItems.length - maxItems);
        } else {
          newMoreItems = newItems.splice(maxItems - newItems.length);
        }
      }
      return {
        items: newItems,
        more: newMoreItems,
      };
    });
  }, [
    app,
    currentSelectionsModel,
    layout,
    api.isInModal(),
    maxItems,
    singleObjectProps,
    masterDimList,
    fieldList,
    isPinFieldEnabled,
  ]);

  return (
    <Grid ref={containerRef} container gap={0} wrap="nowrap" style={{ height: '100%' }}>
      {isRefactoringEnabled && state.more.length > 0 && (
        <Grid
          item
          style={{
            position: 'relative',
            maxWidth: '98px',
            minWidth: `${MIN_WIDTH_MORE}px`,
            background: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <More items={state.more} api={api} isPinFieldEnabled={isPinFieldEnabled} />
        </Grid>
      )}
      {state.items.map((s, index) => (
        <Grid
          item
          // eslint-disable-next-line react/no-array-index-key
          key={`${s.states.join('::')}::${s.qField ?? s.name}${index}`}
          style={{
            position: 'relative',
            maxWidth: '240px',
            minWidth: `${MIN_WIDTH}px`,
            background: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          {s.states.length > 1 ? (
            <MultiState field={s} api={api} isPinFieldEnabled={isPinFieldEnabled} />
          ) : (
            <OneField field={s} api={api} isPinFieldEnabled={isPinFieldEnabled} />
          )}
        </Grid>
      ))}
      {!isRefactoringEnabled && state.more.length > 0 && (
        <Grid
          item
          style={{
            position: 'relative',
            maxWidth: '98px',
            minWidth: `${MIN_WIDTH_MORE}px`,
            background: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <More items={state.more} api={api} />
        </Grid>
      )}
    </Grid>
  );
}
