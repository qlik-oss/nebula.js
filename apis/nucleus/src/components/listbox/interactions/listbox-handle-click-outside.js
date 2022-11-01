import useClickOutside from '../hooks/useClickOutside';

export default function listboxHandleDeactivate({ element, selections }) {
  const handler = (/* evt */) => {
    // Confirm or cancel selections when clicking outside of its element,
    // but only if selections exist in the viz of the element which was
    // clicked outside of.
    const selectionsExistInThisListbox = selections.isModal();
    if (selectionsExistInThisListbox) {
      selections.confirm();
    }
  };

  useClickOutside({ elements: [element], handler });
}
