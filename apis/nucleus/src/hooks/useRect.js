import { useState, useCallback, useLayoutEffect } from 'react';

export default function useRect() {
  const [node, setNode] = useState();
  const [rect, setRect] = useState();
  const callbackRef = useCallback((ref) => {
    if (!ref) {
      return;
    }
    setNode(ref);
  }, []);
  const handleResize = () => {
    const { left, top, width, height } = node.getBoundingClientRect();
    setRect({ left, top, width, height });
  };
  useLayoutEffect(() => {
    if (!node) {
      return undefined;
    }
    if (typeof ResizeObserver === 'function') {
      let resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(node);
      return () => {
        resizeObserver.unobserve(node);
        resizeObserver.disconnect(node);
        resizeObserver = null;
      };
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [node]);
  return [callbackRef, rect, node];
}
