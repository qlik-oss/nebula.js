import qae from '../../src/qae';

describe('qae', () => {
  it('should have empty defaults', () => {
    expect(qae()).to.eql({
      properties: {
        initial: {},
        onChange: undefined,
      },
      data: {
        targets: [],
      },
    });
  });

  it('should provide properties', () => {
    expect(
      qae({
        properties: { p: 'p' },
      }).properties.initial
    ).to.eql({ p: 'p' });
  });

  it('should map target defaults', () => {
    const t = qae({
      data: {
        targets: [{}],
      },
    }).data.targets[0];
    expect(t.propertyPath).to.eql('/qHyperCubeDef');
    expect(t.layoutPath).to.eql('/qHyperCube');
    expect(t.dimensions.min()).to.eql(0);
    expect(t.dimensions.max()).to.eql(1000);
    expect(t.dimensions.added()).to.equal(undefined);
    expect(t.measures.min()).to.eql(0);
    expect(t.measures.max()).to.eql(1000);
    expect(t.measures.added()).to.equal(undefined);
    expect(t.dimensions.isDefined()).to.equal(false);
    expect(t.measures.isDefined()).to.equal(false);
  });

  it('should map provided data', () => {
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
    expect(t.propertyPath).to.eql('/qHyperCubeDef');
    expect(t.dimensions.min()).to.eql(3);
    expect(t.dimensions.max()).to.eql(7);
    expect(t.dimensions.added()).to.equal('a');
    expect(t.dimensions.description()).to.equal('Slice');
    expect(t.dimensions.moved()).to.equal('c');
    expect(t.dimensions.replaced()).to.equal('d');
    expect(t.measures.min()).to.eql(2);
    expect(t.measures.max()).to.eql(4);
    expect(t.measures.added()).to.equal('b');
    expect(t.measures.description()).to.equal('Angle');
    expect(t.measures.removed()).to.equal('e');
    expect(t.dimensions.isDefined()).to.equal(true);
    expect(t.measures.isDefined()).to.equal(true);
  });
  it('should throw with incorrect hypercube def', () => {
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
    ).to.throw('Incorrect definition for qHyperCubeDef at /qHyperCubeDefFoo');
  });
  it('should throw with incorrect listobject def', () => {
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
    ).to.throw('Incorrect definition for qListObjectDef at /qListObjectDefFoo');
  });
  it('should resolve layout', () => {
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
    expect(t.resolveLayout(layout)).to.eql('woho');
  });
});
