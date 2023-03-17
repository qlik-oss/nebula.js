import { useState, useEffect } from 'react';
import { getFrequencyMax, needToFetchFrequencyMax } from '../utils/frequencyMaxUtil';

const useFrequencyMax = (app, layout) => {
  const [frequencyMax, setFrequencyMax] = useState();

  const needFetch = needToFetchFrequencyMax(layout);

  useEffect(() => {
    if (!needFetch) {
      return;
    }
    const fetch = async () => {
      const newValue = await getFrequencyMax(layout, app);
      setFrequencyMax(newValue);
    };
    fetch();
  }, [needFetch && layout]);

  return needFetch ? frequencyMax : layout?.frequencyMax;
};

export default useFrequencyMax;
