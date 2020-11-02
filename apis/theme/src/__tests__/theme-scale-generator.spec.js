import scaleGenerator from '../theme-scale-generator';

describe('Theme scale generator', () => {
  const input = ['#ffffff', '#000000'];
  const base8 = ['#ffffff', '#d4d4d4', '#aaaaaa', '#7f7f7f', '#545454', '#2a2a2a', '#000000'];

  beforeEach(() => {});

  it('Should generate a pyramid', () => {
    const scales = [{ type: 'class', scale: input }];
    scaleGenerator(scales);
    expect(scales).to.have.length(1);
    const { scale, type } = scales[0];

    expect(type).to.equals('class-pyramid');
    expect(scale.length).to.equal(8);
    expect(scale[scale.length - 1].length).to.equal(7);
  });

  it('Should generate a correct base of colors', () => {
    const scales = [{ type: 'class', scale: input }];
    scaleGenerator(scales);
    const { scale } = scales[0];

    const colors = scale[scale.length - 1];
    expect(colors).to.deep.equal(base8);
  });

  it('Should work correctly on a scale from the sense theme', () => {
    const senseDivergentScale = [
      '#ae1c3e',
      '#d24d3e',
      '#ed875e',
      '#f9bd7e',
      '#ffe3aa',
      '#e6f5fe',
      '#b4ddf7',
      '#77b7e5',
      '#3a89c9',
      '#3d52a1',
    ];
    const scales = [{ type: 'class', scale: senseDivergentScale }];
    scaleGenerator(scales);
    const { scale } = scales[0];
    expect(scale).to.deep.equal([
      null,
      ['#e6f5fe'],
      ['#ed875e', '#3a89c9'],
      ['#d24d3e', '#ffe3aa', '#3a89c9'],
      ['#d24d3e', '#f9bd7e', '#b4ddf7', '#3a89c9'],
      ['#d24d3e', '#f9bd7e', '#e6f5fe', '#b4ddf7', '#3a89c9'],
      ['#d24d3e', '#ed875e', '#ffe3aa', '#e6f5fe', '#77b7e5', '#3d52a1'],
      ['#ae1c3e', '#ed875e', '#f9bd7e', '#e6f5fe', '#b4ddf7', '#77b7e5', '#3d52a1'],
      ['#ae1c3e', '#d24d3e', '#f9bd7e', '#ffe3aa', '#e6f5fe', '#b4ddf7', '#3a89c9', '#3d52a1'],
      ['#ae1c3e', '#d24d3e', '#ed875e', '#f9bd7e', '#e6f5fe', '#b4ddf7', '#77b7e5', '#3a89c9', '#3d52a1'],
      ['#ae1c3e', '#d24d3e', '#ed875e', '#f9bd7e', '#ffe3aa', '#e6f5fe', '#b4ddf7', '#77b7e5', '#3a89c9', '#3d52a1'],
    ]);
  });
});
