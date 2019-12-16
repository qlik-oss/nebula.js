describe('theme', () => {
  let sandbox;
  let create;
  let setTheme;
  let paletterResolverFn;
  let styleResolverFn;
  let contrasterFn;
  let luminanceFn;
  let emitter;
  before(() => {
    sandbox = sinon.createSandbox();
    setTheme = sandbox.stub();
    paletterResolverFn = sandbox.stub();
    styleResolverFn = sandbox.stub();
    styleResolverFn.resolveRawTheme = 'raw';
    contrasterFn = sandbox.stub();
    luminanceFn = sandbox.stub();
    emitter = {
      prototype: {
        emit: sandbox.stub(),
      },
      init: sandbox.stub(),
    };
    [{ default: create }] = aw.mock(
      [
        [require.resolve('node-event-emitter'), () => emitter],
        ['**/set-theme.js', () => setTheme],
        ['**/palette-resolver.js', () => paletterResolverFn],
        ['**/style-resolver.js', () => styleResolverFn],
        ['**/contraster.js', () => contrasterFn],
        ['**/luminance.js', () => luminanceFn],
      ],
      ['../index.js']
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('initiate', () => {
    beforeEach(() => {
      setTheme.withArgs({}, 'raw').returns('resolvedJSON');
      const getStyle = sandbox.stub();
      getStyle.returns('red');
      styleResolverFn.withArgs('', 'resolvedJSON').returns({
        getStyle,
      });
    });

    it('should create paletteResolver', () => {
      create();
      expect(paletterResolverFn).to.have.been.calledWithExactly('resolvedJSON');
    });

    it('should create contraster for dark text color', () => {
      luminanceFn.returns(0.19);
      create();
      expect(contrasterFn).to.have.been.calledWithExactly(['red', '#ffffff']);
    });

    it('should create contraster for light text color', () => {
      create();
      expect(contrasterFn).to.have.been.calledWithExactly(['red', '#333333']);
    });

    it("should emit 'changed' event", () => {
      const t = create();
      expect(t.externalAPI.emit).to.have.been.calledWithExactly('changed');
    });
  });

  describe('api', () => {
    let t;
    let resolved;
    beforeEach(() => {
      resolved = 'resolved';
      setTheme.returns(resolved);
      paletterResolverFn.returns({
        dataScales: () => 'p scales',
        dataPalettes: () => 'p data palettes',
        uiPalettes: () => `p ui palettes`,
        dataColors: () => 'p data colors',
        uiColor: a => `p ui ${a}`,
      });

      styleResolverFn.withArgs('', 'resolved').returns({
        getStyle: () => '#eeeeee',
      });

      contrasterFn.returns({ getBestContrastColor: c => `contrast ${c}` });

      t = create().externalAPI;
    });

    it('getDataColorScales()', () => {
      expect(t.getDataColorScales()).to.equal('p scales');
    });

    it('getDataColorPalettes()', () => {
      expect(t.getDataColorPalettes()).to.equal('p data palettes');
    });

    it('getDataColorPickerPalettes()', () => {
      expect(t.getDataColorPickerPalettes()).to.equal('p ui palettes');
    });

    it('getDataColorSpecials()', () => {
      expect(t.getDataColorSpecials()).to.equal('p data colors');
    });

    it('getColorPickerColor()', () => {
      expect(t.getColorPickerColor('color')).to.equal('p ui color');
    });

    it('getContrastingColorTo()', () => {
      expect(t.getContrastingColorTo('color')).to.equal('contrast color');
    });

    it('getStyle()', () => {
      const getStyle = sandbox.stub();
      getStyle.returns('style');
      styleResolverFn.withArgs('base', 'resolved').returns({
        getStyle,
      });
      expect(t.getStyle('base', 'path', 'attribute')).to.equal('style');

      // calling additional getStyle with same params should use cached style resolver
      expect(styleResolverFn.callCount).to.equal(2);
      t.getStyle('base', 'path', 'attribute');
      t.getStyle('base', 'path', 'attribute');
      t.getStyle('base', 'path', 'attribute');
      expect(styleResolverFn.callCount).to.equal(2);
    });
  });
});
