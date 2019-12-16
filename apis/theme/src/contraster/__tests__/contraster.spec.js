describe('contraster', () => {
  let sandbox;
  let create;
  let luminance;
  let contrast;
  before(() => {
    sandbox = sinon.createSandbox();
    luminance = sandbox.stub();
    contrast = sandbox.stub();
    [{ default: create }] = aw.mock(
      [
        ['**/luminance.js', () => luminance],
        ['**/contrast.js', () => contrast],
      ],
      ['../contraster.js']
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  beforeEach(() => {
    luminance.withArgs('#ffffff').returns(1);
    luminance.withArgs('#333333').returns(0.1);
  });

  it('should return #ffffff by default when input is dark', () => {
    luminance.withArgs('#111111').returns(0.05);
    contrast.withArgs(0.05, 0.1).returns(5);
    contrast.withArgs(0.05, 1).returns(20);
    expect(create().getBestContrastColor('#111111')).to.equal('#ffffff');
  });

  it('should return #333333 by default when input is light', () => {
    luminance.withArgs('#afa').returns(0.8);
    contrast.withArgs(0.8, 0.1).returns(10);
    contrast.withArgs(0.8, 1).returns(2);
    expect(create().getBestContrastColor('#afa')).to.equal('#333333');
  });

  it('should return cached value', () => {
    luminance.withArgs('#afa').returns(0.8);
    contrast.withArgs(0.8, 0.1).returns(10);
    contrast.withArgs(0.8, 1).returns(2);

    const c = create();
    c.getBestContrastColor('#afa');
    expect(luminance.callCount).to.equal(3);

    c.getBestContrastColor('#afa');
    c.getBestContrastColor('#afa');
    expect(luminance.callCount).to.equal(3);
  });
});
