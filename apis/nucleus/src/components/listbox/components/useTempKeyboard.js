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
  const keyboard = {
    enabled,
    active: false,
  };

  Object.assign(keyboard, {
    /**
     * innerTabStops: whether keyboard permits inner tab stops
     *  (inner = everything inside .listbox-container)
     */
    innerTabStops: !enabled || keyboard.active,
    blur(resetFocus) {
      if (!enabled) {
        return;
      }
      keyboard.active = false;
      const vizCell = getVizCell(containerRef.current) || containerRef.current?.parentElement;
      removeInnnerTabStops(containerRef.current);
      removeLastFocused(containerRef.current);
      if (resetFocus && vizCell) {
        // Move focus to the viz's cell.
        vizCell.setAttribute('tabIndex', 0);
        vizCell.focus();
      }
    },
    focus() {
      if (!enabled) {
        return;
      }
      keyboard.active = true;
      const c = containerRef.current;
      const searchField = c?.querySelector('.search input');
      const lastSelectedRow = c?.querySelector('.value.last-focused');
      const fieldElement = c?.querySelector('.value.selector, .value, .ActionsToolbar-item button');

      const elementToFocus = searchField || lastSelectedRow || fieldElement;
      elementToFocus?.setAttribute('tabIndex', 0);
      elementToFocus?.focus();
    },
    focusSelection() {
      const confirmButton = document.querySelector('.actions-toolbar-default-actions .actions-toolbar-confirm');
      confirmButton?.setAttribute('tabIndex', 0);
      confirmButton?.focus();
    },
  });

  return keyboard;
}
