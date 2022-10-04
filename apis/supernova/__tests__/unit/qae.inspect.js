import qae from '../../src/qae';

describe('qae', () => {
  test('should have empty defaults', () => {
    expect(qae()).toEqual({
      properties: {
        initial: {},
        onChange: undefined,
      },
      data: {
        targets: [],
      },
      exportProperties: undefined,
      importProperties: undefined,
    });
  });

  test('should provide properties', () => {
    expect(
      qae({
        properties: { p: 'p' },
      }).properties.initial
    ).toEqual({ p: 'p' });
  });

  test('should map target defaults', () => {
    const t = qae({
      data: {
        targets: [{}],
      },
    }).data.targets[0];
    expect(t.propertyPath).toBe('/qHyperCubeDef');
    expect(t.layoutPath).toBe('/qHyperCube');
    expect(t.dimensions.min()).toBe(0);
    expect(t.dimensions.max()).toBe(1000);
    expect(t.dimensions.added()).toBe(undefined);
    expect(t.measures.min()).toBe(0);
    expect(t.measures.max()).toBe(1000);
    expect(t.measures.added()).toBe(undefined);
    expect(t.dimensions.isDefined()).toBe(false);
    expect(t.measures.isDefined()).toBe(false);
  });

  test('should map provided data', () => {
    const t = qae({
      data: {
        targets: [
          {
            path: '/qHyperCubeDef',
            dimensions: {
              min: () => 3,
              max: () => 7,
              added: () => 'a',
              description: () => 'Slice',
              moved: () => 'c',
              replaced: () => 'd',
            },
            measures: {
              min: 2,
              max: 4,
              added: () => 'b',
              description: () => 'Angle',
              removed: () => 'e',
            },
          },
        ],
      },
    }).data.targets[0];
    expect(t.propertyPath).toBe('/qHyperCubeDef');
    expect(t.dimensions.min()).toBe(3);
    expect(t.dimensions.max()).toBe(7);
    expect(t.dimensions.added()).toBe('a');
    expect(t.dimensions.description()).toBe('Slice');
    expect(t.dimensions.moved()).toBe('c');
    expect(t.dimensions.replaced()).toBe('d');
    expect(t.measures.min()).toBe(2);
    expect(t.measures.max()).toBe(4);
    expect(t.measures.added()).toBe('b');
    expect(t.measures.description()).toBe('Angle');
    expect(t.measures.removed()).toBe('e');
    expect(t.dimensions.isDefined()).toBe(true);
    expect(t.measures.isDefined()).toBe(true);
  });
  test('should throw with incorrect hypercube def', () => {
    expect(() =>
      qae({
        data: {
          targets: [
            {
              path: '/qHyperCubeDefFoo',
              dimensions: {
                min: () => 3,
                max: () => 7,
                added: () => 'a',
                description: () => 'Slice',
                moved: () => 'c',
                replaced: () => 'd',
              },
              measures: {
                min: 2,
                max: 4,
                added: () => 'b',
                description: () => 'Angle',
                removed: () => 'e',
              },
            },
          ],
        },
      })
    ).toThrow('Incorrect definition for qHyperCubeDef at /qHyperCubeDefFoo');
  });
  test('should throw with incorrect listobject def', () => {
    expect(() =>
      qae({
        data: {
          targets: [
            {
              path: '/qListObjectDefFoo',
              dimensions: {
                min: () => 3,
                max: () => 7,
                added: () => 'a',
                description: () => 'Slice',
                moved: () => 'c',
                replaced: () => 'd',
              },
              measures: {
                min: 2,
                max: 4,
                added: () => 'b',
                description: () => 'Angle',
                removed: () => 'e',
              },
            },
          ],
        },
      })
    ).toThrow('Incorrect definition for qListObjectDef at /qListObjectDefFoo');
  });
  test('should resolve layout', () => {
    const t = qae({
      data: {
        targets: [
          {
            path: '/foo/bar/baz/qHyperCubeDef',
          },
        ],
      },
    }).data.targets[0];
    const layout = {
      foo: {
        bar: {
          baz: {
            qHyperCube: 'woho',
          },
        },
      },
    };
    expect(t.resolveLayout(layout)).toBe('woho');
  });
});
