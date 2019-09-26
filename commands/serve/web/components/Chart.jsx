import React, {
  useEffect,
  useContext,
  useRef,
  // useState,
} from 'react';

import NebulaContext from '../contexts/NebulaContext';

export default function Chart({
  id,
  // onSelected,
}) {
  const nebbie = useContext(NebulaContext);
  const el = useRef();
  useEffect(() => {
    const n = nebbie.get({
      id,
    }, {
      context: {
        permissions: ['passive', 'interact', 'select', 'fetch'],
      },
      element: el.current,
    });
    return () => {
      n.then((v) => {
        v.close();
        // v.unmount();
      });
    };
  }, [id]);

  return (
    <div
      ref={el}
      // onClick={() => onSelected(viz)}
      style={{
        height: '100%',
      }}
    />
  );
}
