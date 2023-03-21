import React, { useEffect, useState, useContext, useMemo } from 'react';
import useLayout from '../hooks/useLayout';
import getObject from '../object/get-object';
import Cell from './Cell';
import uid from '../object/uid';
import { resolveBgColor, resolveBgImage } from '../utils/background-props';
import InstanceContext from '../contexts/InstanceContext';

/**
 * @interface
 * @extends HTMLElement
 * @experimental
 * @since 3.1.0
 */
const SheetElement = {
  /** @type {'njs-sheet'} */
  className: 'njs-sheet',
};

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
  const [deepHash, setDeepHash] = useState('');

  /// For each object
  useEffect(() => {
    if (layout) {
      const hash = JSON.stringify(layout.cells);
      if (hash === deepHash) {
        return;
      }
      setDeepHash(hash);
      const fetchObjects = async () => {
        /*
          Need to always fetch and evaluate everything as the sheet need to support multiple instances of the same object?
          No, there is no way to add the same chart twice, so the optimization should be worth it.
        */

        // Clear the cell list
        cells.forEach((c) => {
          root.removeCell(c.currentId);
        });

        const lCells = layout.cells;
        // TODO - should try reuse existing objects on subsequent renders
        // Non-id updates should only change the "css"
        const cs = await Promise.all(
          lCells.map(async (c) => {
            let mounted;
            const mountedPromise = new Promise((resolve) => {
              mounted = resolve;
            });

            const cell = cells.find((ce) => ce.id === c.name);
            if (cell) {
              cell.bounds = c.bounds;
              delete cell.mountedPromise;
              return cell;
            }
            const vs = await getObject({ id: c.name }, halo);
            return {
              model: vs.model,
              id: c.name,
              bounds: c.bounds,
              cellRef: React.createRef(),
              currentId: uid(),
              mounted,
              mountedPromise,
            };
          })
        );
        cs.forEach((c) => root.addCell(c.currentId, c.cellRef));
        setCells(cs);
      };
      fetchObjects();
    }
  }, [layout]);

  const cellRenderers = useMemo(
    () =>
      cells
        ? cells.map((c) => getCellRenderer(c, halo, initialSnOptions, initialSnPlugins, initialError, c.mounted))
        : [],
    [cells]
  );

  useEffect(() => {
    const bgComp = layout?.components ? layout.components.find((comp) => comp.key === 'general') : null;
    setBgColor(resolveBgColor(bgComp, halo.public.theme, 'sheet'));
    setBgImage(resolveBgImage(bgComp, halo.app));
  }, [layout, halo.public.theme, halo.app, themeName]);

  /* TODO
    - sheet title + bg + logo etc + as option
    - sheet exposed classnames for theming
  */

  const height = !layout || Number.isNaN(layout.height) ? '100%' : `${Number(layout.height)}%`;
  const promises = cells.map((c) => c.mountedPromise);
  const ps = promises.filter((p) => !!p);
  if (ps.length) {
    Promise.all(promises).then(() => {
      // TODO - correct? Currently called each time a new cell is mounted?
      onMount();
    });
  }
  return (
    <div
      className={SheetElement.className}
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
      {cellRenderers}
    </div>
  );
}

export default Sheet;
