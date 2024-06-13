export default function getListboxActionProps({
  isDetached,
  showToolbar,
  containerRef,
  isLocked,
  isPopover,
  listboxSelectionToolbarItems,
  extraItems,
  selections,
  keyboard,
  autoConfirm,
}) {
  return {
    autoConfirm,
    isDetached,
    show: showToolbar && !isDetached,
    popover: {
      show: showToolbar && isDetached,
      anchorEl: containerRef.current,
    },
    extraItems,
    more: {
      enabled:
        !isLocked &&
        (isPopover || selections.isActive()) &&
        listboxSelectionToolbarItems.filter((item) => item.enabled()).length > 0,
      actions: listboxSelectionToolbarItems,
      popoverProps: {
        elevation: 0,
      },
      popoverPaperStyle: {
        boxShadow: '0 12px 8px -8px rgba(0, 0, 0, 0.2)',
        minWidth: '250px',
      },
    },
    selections: {
      show: showToolbar && selections.isActive(),
      api: selections,
      onConfirm: () => {
        keyboard?.focus();
      },
      onCancel: () => {
        keyboard?.focus();
      },
    },
  };
}
