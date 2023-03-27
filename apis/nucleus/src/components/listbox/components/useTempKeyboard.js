import { useState } from 'react';

// Emulate the keyboard hook, until we support it in the Listbox.
export default function useTempKeyboard({ containerRef, enabled }) {
  const [keyboardActive, setKeyboardActive] = useState(false);

  const keyboard = {
    enabled, // this will be static until we can access the useKeyboard hook
    active: keyboardActive,
    blur: (resetFocus) => {
      setKeyboardActive(false);
      const vizCell = containerRef.current?.closest('.njs-cell') || containerRef.current.closest('.qv-gridcell');
      if (resetFocus && vizCell) {
        // Move focus to the viz's cell.
        vizCell.setAttribute('tabIndex', 0);
        vizCell.focus();
      }
    },
    focus: () => {
      setKeyboardActive(true);
      const searchField = containerRef.current.querySelector('.search input');
      const lastSelectedRow = containerRef.current.querySelector('.value.last-focused');
      const fieldElement =
        searchField || containerRef.current.querySelector('.value.selector, .value, .ActionsToolbar-item button');

      const elementToFocus = searchField || lastSelectedRow || fieldElement;
      elementToFocus.focus();
    },
    focusSelection: () => {
      const confirmButton = document.querySelector('.actions-toolbar-default-actions .actions-toolbar-confirm');
      confirmButton?.focus();
    },
  };

  return keyboard;
}
