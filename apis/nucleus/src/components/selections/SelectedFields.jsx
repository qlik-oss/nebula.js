import { useMemo, useContext } from 'react';

import { Grid } from '@mui/material';

import { useTheme } from '@nebula.js/ui/theme';
import useCurrentSelectionsModel from '../../hooks/useCurrentSelectionsModel';
import useLayout from '../../hooks/useLayout';
import useRect from '../../hooks/useRect';
import InstanceContext from '../../contexts/InstanceContext';
import usePinnedList from './hooks/usePinnedList';
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

const getMaxItems = (containerRect) => {
  if (!containerRect) {
    return 0;
  }
  const { width } = containerRect;
  const maxWidth = Math.floor(width) - MIN_WIDTH_MORE;
  const items = Math.floor(maxWidth / MIN_WIDTH);
  return items;
};

const getItemsAndMore = ({ currentItems, containerRef, maxItems, isInListboxPopover }) => {
  if (!containerRef) {
    return { items: [], more: [] };
  }
  const newItems = [...currentItems];
  const currStateItems = containerRef.items ?? [];
  // Maintain modal state in app selections
  if (isInListboxPopover() && newItems.length + 1 === currStateItems.length) {
    const lastDeselectedField = currStateItems.filter((f1) => newItems.some((f2) => f1.name === f2.name) === false)[0];
    if (lastDeselectedField && !lastDeselectedField.isPinned) {
      const { qField } = lastDeselectedField.selections[0];
      lastDeselectedField.selections = [{ qField }];
      const wasIx = currStateItems.indexOf(lastDeselectedField);
      newItems.splice(wasIx, 0, lastDeselectedField);
    }
  }
  let newMoreItems = [];
  if (maxItems < newItems.length) {
    newMoreItems = newItems.splice(0, newItems.length - maxItems);
  }
  /* eslint-disable no-param-reassign */
  containerRef.items = newItems;
  return {
    items: newItems,
    more: newMoreItems,
  };
};

export default function SelectedFields({ api, app }) {
  const theme = useTheme();
  const [currentSelectionsModel] = useCurrentSelectionsModel(app);
  const [layout] = useLayout(currentSelectionsModel);
  const [fieldList] = useFieldList(app);
  const [masterDimList] = useDimensionList(app);
  const [pinnedItems] = usePinnedList(app);

  const { modalObjectStore } = useContext(InstanceContext).selectionStore;
  const [containerRef, containerRect] = useRect();
  const currentItems = useMemo(() => {
    const items = getItems(layout).sort(sortSelections);
    return sortAllFields(fieldList, pinnedItems, items, masterDimList);
  }, [layout, fieldList, pinnedItems, masterDimList]);
  const maxItems = getMaxItems(containerRect);

  const isInListboxPopover = () => {
    const { model } = modalObjectStore.get(app.id) || {};
    return model?.genericType === 'njsListbox';
  };

  const { items, more } = getItemsAndMore({
    currentItems,
    containerRef,
    maxItems,
    isInListboxPopover,
  });

  return (
    <Grid ref={containerRef} container gap={0} wrap="nowrap" style={{ height: '100%' }}>
      {more.length > 0 && (
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
          <More items={more} api={api} />
        </Grid>
      )}
      {items.map((s, index) => (
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
          {s.states.length > 1 ? <MultiState field={s} api={api} /> : <OneField field={s} api={api} />}
        </Grid>
      ))}
    </Grid>
  );
}
