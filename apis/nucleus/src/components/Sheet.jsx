import React, { useEffect, useState, useContext, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import EventEmitter from 'node-event-emitter';
import useLayout from '../hooks/useLayout';
import getObject from '../object/get-object';
import Cell from './Cell';
import uid from '../object/uid';
import { resolveBgColor, resolveBgImage } from '../utils/style/styling-props';
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

function getCellRenderer(cell, halo, initialSnOptions, initialSnPlugins, initialError, onMount, navigation, onError) {
  const { x, y, width, height } = cell.bounds;

  const style = { left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%`, position: 'absolute' };
  const flags = halo.public.galaxy?.flags;
  if (flags?.isEnabled('VNA-13_CELLPADDING_FROM_THEME')) {
    style.boxSizing = 'border-box';
    style.padding = '4px';
  }

  const emitter = new EventEmitter();

  return (
    <div style={style} key={cell.model.id}>
      <Cell
        ref={cell.cellRef}
        halo={halo}
        model={cell.model}
        currentId={cell.currentId}
        initialSnOptions={initialSnOptions}
        initialSnPlugins={initialSnPlugins}
        initialError={initialError}
        onMount={onMount}
        emitter={emitter}
        navigation={navigation}
        onError={onError}
      />
    </div>
  );
}

function getBounds(pos, columns, rows) {
  if (pos.bounds) {
    return pos.bounds;
  }
  return {
    y: (pos.row / rows) * 100,
    x: (pos.col / columns) * 100,
    width: (pos.colspan / columns) * 100,
    height: (pos.rowspan / rows) * 100,
  };
}

const Sheet = forwardRef(
  (
    {
      model: inputModel,
      halo,
      initialSnOptions,
      initialSnPlugins,
      initialError,
      onMount,
      unmount,
      navigation,
      onError,
    },
    ref
  ) => {
    const { root } = halo;
    const [model, setModel] = useState(inputModel);
    const [layout] = useLayout(model);
    const { theme: themeName, modelStore } = useContext(InstanceContext);
    const [cells, setCells] = useState([]);
    const [bgColor, setBgColor] = useState(undefined);
    const [bgImage, setBgImage] = useState(undefined);
    const [deepHash, setDeepHash] = useState('');
    const renderState = useRef({ cellCount: 0, cellsRendered: 0, initialRender: false });

    navigation?.setCurrentSheetId?.(model.id);
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
          renderState.cellCount = lCells.length;
          renderState.cellsRendered = 0;

          const renderCallback = () => {
            renderState.cellsRendered++;
            if (renderState.cellsRendered === renderState.cellCount && !renderState.initialRender) {
              renderState.initialRender = true;
              initialSnOptions.onInitialRender();
            }
          };

          const { columns, rows } = layout;
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
                cell.bounds = getBounds(c, columns, rows);
                delete cell.mountedPromise;
                return cell;
              }
              const vs = await getObject({ id: c.name }, halo, modelStore);
              return {
                model: vs.model,
                id: c.name,
                bounds: getBounds(c, columns, rows),
                cellRef: React.createRef(),
                currentId: uid(),
                mounted,
                mountedPromise,
                options: {
                  ...initialSnOptions,
                  ...{
                    onInitialRender: renderCallback,
                  },
                },
              };
            })
          );
          cs.forEach((c) => root.addCell(c.currentId, c.cellRef));
          setCells(cs);
        };
        fetchObjects();
      }
    }, [layout]);

    useEffect(() => {
      const onModelClose = () => {
        model.removeListener('closed', onModelClose);
        unmount();
      };
      model.on('closed', onModelClose);
      return () => model.removeListener('closed', onModelClose);
    }, [model]);

    const cellRenderers = useMemo(
      () =>
        cells
          ? cells.map((c) =>
              getCellRenderer(c, halo, c.options, initialSnPlugins, initialError, c.mounted, navigation, onError)
            )
          : [],
      [cells]
    );

    useEffect(() => {
      const bgComp = layout?.components ? layout.components.find((comp) => comp.key === 'general') : null;
      setBgColor(resolveBgColor(bgComp, halo.public.theme));
      setBgImage(resolveBgImage(bgComp, halo.app));
    }, [layout, halo.public.theme, halo.app, themeName]);

    // Expose sheet ref api
    useImperativeHandle(
      ref,
      () => ({
        setModel,
      }),
      []
    );

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
);

export default Sheet;
