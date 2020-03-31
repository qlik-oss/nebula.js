import { useState, useCallback, useLayoutEffect, useRef } from 'react';

export default function useRect() {
  const [rect, setRect] = useState();
  const ref = useRef();

  const handleResize = useCallback(() => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    setRect({ left, top, width, height });
  }, [ref.current]);

  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    if (typeof ResizeObserver === 'function') {
      let resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(ref.current);
      return () => {
        resizeObserver.unobserve(ref.current);
        resizeObserver.disconnect(ref.current);
        resizeObserver = null;
      };
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref.current]);
  return [ref, rect, ref.current];
}
