import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import PopoverContent from './Content';

export default function Popover({
  onOutside,
  alignTo,
  children,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof onOutside !== 'function') {
      return undefined;
    }
    const outsideEvent = 'ontouchend' in window ? 'touchend' : 'click';
    const out = (e) => {
      const element = ref.current;
      if (element && !element.contains(e.target)) {
        onOutside(e);
      }
    };

    document.addEventListener(outsideEvent, out);
    return () => {
      document.removeEventListener(outsideEvent, out);
    };
  }, [onOutside]);

  return (
    createPortal(
      <div ref={ref}>
        <PopoverContent alignTo={alignTo}>
          {children}
        </PopoverContent>
      </div>,
      document.body,
    )
  );
}
