import { useEffect, useState } from 'react';

export default function useProperties(model) {
  const [properties, setProps] = useState();

  useEffect(() => {
    if (model) {
      const onChanged = () => {
        model.getProperties().then((props) => {
          setProps(props);
        });
      };
      model.on('changed', onChanged);
      onChanged();
      return () => {
        model.removeListener('changed', onChanged);
      };
    }
    return () => {};
  }, [model]);
  return [properties, (p) => model.setProperties(p)];
}
