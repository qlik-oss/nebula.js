const doMock = ({ handler } = {}) => aw.mock([['**/hc-handler.js', () => handler]], ['../populator.js']);
describe('populator', () => {
  let handler;
  let context;
  let populate;
  let sb;
  let h;
  let ft;
  before(() => {
    sb = sinon.createSandbox();
    h = {
      addMeasure: sb.stub(),
      addDimension: sb.stub(),
    };
    const fn = () => h;
    handler = sb.spy(fn);
    context = {
      logger: {
        warn: sb.stub(),
      },
    };
    [{ default: populate, fieldType: ft }] = doMock({ handler });
  });
  beforeEach(() => {
    sb.reset();
  });

  it('should not throw if fields are not provided', () => {
    const fn = () => populate({ sn: null, properties: {}, fields: [] }, context);
    expect(fn).to.not.throw();
  });

  it('should log warning if fields is provided but targets are not specified', () => {
    const sn = { qae: { data: { targets: [] } } };
    populate({ sn, properties: {}, fields: [1] }, context);
    expect(context.logger.warn).to.have.been.calledWithExactly(
      'Attempting to add fields to an object without a specified data target'
    );
  });

  it('should initiate handler with resolved target', () => {
    const target = {
      propertyPath: 'a/b/c',
    };
    const sn = {
      qae: {
        data: {
          targets: [target],
        },
      },
    };
    const resolved = { qDimensions: [] };
    populate({ sn, properties: { a: { b: { c: resolved } } }, fields: [1] }, context);
    expect(handler).to.have.been.calledWithExactly({
      hc: resolved,
      def: target,
      properties: { a: { b: { c: resolved } } },
    });
  });

  it('should add dimension', () => {
    const target = {
      propertyPath: 'hc',
    };
    const sn = {
      qae: {
        data: {
          targets: [target],
        },
      },
    };
    const resolved = { qDimensions: [] };
    populate({ sn, properties: { a: { b: { c: resolved } } }, fields: ['A'] }, context);
    expect(h.addDimension).to.have.been.calledWithExactly('A');
  });

  it('should add measure', () => {
    const target = {
      propertyPath: 'hc',
    };
    const sn = {
      qae: {
        data: {
          targets: [target],
        },
      },
    };
    const resolved = { qDimensions: [] };
    populate({ sn, properties: { a: { b: { c: resolved } } }, fields: ['=A'] }, context);
    expect(h.addMeasure).to.have.been.calledWithExactly('=A');
  });

  it("should identify field as measure when prefixed with '='", () => {
    expect(ft('=a')).to.equal('measure');
  });

  it('should identify field as measure when object looks like NxMeasure', () => {
    expect(ft({ qDef: { qDef: {} } })).to.equal('measure');
  });

  it("should identify field as measure when object contains a qLibraryId and type==='measure'", () => {
    expect(ft({ qLibraryId: 'a', type: 'measure' })).to.equal('measure');
  });
});
