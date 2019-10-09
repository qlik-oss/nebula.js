import React, {
  useEffect,
  useState,
  useContext,
} from 'react';
import { observe } from '@nebula.js/nucleus/src/object/observer';

import Cell from './Cell';
import NebulaContext from '../contexts/NebulaContext';
import VizContext from '../contexts/VizContext';

export default function Stage({
  info,
  storage,
  uid,
}) {
  const nebbie = useContext(NebulaContext);
  const [model, setModel] = useState(null);

  const { setActiveViz } = useContext(VizContext);

  useEffect(() => {
    let propertyObserver = () => {};
    let m;
    if (!uid) {
      return undefined;
    }
    nebbie.create({
      type: info.supernova.name,
    }, {
      context: {
        permissions: ['passive', 'interact', 'select', 'fetch'],
      },
      properties: {
        ...(storage.get('readFromCache') !== false ? storage.props(info.supernova.name) : {}),
        qInfo: {
          qId: uid,
          qType: info.supernova.name,
        },
      },
    }).then((v) => {
      setModel(v.model);
      setActiveViz(v);
      m = v.model;
      propertyObserver = observe(v.model, (p) => {
        storage.props(info.supernova.name, p);
      }, 'properties');
    });

    return () => {
      m && m.emit('close');
      propertyObserver();
    };
  }, [uid]);

  if (!model) {
    return null;
  }

  return (
    <div style={{ padding: '12px', height: '100%', boxSizing: 'border-box' }}>
      <Cell id={model.id} />
    </div>
  );
}
