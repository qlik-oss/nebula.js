import React, {
  useEffect,
  useContext,
  useRef,
  // useState,
} from 'react';

import NebulaContext from '../contexts/NebulaContext';

export default function Chart({ id, onLoad, toggleExpand }) {
  const nebbie = useContext(NebulaContext);
  const el = useRef();
  useEffect(() => {
    const n = nebbie.render({
      id,
      element: el.current,
      options: {
        toggleExpand,
      },
    });
    n.then((viz) => {
      onLoad(viz, el.current);
    });
    return () => {
      n.then((v) => {
        v.destroy();
      });
    };
  }, [id]);

  return (
    <div
      ref={el}
      style={{
        height: '100%',
      }}
    />
  );
}
