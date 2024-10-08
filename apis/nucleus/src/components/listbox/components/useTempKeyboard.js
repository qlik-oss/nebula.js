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
  return container?.closest('.njs-cell') || container?.closest('.qv-gridcell') || container?.closest('.qv-gs-listbox');
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
        vizCell.setAttribute('tabIndex', 0);
        containerRef.current.setAttribute('tabIndex', -1);
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
      const firstRowElement = c?.querySelector('.value.selector, .value');
      const confirmButton = c?.querySelector('.actions-toolbar-default-actions .actions-toolbar-confirm');
      const unlockCoverButton = c?.querySelector('#listbox-unlock-button');
      const cyclicButton = c?.querySelector('.listbox-cyclic-button');
      const elementToFocus =
        cyclicButton || searchField || lastSelectedRow || firstRowElement || unlockCoverButton || confirmButton;
      elementToFocus?.setAttribute('tabIndex', 0);
      elementToFocus?.focus();
    },
    focusSelection() {
      const unlockCoverButton = document.querySelector('#listbox-unlock-button');
      const confirmButton = document.querySelector(
        '.actions-toolbar-default-actions .actions-toolbar-confirm:not(:disabled)'
      );
      const btnToFocus = unlockCoverButton || confirmButton;
      btnToFocus?.setAttribute('tabIndex', 0);
      btnToFocus?.focus();
      return btnToFocus;
    },
  };

  return keyboard;
}
