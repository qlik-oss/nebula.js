import React, { useState, forwardRef, useImperativeHandle } from 'react';
import ListBoxPopover from './ListBoxPopover';

const ListBoxPopoverWrapper = forwardRef(({ app, fieldIdentifier, stateName, element, options = {} }, ref) => {
  const [showState, setShowState] = useState(options.show);

  useImperativeHandle(ref, () => ({
    setShowState,
  }));

  const handleCloseShowState = () => {
    setShowState(false);
    options.onPopoverClose && options.onPopoverClose();
  };

  return (
    <ListBoxPopover
      show={showState}
      app={app}
      alignTo={{ current: element }}
      close={handleCloseShowState}
      fieldName={fieldIdentifier}
      stateName={stateName}
    />
  );
});

export default ListBoxPopoverWrapper;
