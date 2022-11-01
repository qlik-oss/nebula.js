import useClickOutside from '../hooks/useClickOutside';

export default function listboxHandleDeactivate({ element, selections }) {
  const handler = (/* evt */) => {
    // Confirm or cancel selections when clicking outside of its element,
    // but only if selections exist in the viz of the element which was
    // clicked outside of.
    const selectionsExistInThisListbox = selections.isModal();

    if (selectionsExistInThisListbox) {
      if (selections.canConfirm()) {
        selections.confirm();
      } else {
        selections.cancel();
      }
    }
  };

  useClickOutside({ elements: [element], handler });
}
