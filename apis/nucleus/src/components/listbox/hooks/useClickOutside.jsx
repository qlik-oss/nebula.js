import { useEffect } from 'react';

export default function useClickOutside(element, handler) {
  const intermediateHandler = (evt) => {
    const isClickOutside = !element.contains(evt.target);
    if (isClickOutside) {
      handler(evt);
    }
  };

  useEffect(() => {
    document.body.addEventListener('click', intermediateHandler);
    return () => {
      document.body.removeEventListener('click', intermediateHandler);
    };
  }, []);
}
