import { useEffect } from 'react';

export default function useClickOutside({ elements, handler }) {
  const elementsArr = Array.isArray(elements) ? elements : [elements];
  const intermediateHandler = (evt) => {
    const targetStillExists = document.body.contains(evt.target);
    const isClickOutside = targetStillExists && !elementsArr.some((element) => element.contains(evt.target));
    if (isClickOutside) {
      handler(evt);
    }
  };

  useEffect(() => {
    document.body.addEventListener('click', intermediateHandler);
    document.body.addEventListener('mousedown', intermediateHandler);
    return () => {
      document.body.removeEventListener('click', intermediateHandler);
      document.body.removeEventListener('mousedown', intermediateHandler);
    };
  }, []);
}
