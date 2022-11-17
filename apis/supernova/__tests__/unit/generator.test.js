import generator from '../../src/generator';

import * as Creator from '../../src/creator';
import * as Qae from '../../src/qae';

describe('generator', () => {
  let creatorMock;
  let qaeMock;

  beforeEach(() => {
    creatorMock = jest.fn().mockImplementation((...a) => [...a]);
    qaeMock = jest.fn().mockImplementation((qae) => qae || 'qae');

    jest.spyOn(Qae, 'default').mockImplementation(qaeMock);
    jest.spyOn(Creator, 'default').mockImplementation(creatorMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should have a default qae property', () => {
    expect(generator({}).qae).toBe('qae');
  });

  test('should have a component property', () => {
    expect(generator({}).component).toEqual({});
  });

  test('should not override reserved properties', () => {
    expect(
      generator({
        foo: 'bar',
        component: 'c',
      }).definition
    ).toEqual({
      foo: 'bar',
    });
  });

  test('should accept a function', () => {
    const spy = jest.fn().mockReturnValue({});
    generator(spy, { translator: 't', Promise: 'P' });
    expect(spy).toHaveBeenCalledWith({
      translator: 't',
      Promise: 'P',
    });
  });

  test('should create an instance', () => {
    const g = generator(
      {},
      {
        translator: 't',
        Promise: 'P',
      }
    );
    const ret = g.create('a');
    expect(ret).toEqual([g, 'a', { translator: 't', Promise: 'P' }]);
  });
});
