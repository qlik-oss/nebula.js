import { shouldDisableSubmitBtn, getFieldPlaceHolder } from '../formUtils';

describe('shouldDisableSubmitBtn()', () => {
  let isCredentialProvided;
  let inputs;
  let fields;

  test('should false since all fields are fullfiled', () => {
    isCredentialProvided = false;
    inputs = { 'engine-websocket-url': true, 'web-integration-id': true };
    fields = ['field#01', 'field#02'];

    const res = shouldDisableSubmitBtn({ isCredentialProvided, inputs, fields });
    expect(res).toBe(false);
  });

  test('should true since fields has less length, means that one field is not filled yet', () => {
    isCredentialProvided = false;
    inputs = { 'engine-websocket-url': true, 'web-integration-id': true };
    fields = ['field#01'];

    const res = shouldDisableSubmitBtn({ isCredentialProvided, inputs, fields });
    expect(res).toBe(true);
  });

  test('should true because credentials provided and input is not filled yet', () => {
    isCredentialProvided = true;
    inputs = { 'engine-websocket-url': false };

    const res = shouldDisableSubmitBtn({ isCredentialProvided, inputs, fields });
    expect(res).toBe(true);
  });

  test('should false because credentials provided and input is filled', () => {
    isCredentialProvided = true;
    inputs = { 'engine-websocket-url': true };

    const res = shouldDisableSubmitBtn({ isCredentialProvided, inputs, fields });
    expect(res).toBe(false);
  });
});

describe('getFieldPlaceHolder()', () => {
  let isCredentialProvided;
  let field;

  test('should return field name since there is no credentials', () => {
    field = 'field#01';
    isCredentialProvided = false;
    expect(getFieldPlaceHolder({ isCredentialProvided, field })).toBe(field);
  });

  test('should return message of you already have its value', () => {
    field = 'field#01';
    isCredentialProvided = true;
    expect(getFieldPlaceHolder({ isCredentialProvided, field })).toBe(
      `You have provided "${field}" through cli or nebula.config.js file already!`
    );
  });
});
