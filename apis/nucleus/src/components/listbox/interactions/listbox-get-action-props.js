export default ({ isPopover, showToolbar, containerRef, isLocked, listboxSelectionToolbarItems, selections }) => ({
  show: showToolbar && !isPopover,
  popover: {
    show: showToolbar && isPopover,
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
    onConfirm: () => {},
    onCancel: () => {},
  },
  popoverAnchorOrigin: {
    vertical: 14,
    horizontal: (containerRef.current?.clientWidth ?? 0) - 8,
  },
});
