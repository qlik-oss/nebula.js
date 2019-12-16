describe('luminance', () => {
  let sandbox;
  let luminance;
  let d3Color;
  before(() => {
    sandbox = sinon.createSandbox();
    d3Color = sandbox.stub();
    luminance = sandbox.stub();
    [{ default: luminance }] = aw.mock([['**/d3-color.js', () => ({ color: d3Color })]], ['../luminance.js']);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('for #ffffff should be 1', () => {
    d3Color.withArgs('#ffffff').returns({ rgb: () => ({ r: 255, g: 255, b: 255 }) });
    expect(luminance('#ffffff')).to.equal(1);
  });

  it('for #000000 should be 0', () => {
    d3Color.withArgs('#000000').returns({ rgb: () => ({ r: 0, g: 0, b: 0 }) });
    expect(luminance('#000000')).to.equal(0);
  });

  it('for #ff6633 should be 0.31002', () => {
    d3Color.withArgs('#ff6633').returns({ rgb: () => ({ r: 255, g: 102, b: 51 }) });
    expect(luminance('#ff6633')).to.equal(0.31002);
  });
});
