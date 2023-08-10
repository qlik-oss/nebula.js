export default function getListboxActionProps({
  isDetached,
  showToolbar,
  containerRef,
  isLocked,
  listboxSelectionToolbarItems,
  selections,
  keyboard,
  autoConfirm,
}) {
  return {
    autoConfirm,
    show: showToolbar && !isDetached,
    popover: {
      show: showToolbar && isDetached,
      anchorEl: containerRef.current,
    },
    more: {
      enabled: !isLocked,
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
      show: showToolbar,
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
