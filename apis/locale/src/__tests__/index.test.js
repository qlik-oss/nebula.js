import localeFn from '../index';
import * as TranslatorHelper from '../translator';

describe('locale', () => {
  let translatorMock;

  beforeEach(() => {
    translatorMock = jest.fn();
    jest.spyOn(TranslatorHelper, 'default').mockImplementation(translatorMock);
  });

  test('should initiate translator with en-US locale by default', () => {
    localeFn();
    expect(translatorMock).toHaveBeenCalledWith({ initial: 'en-US', fallback: 'en-US' });
  });

  test('should initiate translator with custom locale', () => {
    localeFn({ initial: 'sv-SE', fallback: 'en-UK' });
    expect(translatorMock).toHaveBeenCalledWith({ initial: 'sv-SE', fallback: 'en-UK' });
  });

  test('should return object containing translator', () => {
    translatorMock.mockReturnValue('t');
    expect(localeFn()).toEqual({
      translator: 't',
    });
  });
});
