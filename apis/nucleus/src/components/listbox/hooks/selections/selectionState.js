import { getSelectedValues } from './listbox-selections';

export default function selectionState() {
  const state = {
    itemStates: {},
    ignoreSelectionState: false,
    selectedInEngine: [],
    enginePages: [],
    setPages: undefined,
    lastRowCount: undefined,
    lastApprMaxGlyphCount: undefined,

    update({ setPages, pages, isSingleSelect, selectDisabled, layout }) {
      this.setPages = setPages;
      const isSameRowCount = this.lastRowCount === layout.qListObject.qSize.qcy;
      const isSameMaxGlyphCnt = this.lastApprMaxGlyphCount === layout.qListObject.qDimensionInfo.qApprMaxGlyphCount;

      if (!isSameRowCount || !isSameMaxGlyphCnt) {
        this.lastRowCount = layout.qListObject.qSize.qcy;
        this.lastApprMaxGlyphCount = layout.qListObject.qDimensionInfo.qApprMaxGlyphCount;

        // The field have probably changed (drill up/down)
        // need to clear the client side item states since the field values have changed
        this.clearItemStates(false);
      }

      if (state.enginePages !== pages && pages !== undefined) {
        state.enginePages = pages ?? [];
        state.selectedInEngine = getSelectedValues(pages);
        state.selectableValuesUpdating = false;
        state.triggerStateChanged();
      }
      state.isSingleSelect = isSingleSelect;
      state.selectDisabled = selectDisabled;
      state.isDimCalculated = layout?.qListObject?.qDimensionInfo?.qIsCalculated ?? false;
    },

    allowedToSelect() {
      if (state.selectDisabled()) {
        return false;
      }
      // When a dim is calculated, the rows must be done updating after previeous selection
      return !(state.isDimCalculated && state.selectableValuesUpdating);
    },

    setSelectableValuesUpdating() {
      state.selectableValuesUpdating = true;
    },

    useClientItemState(elementNumber) {
      return state.ignoreSelectionState || elementNumber in state.itemStates;
    },

    isSelected(elementNumber) {
      if (state.useClientItemState(elementNumber)) {
        return !!state.itemStates[elementNumber];
      }
      return state.selectedInEngine.includes(elementNumber);
    },

    getState(item) {
      const { qElemNumber, qState } = item;
      if (!state.useClientItemState(qElemNumber)) {
        return qState;
      }
      if (state.itemStates[qElemNumber]) {
        return qState === 'XS' ? 'XS' : 'S';
      }
      return qState === 'S' || qState === 'XS' ? 'A' : qState;
    },

    updateItemNoEvents(elementNumber, additive, selectedValues) {
      const selected = state.isSelected(elementNumber);

      if (selected && !additive) {
        state.itemStates[elementNumber] = false;
      } else if (!selected) {
        selectedValues?.push(elementNumber);
        state.itemStates[elementNumber] = true;
      }
    },

    triggerStateChanged() {
      if (this.setPages) {
        const pages = state.applySelectionsOnPages(state.enginePages);
        this.setPages(pages);
      }
    },

    applySelectionsOnPages(pages) {
      const matrices = pages.map((page) => {
        const qMatrix = page.qMatrix.map((p) => {
          const [p0] = p;
          const qState = state.getState(p0);
          return [{ ...p0, qState }, ...p.slice(1)];
        });
        return { ...page, qMatrix };
      });
      return matrices;
    },

    updateItem(elementNumber, additive, selectedValues) {
      state.updateItemNoEvents(elementNumber, additive, selectedValues);
      state.triggerStateChanged();
    },

    updateItems(elementNumbers, additive, selectedValues) {
      elementNumbers.forEach((elementNumber) => {
        state.updateItemNoEvents(elementNumber, additive, selectedValues);
      });
      state.triggerStateChanged();
    },

    clearItemStates(ignoreSelectionState) {
      state.itemStates = {};
      state.ignoreSelectionState = ignoreSelectionState;
    },
  };
  return state;
}
