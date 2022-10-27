import identify from '../assets/identify';
import useClickOutside from '../hooks/useClickOutside';

export default function listboxHandleDeactivate({ element, selections, options }) {
  const { hasExternalSelections } = identify({ qId: options.qId, options });

  const handleClickOutside = (/* evt */) => {
    if (hasExternalSelections) {
      // Don't mess with external selection API:s.
      return;
    }

    // Confirm or cancel selections when clicking outside of its element,
    // but only if selections exist in the viz of the element which was
    // clicked outside of.
    const selectionsExistInThisElement = selections.isModal();

    if (selectionsExistInThisElement) {
      if (selections.canConfirm()) {
        selections.confirm();
      } else {
        selections.cancel();
      }
    }
  };

  useClickOutside(element, handleClickOutside);
}
