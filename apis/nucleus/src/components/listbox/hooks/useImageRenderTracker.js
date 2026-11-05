import { useCallback, useRef, useState } from 'react';

/**
 * Tracks in-flight image loads for image-representation listboxes so the listbox doesn't signal
 * "rendered" (consumed by snapshot/export tooling via the mount() promise) before the currently
 * visible cell images have actually finished loading.
 */
export default function useImageRenderTracker() {
  const pendingCountRef = useRef(0);
  const [hasPendingImages, setHasPendingImages] = useState(false);

  const registerImageLoading = useCallback(() => {
    pendingCountRef.current += 1;
    setHasPendingImages(true);
  }, []);

  const resolveImageLoading = useCallback(() => {
    pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
    if (pendingCountRef.current === 0) {
      setHasPendingImages(false);
    }
  }, []);

  // Live count, read synchronously after cells commit (hasPendingImages only re-renders on 0<->1 transitions).
  const getPendingImageCount = useCallback(() => pendingCountRef.current, []);

  return { hasPendingImages, registerImageLoading, resolveImageLoading, getPendingImageCount };
}
