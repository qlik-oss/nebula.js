const KEYS = Object.freeze({
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  TAB: 9,
  BACKSPACE: 8,
  DELETE: 46,
  ALT: 18,
  CTRL: 17,
  SHIFT: 16,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  HOME: 36,
  END: 35,
  F10: 121,
  A: 65,
  F: 70,
  ZERO: 48,
  NINE: 57,
  NUMPAD_ZERO: 96,
  NUMPAD_NINE: 105,
  SUBTRACTION: 189,
  DECIMAL: 190,
  NUMPAD_DECIMAL: 110,

  isArrow: (key) =>
    key === KEYS.ARROW_UP || key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT,
});

export default KEYS;
