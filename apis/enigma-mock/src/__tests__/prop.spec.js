import { getPropValue, getPropFn } from '../prop';

describe('getPropValue', () => {
  describe('value is fixed', () => {
    it('supports value of type string', () => {
      const value = getPropValue('foo');
      expect(value).to.equal('foo');
    });

    it('supports value of type object', () => {
      const value = getPropValue({ foo: 'bar' });
      expect(value).to.eql({ foo: 'bar' });
    });

    it('supports value of type null', () => {
      const value = getPropValue(null);
      expect(value).to.equal(null);
    });
  });

  describe('value is a function', () => {
    it('invokes function', () => {
      const prop = sinon.stub();
      prop.returns(true);
      const value = getPropValue(prop);
      expect(prop).to.have.been.calledOnce;
      expect(value).is.true;
    });

    it('forwards arguments', () => {
      const prop = sinon.stub();
      prop.returns(true);
      const value = getPropValue(prop, { args: [true, 'search'] });
      expect(prop).to.have.been.calledWith(true, 'search');
      expect(value).is.true;
    });

    it('returns dynamic value', () => {
      const prop = sinon.stub();
      prop.returns({ result: [] });
      const value = getPropValue(prop);
      expect(value).to.eql({ result: [] });
    });
  });

  describe('no value defined', () => {
    it('returns default value', () => {
      const value = getPropValue(undefined, { defaultValue: true });
      expect(value).to.be.true;
    });
  });
});

describe('getPropFn', () => {
  it('returns a function', () => {
    const fn = getPropFn('result');
    expect(fn).to.be.a('function');
  });

  it('forwards arguments', async () => {
    const prop = sinon.stub();
    prop.returns(10);
    const fn = getPropFn(prop);
    const value = await fn(false, 'status');
    expect(prop).to.have.been.calledWith(false, 'status');
    expect(value).to.equal(10);
  });

  describe('async is enabled', () => {
    it('returns promise', async () => {
      const prop = sinon.stub();
      prop.returns(500);
      const fn = getPropFn(prop, { async: true });
      const valuePromise = fn();
      expect(valuePromise).to.be.a('promise');
      const value = await valuePromise;
      expect(value).to.equal(500);
    });
  });

  describe('async is disabled', () => {
    it('returns the value', () => {
      const prop = sinon.stub();
      prop.returns(500);
      const fn = getPropFn(prop, { async: false });
      const value = fn();
      expect(value).to.equal(500);
    });
  });
});
