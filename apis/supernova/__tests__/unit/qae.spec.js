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
    expect(t.path).to.eql('/qHyperCubeDef');
    expect(t.dimensions.min()).to.eql(0);
    expect(t.dimensions.max()).to.eql(1000);
    expect(t.dimensions.add()).to.equal(undefined);
    expect(t.measures.min()).to.eql(0);
    expect(t.measures.max()).to.eql(1000);
    expect(t.measures.add()).to.equal(undefined);
  });

  it('should map provided data', () => {
    const t = qae({
      data: {
        targets: [
          {
            path: 'qhc',
            dimensions: {
              min: () => 3,
              max: () => 7,
              add: () => 'a',
              description: () => 'Slice',
              move: () => 'c',
              replace: () => 'd',
            },
            measures: {
              min: 2,
              max: 4,
              add: () => 'b',
              description: () => 'Angle',
              remove: () => 'e',
            },
          },
        ],
      },
    }).data.targets[0];
    expect(t.path).to.eql('qhc');
    expect(t.dimensions.min()).to.eql(3);
    expect(t.dimensions.max()).to.eql(7);
    expect(t.dimensions.add()).to.equal('a');
    expect(t.dimensions.description()).to.equal('Slice');
    expect(t.dimensions.move()).to.equal('c');
    expect(t.dimensions.replace()).to.equal('d');
    expect(t.measures.min()).to.eql(2);
    expect(t.measures.max()).to.eql(4);
    expect(t.measures.add()).to.equal('b');
    expect(t.measures.description()).to.equal('Angle');
    expect(t.measures.remove()).to.equal('e');
  });
});
