import { useState } from 'react';

export function removeInnnerTabStops(container) {
  container?.querySelectorAll('[tabIndex="0"]').forEach((elm) => {
    elm.setAttribute('tabIndex', -1);
  });
}

export function removeLastFocused(container) {
  container?.querySelectorAll('.last-focused').forEach((elm) => {
    elm.classList.remove('last-focused');
  });
}

export function getVizCell(container) {
  return container?.closest('.njs-cell') || container?.closest('.qv-gridcell');
}

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
      removeInnnerTabStops(containerRef.current);
      removeLastFocused(containerRef.current);
      if (resetFocus && vizCell) {
        // Move focus to the viz's cell.
        vizCell.setAttribute('tabIndex', -1);
        vizCell.focus();
      }
    },
    focus() {
      if (!enabled) {
        return;
      }
      setKeyboardActive(true);
      const c = containerRef.current;
      const searchField = c?.querySelector('.search input');
      const lastSelectedRow = c?.querySelector('.value.last-focused');
      const fieldElement = c?.querySelector('.value.selector, .value, .ActionsToolbar-item button');

      const elementToFocus = searchField || lastSelectedRow || fieldElement;
      elementToFocus?.setAttribute('tabIndex', -1);
      elementToFocus?.focus();
    },
    focusSelection() {
      const confirmButton = document.querySelector('.actions-toolbar-default-actions .actions-toolbar-confirm');
      confirmButton?.setAttribute('tabIndex', -1);
      confirmButton?.focus();
    },
  };

  return keyboard;
}
