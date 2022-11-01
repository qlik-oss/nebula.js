import { useEffect } from 'react';

export default function useClickOutside({ elements, handler }) {
  const elementsArrTemp = Array.isArray(elements) ? elements : [elements];
  const elementsArr = elementsArrTemp.filter((elm) => !!elm);
  if (!elementsArr.length) {
    return;
  }
  const intermediateHandler = (evt) => {
    const targetStillExists = document.contains(evt.target);
    const isClickOutside = targetStillExists && !elementsArr.some((element) => element.current?.contains(evt.target));
    if (isClickOutside) {
      handler(evt);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', intermediateHandler);
    document.addEventListener('keydown', intermediateHandler);
    return () => {
      document.removeEventListener('mousedown', intermediateHandler);
      document.removeEventListener('keydown', intermediateHandler);
    };
  }, []);
}
