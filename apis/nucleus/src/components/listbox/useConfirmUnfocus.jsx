import { useRef, useEffect, useState } from 'react';

/**
 * Hook that confirms selection when
 * user interact outside of passed element ref.
 */

export default function useConfirmUnfocus(ref, selections, shouldConfirmOnBlur) {
  const [_isConfirmed, _setIsConfirmed] = useState(false);
  // Wrap state in ref to use inside eventListener callback
  const isConfirmedRef = useRef(_isConfirmed);
  const setIsConfirmed = (c) => {
    isConfirmedRef.current = c;
    _setIsConfirmed(c);
  };

  useEffect(() => {
    if (!shouldConfirmOnBlur) return undefined;

    const handleEvent = (event) => {
      const interactInside = ref.current && ref.current.contains(event.target);
      const isConfirmed = isConfirmedRef.current;
      if (!interactInside && !isConfirmed) {
        selections && selections.confirm.call(selections);
        setIsConfirmed(true);
      } else if (interactInside) {
        setIsConfirmed(false);
      }
    };

    document.addEventListener('mousedown', handleEvent);
    document.addEventListener('keydown', handleEvent);
    return () => {
      document.removeEventListener('mousedown', handleEvent);
      document.removeEventListener('keydown', handleEvent);
    };
  }, [ref, selections, shouldConfirmOnBlur]);
}
