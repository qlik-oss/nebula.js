import qae from '../../src/qae';

describe('qae', () => {
  it('should have empty defaults', () => {
    expect(qae()).to.eql({
      properties: {},
      data: {
        targets: [],
      },
    });
  });

  it('should provide properties', () => {
    expect(qae({
      properties: { p: 'p' },
    }).properties).to.eql({ p: 'p' });
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
        targets: [{
          path: 'qhc',
          dimensions: {
            min: () => 3,
            max: () => 7,
            add: () => 'a',
          },
          measures: {
            min: 2,
            max: 4,
            add: () => 'b',
          },
        }],
      },
    }).data.targets[0];
    expect(t.path).to.eql('qhc');
    expect(t.dimensions.min()).to.eql(3);
    expect(t.dimensions.max()).to.eql(7);
    expect(t.dimensions.add()).to.equal('a');
    expect(t.measures.min()).to.eql(2);
    expect(t.measures.max()).to.eql(4);
    expect(t.measures.add()).to.equal('b');
  });
});
