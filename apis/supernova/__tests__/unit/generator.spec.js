// import generator from '../../src/generator';

describe('generator', () => {
  let generator;
  before(() => {
    [{ default: generator }] = aw.mock(
      [
        ['**/creator.js', () => (...a) => [...a]],
        ['**/qae.js', () => (qae) => qae || 'qae'],
      ],
      ['../../src/generator']
    );
  });

  it('should have a default qae property', () => {
    expect(generator({}).qae).to.eql('qae');
  });

  it('should have a component property', () => {
    expect(generator({}).component).to.eql({});
  });

  it('should not override reserved properties', () => {
    expect(
      generator({
        foo: 'bar',
        component: 'c',
      }).definition
    ).to.eql({
      foo: 'bar',
    });
  });

  it('should accept a function', () => {
    const spy = sinon.stub().returns({});
    generator(spy, { translator: 't', Promise: 'P' });
    expect(spy).to.have.been.calledWithExactly({
      translator: 't',
      Promise: 'P',
    });
  });

  it('should create an instance', () => {
    const g = generator(
      {},
      {
        translator: 't',
        Promise: 'P',
      }
    );
    const ret = g.create('a');
    expect(ret).to.eql([g, 'a', { translator: 't', Promise: 'P' }]);
  });
});
