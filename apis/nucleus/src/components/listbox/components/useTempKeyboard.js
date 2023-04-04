import { useState } from 'react';
import {
  focusRow,
  focusSearch,
  getVizCell,
  removeInnnerTabStops,
} from '../interactions/listbox-keyboard-navigation-utils';

// Emulate the keyboard hook, until we support it in the Listbox.
export default function useTempKeyboard({ containerRef, enabled }) {
  const [keyboardActive, setKeyboardActive] = useState(false);

  const keyboard = {
    enabled,
    active: keyboardActive,

    // innerTabStops: whether keyboard permits inner tab stops
    // (inner = everything inside .listbox-container)

    innerTabStops: !enabled || keyboardActive,
    blur(resetFocus) {
      if (!enabled) {
        return;
      }
      setKeyboardActive(false);
      const vizCell = getVizCell(containerRef.current) || containerRef.current?.parentElement;
      let elementToFocus;
      removeInnnerTabStops(containerRef.current);
      if (resetFocus === true && vizCell) {
        // Move focus to the viz's cell.
        elementToFocus = vizCell;
      } else if (typeof resetFocus === 'string') {
        elementToFocus = document.querySelector(resetFocus);
      }
      if (elementToFocus) {
        elementToFocus.setAttribute('tabIndex', 0);
        elementToFocus.focus();
      }
    },
    focus() {
      if (!enabled) {
        return;
      }
      setKeyboardActive(true);
      const c = containerRef.current;
      focusSearch(c) || focusRow(c);
    },
    focusSelection() {
      const confirmButton = document.querySelector('.actions-toolbar-default-actions .actions-toolbar-confirm');
      confirmButton?.setAttribute('tabIndex', 0);
      confirmButton?.focus();
    },
  };

  return keyboard;
}
