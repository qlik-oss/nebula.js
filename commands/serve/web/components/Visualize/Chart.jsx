import React, {
  useEffect,
  useContext,
  useRef,
  // useState,
} from 'react';

import NebulaContext from '../../contexts/NebulaContext';

export default function Chart({ id, onLoad }) {
  const nebbie = useContext(NebulaContext);
  const el = useRef();
  useEffect(() => {
    const n = nebbie.render({
      id,
      element: el.current,
    });
    n.then((viz) => {
      onLoad(viz, el.current);
    });
    n.then((viz) => {
      viz.on('chartSelected', (chart) => {
        console.log(chart);
      });
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
        backgroundColor: 'white',
      }}
    />
  );
}
