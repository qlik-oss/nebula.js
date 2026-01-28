const FIELD_KEY = 'qField';
const MASTER_ITEM_KEY = 'id';

/**
 * Sort items shown in current selections toolbar.
 * @ignore
 * The order is as follows:
 * 	1. qOneAndOnlyOne
 * 	2. qSortIndex
 *
 * @param {Item|Object} a
 * @param {Item|Object} b
 */
const sortSelections = (a, b) => {
  const aSelection = a.selections[0];
  const bSelection = b.selections[0];
  const aQ = !!aSelection.qOneAndOnlyOne;
  const bQ = !!bSelection.qOneAndOnlyOne;
  if (aQ === bQ) {
    return aSelection.qSortIndex - bSelection.qSortIndex;
  }
  return aQ ? -1 : 1;
};

// fieldList only has qName properties can identify a field
const getValidPinnedItems = (fieldList, masterDimList, pinnedItems) =>
  pinnedItems.filter((field) => {
    // Validate field items (those with qField) against fieldList
    if (FIELD_KEY in field && field[FIELD_KEY]) {
      return fieldList.some((item) => item.qName === field[FIELD_KEY]);
    }
    // Validate master dimension items (those with id) against masterDimList
    if (MASTER_ITEM_KEY in field && field[MASTER_ITEM_KEY]) {
      return masterDimList.some(
        (dimItem) => dimItem.qInfo?.qId === field[MASTER_ITEM_KEY] && dimItem.qData?.grouping === 'N'
      );
    }
    // Invalid field structure, filter it out
    return false;
  });

// Sorts valid pinned items first, then selected fields.
// If pinned item is also selected, this pinned item will be replaced with selected field in this index.
const sortAllFields = (fieldList, pinnedItems, selectedFields, masterDimList) => {
  if (!fieldList || !masterDimList) {
    return selectedFields;
  }
  if (fieldList.length === 0 || (pinnedItems.length === 0 && selectedFields.length === 0)) {
    return [];
  }
  const validPinnedItems = getValidPinnedItems(fieldList, masterDimList, pinnedItems);
  const sortedFields = [];
  const remainingSelectedFields = [...selectedFields];

  for (let i = 0; i < validPinnedItems.length; i++) {
    const pinnedItem = validPinnedItems[i];
    const isMasterDim = !!(MASTER_ITEM_KEY in pinnedItem && pinnedItem[MASTER_ITEM_KEY]);
    const masterDimInfo = isMasterDim
      ? masterDimList.find((dimItem) => dimItem.qInfo?.qId === pinnedItem[MASTER_ITEM_KEY])
      : null;
    const fieldName = isMasterDim ? masterDimInfo?.qData?.info[0]?.qName : pinnedItem[FIELD_KEY];

    const matchFieldIndex = remainingSelectedFields.findIndex(
      (item) =>
        (isMasterDim && item.selections[0].qDimensionReferences?.[0]?.qId === pinnedItem[MASTER_ITEM_KEY]) ||
        (!isMasterDim && (item.selections[0].qField === fieldName || item.selections[0].qReadableName === fieldName))
    );

    // Pinned field has already added as selected field, skip it to avoid duplicate display
    const isDuplicateFieldSelected =
      sortedFields.findIndex((sf) => sf.selections?.[0]?.qField === fieldName && !sf.isPinned) !== -1;
    if (!isDuplicateFieldSelected) {
      if (matchFieldIndex === -1) {
        // If pinned field is not selected or is duplicated, keep it as pinned.
        const pinnedFieldData = {
          ...validPinnedItems[i],
          isPinned: true,
          states: ['$'],
        };
        if (isMasterDim && masterDimInfo) {
          pinnedFieldData.qField = fieldName;
          pinnedFieldData.qName = masterDimInfo.qData.labelExpression || masterDimInfo.qData.title || fieldName;
        }
        sortedFields.push(pinnedFieldData);
      } else {
        sortedFields.push(remainingSelectedFields[matchFieldIndex]);
        remainingSelectedFields.splice(matchFieldIndex, 1);
      }
    }
  }
  return [...sortedFields, ...remainingSelectedFields];
};

export { sortAllFields, sortSelections };
