import React, { useEffect, useState, useContext } from 'react';
import useLayout from '../hooks/useLayout';
import getObject from '../object/get-object';
import Cell from './Cell';
import uid from '../object/uid';
import { resolveBgColor, resolveBgImage } from '../utils/background-props';
import InstanceContext from '../contexts/InstanceContext';

function getCellRenderer(cell, halo, initialSnOptions, initialSnPlugins, initialError, onMount) {
  const { x, y, width, height } = cell.bounds;
  return (
    <div style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%`, position: 'absolute' }}>
      <Cell
        ref={cell.cellRef}
        halo={halo}
        model={cell.model}
        currentId={cell.currentId}
        initialSnOptions={initialSnOptions}
        initialSnPlugins={initialSnPlugins}
        initialError={initialError}
        onMount={onMount}
      />
    </div>
  );
}

function Sheet({ model, halo, initialSnOptions, initialSnPlugins, initialError, onMount }) {
  const { root } = halo;
  const [layout] = useLayout(model);
  const { theme: themeName } = useContext(InstanceContext);
  const [cells, setCells] = useState([]);
  const [bgColor, setBgColor] = useState(undefined);
  const [bgImage, setBgImage] = useState(undefined);

  /// For each object
  useEffect(() => {
    if (layout) {
      const fetchObjects = async () => {
        const lCells = layout.cells;
        const vs = await Promise.all(lCells.map((c) => getObject({ id: c.name }, halo)));
        // TODO - should try reuse existing objects on subsequent renders
        // Non-id updates should only change the "css"
        const cs = lCells.map((c, i) => {
          let mounted;
          const mountedPromise = new Promise((resolve) => {
            mounted = resolve;
          });
          return {
            model: vs[i].model,
            id: c.name,
            bounds: c.bounds,
            cellRef: React.createRef(),
            currentId: uid(),
            mounted,
            mountedPromise,
          };
        });
        cs.forEach((c) => {
          // TODO - these needs to be removed as well
          root.addCell(c.currentId, c.cellRef);
        });
        setCells(cs);
      };
      fetchObjects();
    }
  }, [layout]);

  useEffect(() => {
    const bgComp = layout?.components ? layout.components.find((comp) => comp.key === 'general') : null;
    setBgColor(resolveBgColor(bgComp, halo.public.theme));
    setBgImage(resolveBgImage(bgComp, halo.app));
  }, [layout, halo.public.theme, halo.app, themeName]);

  /* TODO
    - sheet title + bg + logo etc + as option
    - sheet exposed classnames for theming
  */

  if (cells && cells.length) {
    const height = Number.isNaN(layout.height) ? '100%' : `${Number(layout.height)}%`;
    const promises = cells.map((c) => c.mountedPromise);
    Promise.all(promises).then(() => {
      // TODO - this should only be called once, when all the initial cells has rendered
      onMount();
    });
    return (
      <div
        style={{
          width: `100%`,
          height,
          position: 'relative',
          backgroundColor: bgColor,
          backgroundImage: bgImage && bgImage.url ? `url(${bgImage.url})` : undefined,
          backgroundRepeat: 'no-repeat',
          backgroundSize: bgImage && bgImage.size,
          backgroundPosition: bgImage && bgImage.pos,
        }}
      >
        {cells.map((c) => getCellRenderer(c, halo, initialSnOptions, initialSnPlugins, initialError, c.mounted))}
      </div>
    );
  }

  return layout && layout.qMeta && layout.qMeta.title ? <div>{layout.qMeta.title}</div> : null;
}

export default Sheet;
