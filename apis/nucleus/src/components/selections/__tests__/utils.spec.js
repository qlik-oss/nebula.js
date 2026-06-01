import { sortSelections, sortAllFields } from '../utils';

describe('sortSelections', () => {
  it('should sort by qOneAndOnlyOne first (true before false)', () => {
    const a = { selections: [{ qOneAndOnlyOne: true, qSortIndex: 2 }] };
    const b = { selections: [{ qOneAndOnlyOne: false, qSortIndex: 1 }] };
    expect(sortSelections(a, b)).toBe(-1);
    expect(sortSelections(b, a)).toBe(1);
  });

  it('should sort by qSortIndex when both have same qOneAndOnlyOne value', () => {
    const a = { selections: [{ qOneAndOnlyOne: true, qSortIndex: 5 }] };
    const b = { selections: [{ qOneAndOnlyOne: true, qSortIndex: 3 }] };
    expect(sortSelections(a, b)).toBe(2);
    expect(sortSelections(b, a)).toBe(-2);
  });

  it('should sort by qSortIndex when both qOneAndOnlyOne are false', () => {
    const a = { selections: [{ qOneAndOnlyOne: false, qSortIndex: 10 }] };
    const b = { selections: [{ qOneAndOnlyOne: false, qSortIndex: 8 }] };
    expect(sortSelections(a, b)).toBe(2);
  });

  it('should handle undefined qOneAndOnlyOne as false', () => {
    const a = { selections: [{ qSortIndex: 5 }] };
    const b = { selections: [{ qOneAndOnlyOne: true, qSortIndex: 10 }] };
    expect(sortSelections(a, b)).toBe(1);
    expect(sortSelections(b, a)).toBe(-1);
  });
});

describe('sortAllFields', () => {
  const createFieldList = (names) => names.map((name) => ({ qName: name }));
  const createMasterDimList = (dims) =>
    dims.map(({ id, qName, title, grouping, labelExpression }) => ({
      qInfo: { qId: id },
      qData: {
        info: [{ qName }],
        title,
        labelExpression,
        grouping,
      },
    }));

  describe('basic functionality', () => {
    it('should return empty array when fieldList is empty', () => {
      const result = sortAllFields([], [], [], []);
      expect(result).toEqual([]);
    });

    it('should return empty array when both pinnedItems and selectedFields are empty', () => {
      const fieldList = createFieldList(['Field1', 'Field2']);
      const result = sortAllFields(fieldList, [], [], []);
      expect(result).toEqual([]);
    });

    it('should return only selected fields when no pinned items exist', () => {
      const fieldList = createFieldList(['Field1', 'Field2']);
      const selectedFields = [{ selections: [{ qField: 'Field1' }] }, { selections: [{ qField: 'Field2' }] }];
      const result = sortAllFields(fieldList, [], selectedFields, []);
      expect(result).toEqual(selectedFields);
    });
  });

  describe('pinned field items', () => {
    it('should include valid pinned field items', () => {
      const fieldList = createFieldList(['Field1', 'Field2', 'Field3']);
      const pinnedItems = [{ qField: 'Field1' }, { qField: 'Field2' }];
      const result = sortAllFields(fieldList, pinnedItems, [], []);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ qField: 'Field1', isPinned: true, states: ['$'] });
      expect(result[1]).toMatchObject({ qField: 'Field2', isPinned: true, states: ['$'] });
    });

    it('should filter out invalid pinned field items not in fieldList', () => {
      const fieldList = createFieldList(['Field1', 'Field2']);
      const pinnedItems = [{ qField: 'Field1' }, { qField: 'InvalidField' }, { qField: 'Field2' }];
      const result = sortAllFields(fieldList, pinnedItems, [], []);

      expect(result).toHaveLength(2);
      expect(result[0].qField).toBe('Field1');
      expect(result[1].qField).toBe('Field2');
    });

    it('should filter out pinned items with invalid structure', () => {
      const fieldList = createFieldList(['Field1']);
      const pinnedItems = [{ qField: 'Field1' }, { invalidKey: 'test' }, {}];
      const result = sortAllFields(fieldList, pinnedItems, [], []);

      expect(result).toHaveLength(1);
      expect(result[0].qField).toBe('Field1');
    });
  });

  describe('master dimension items', () => {
    it('should include valid pinned master dimension items', () => {
      const fieldList = createFieldList(['DimField1', 'DimField2']);
      const masterDimList = createMasterDimList([
        { id: 'dim1', qName: 'DimField1', title: 'Dimension 1', grouping: 'N' },
        { id: 'dim2', qName: 'DimField2', title: 'Dimension 2', grouping: 'N' },
      ]);
      const pinnedItems = [{ id: 'dim1' }, { id: 'dim2' }];

      const result = sortAllFields(fieldList, pinnedItems, [], masterDimList);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'dim1',
        qField: 'DimField1',
        qName: 'Dimension 1',
        isPinned: true,
        states: ['$'],
      });
      expect(result[1]).toMatchObject({
        id: 'dim2',
        qField: 'DimField2',
        qName: 'Dimension 2',
        isPinned: true,
        states: ['$'],
      });
    });

    it('should use labelExpression over title for master dimension name', () => {
      const fieldList = createFieldList(['DimField1']);
      const masterDimList = createMasterDimList([
        { id: 'dim1', qName: 'DimField1', title: 'Title', grouping: 'N', labelExpression: 'Label Expression' },
      ]);
      const pinnedItems = [{ id: 'dim1' }];

      const result = sortAllFields(fieldList, pinnedItems, [], masterDimList);

      expect(result[0].qName).toBe('Label Expression');
    });

    it('should use fieldName as fallback when no title or labelExpression exists', () => {
      const fieldList = createFieldList(['DimField1']);
      const masterDimList = createMasterDimList([
        { id: 'dim1', qName: 'DimField1', title: '', grouping: 'N', labelExpression: '' },
      ]);
      const pinnedItems = [{ id: 'dim1' }];

      const result = sortAllFields(fieldList, pinnedItems, [], masterDimList);

      expect(result[0].qName).toBe('DimField1');
    });

    it('should filter out invalid master dimension items not in masterDimList', () => {
      const fieldList = createFieldList(['DimField1']);
      const masterDimList = createMasterDimList([
        { id: 'dim1', qName: 'DimField1', title: 'Dim 1', grouping: 'N' },
        { id: 'dim2', qName: 'DimField2', title: 'Dim 2', grouping: 'C' },
      ]);
      const pinnedItems = [{ id: 'dim1' }, { id: 'invalidDim' }, { id: 'dim2' }];

      const result = sortAllFields(fieldList, pinnedItems, [], masterDimList);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('dim1');
    });
  });

  describe('pinned and selected field interaction', () => {
    it('should replace pinned field with selected field when both reference same field', () => {
      const fieldList = createFieldList(['Field1', 'Field2']);
      const pinnedItems = [{ qField: 'Field1' }, { qField: 'Field2' }];
      const selectedFields = [{ selections: [{ qField: 'Field1', qSortIndex: 1 }], data: 'selected' }];

      const result = sortAllFields(fieldList, pinnedItems, selectedFields, []);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(selectedFields[0]);
      expect(result[0].isPinned).toBeUndefined();
      expect(result[1]).toMatchObject({ qField: 'Field2', isPinned: true });
    });

    it('should replace pinned field with selected field when matching by qReadableName', () => {
      const fieldList = createFieldList(['Field1']);
      const pinnedItems = [{ qField: 'Field1' }];
      const selectedFields = [{ selections: [{ qReadableName: 'Field1' }], data: 'selected' }];

      const result = sortAllFields(fieldList, pinnedItems, selectedFields, []);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(selectedFields[0]);
    });

    it('should replace pinned master dimension with selected field when matching by dimension reference', () => {
      const fieldList = createFieldList(['DimField1']);
      const masterDimList = createMasterDimList([{ id: 'dim1', qName: 'DimField1', title: 'Dim 1' }]);
      const pinnedItems = [{ id: 'dim1' }];
      const selectedFields = [
        {
          selections: [{ qDimensionReferences: [{ qId: 'dim1' }] }],
          data: 'selected',
        },
      ];

      const result = sortAllFields(fieldList, pinnedItems, selectedFields, masterDimList);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(selectedFields[0]);
    });

    it('should append remaining selected fields after pinned items', () => {
      const fieldList = createFieldList(['Field1', 'Field2', 'Field3', 'Field4']);
      const pinnedItems = [{ qField: 'Field1' }];
      const selectedFields = [
        { selections: [{ qField: 'Field2' }] },
        { selections: [{ qField: 'Field3' }] },
        { selections: [{ qField: 'Field4' }] },
      ];

      const result = sortAllFields(fieldList, pinnedItems, selectedFields, []);

      expect(result).toHaveLength(4);
      expect(result[0]).toMatchObject({ qField: 'Field1', isPinned: true });
      expect(result[1]).toEqual(selectedFields[0]);
      expect(result[2]).toEqual(selectedFields[1]);
      expect(result[3]).toEqual(selectedFields[2]);
    });
  });

  describe('duplicate handling', () => {
    it('should filter duplicate when pinned field is already selected', () => {
      const fieldList = createFieldList(['Field1', 'Field2']);
      // Two pinned items for Field1
      const pinnedItems = [{ qField: 'Field1' }, { qField: 'Field1' }];
      // One selected field for Field1
      const selectedFields = [{ selections: [{ qField: 'Field1' }] }];

      const result = sortAllFields(fieldList, pinnedItems, selectedFields, []);

      // First pinned Field1 is replaced by selected Field1
      // Second pinned Field1 is filtered out because isDuplicateFieldSelected finds the selected field
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(selectedFields[0]);
      expect(result[0].isPinned).toBeUndefined();
    });

    it('should show duplicates pinned items when same field is not selected', () => {
      const fieldList = createFieldList(['Field1', 'Field2']);
      const pinnedItems = [{ qField: 'Field1' }, { qField: 'Field1' }, { qField: 'Field2' }];
      const selectedFields = [];

      const result = sortAllFields(fieldList, pinnedItems, selectedFields, []);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({ qField: 'Field1', isPinned: true });
      expect(result[1]).toMatchObject({ qField: 'Field1', isPinned: true });
      expect(result[2]).toMatchObject({ qField: 'Field2', isPinned: true });
    });
  });

  describe('mixed scenarios', () => {
    it('should handle mix of pinned fields, master dimensions, and selected fields', () => {
      const fieldList = createFieldList(['Field1', 'DimField1', 'Field2', 'DimField2']);
      const masterDimList = createMasterDimList([
        { id: 'dim1', qName: 'DimField1', title: 'Master Dim 1', grouping: 'N' },
        { id: 'dim2', qName: 'DimField2', title: 'Master Dim 2', grouping: 'N' },
      ]);
      const pinnedItems = [{ qField: 'Field1' }, { id: 'dim1' }, { qField: 'Field2' }];
      const selectedFields = [
        { selections: [{ qField: 'Field1' }], data: 'selected1' },
        { selections: [{ qDimensionReferences: [{ qId: 'dim2' }] }], data: 'selected2' },
      ];

      const result = sortAllFields(fieldList, pinnedItems, selectedFields, masterDimList);

      expect(result).toHaveLength(4);
      // Field1 is replaced by selected field
      expect(result[0]).toEqual(selectedFields[0]);
      // dim1 remains pinned
      expect(result[1]).toMatchObject({ id: 'dim1', isPinned: true });
      // Field2 remains pinned
      expect(result[2]).toMatchObject({ qField: 'Field2', isPinned: true });
      // dim2 selected field appended at end
      expect(result[3]).toEqual(selectedFields[1]);
    });

    it('should handle empty qField values', () => {
      const fieldList = createFieldList(['Field1']);
      const pinnedItems = [{ qField: '' }, { qField: 'Field1' }];

      const result = sortAllFields(fieldList, pinnedItems, [], []);

      expect(result).toHaveLength(1);
      expect(result[0].qField).toBe('Field1');
    });

    it('should handle empty id values', () => {
      const fieldList = createFieldList(['DimField1']);
      const masterDimList = createMasterDimList([{ id: 'dim1', qName: 'DimField1', title: 'Dim 1', grouping: 'N' }]);
      const pinnedItems = [{ id: '' }, { id: 'dim1' }];

      const result = sortAllFields(fieldList, pinnedItems, [], masterDimList);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('dim1');
    });
  });
});
