import escapeField from '../escape-field';

describe('escaping of fields', () => {
  test('Should escape non-allowed characters', () => {
    expect(escapeField('A B')).toEqual('[A B]');
    expect(escapeField('A[B')).toEqual('[A[B]');
    expect(escapeField('A]B')).toEqual('[A]]B]');
    expect(escapeField('123')).toEqual('[123]');
    expect(escapeField('a-1')).toEqual('[a-1]');
    expect(escapeField('_a')).toEqual('[_a]');
  });

  test('Should leave allowed characters unescaped', () => {
    expect(escapeField('A')).toEqual('A');
    expect(escapeField('ABC')).toEqual('ABC');
    expect(escapeField('ABC123')).toEqual('ABC123');
    expect(escapeField('abc123')).toEqual('abc123');
    expect(escapeField('a1B2c3')).toEqual('a1B2c3');
    expect(escapeField('a_b_c')).toEqual('a_b_c');
    expect(escapeField(']')).toEqual(']');
    expect(escapeField('')).toEqual('');
    expect(escapeField(null)).toEqual(null);
    expect(escapeField(undefined)).toEqual(undefined);
  });
});
