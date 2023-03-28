import { useState } from 'react';

export function removeInnnerTabStops(container) {
  container?.querySelectorAll('[tabIndex="0"]').forEach((elm) => {
    elm.setAttribute('tabIndex', -1);
  });
}

export function getVizCell(container) {
  return container?.closest('.njs-cell') || container?.closest('.qv-gridcell');
}

// Emulate the keyboard hook, until we support it in the Listbox.
export default function useTempKeyboard({ containerRef, enabled }) {
  const [keyboardActive, setKeyboardActive] = useState(false);

  const innerTabStops = !enabled || keyboardActive;

  const keyboard = {
    enabled,
    active: keyboardActive,
    innerTabStops, // does keyboard permit inner tab stops
    outerTabStops: !innerTabStops, // does keyboard permit outer tab stops
    blur: (resetFocus) => {
      setKeyboardActive(false);
      const vizCell = getVizCell(containerRef.current) || containerRef.current?.parentElement;
      removeInnnerTabStops(containerRef.current);
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
      elementToFocus?.setAttribute('tabIndex', 0);
      elementToFocus?.focus();
    },
    focusSelection: () => {
      const confirmButton = document.querySelector('.actions-toolbar-default-actions .actions-toolbar-confirm');
      confirmButton?.setAttribute('tabIndex', 0);
      confirmButton?.focus();
    },
  };

  return keyboard;
}
