import { useState, useEffect } from 'react';
import { getFrequencyMax, needToFetchFrequencyMax } from '../utils/frequencyMaxUtil';

const useFrequencyMax = (app, layout) => {
  const needFetch = needToFetchFrequencyMax(layout);
  const [frequencyMax, setFrequencyMax] = useState();
  const [awaitingFrequencyMax, setAwaitingFrequencyMax] = useState(needFetch);

  useEffect(() => {
    if (!needFetch) {
      return;
    }
    const fetch = async () => {
      const newValue = await getFrequencyMax(layout, app);
      setFrequencyMax(newValue);
      setAwaitingFrequencyMax(false);
    };
    fetch();
  }, [needFetch && layout]);

  return {
    frequencyMax: needFetch ? frequencyMax : layout?.frequencyMax,
    awaitingFrequencyMax,
  };
};

export default useFrequencyMax;
