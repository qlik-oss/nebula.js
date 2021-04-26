import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import InstanceContext from '../contexts/InstanceContext';
import useRect from '../hooks/useRect';

/**
 * @interface
 * @extends HTMLElement
 * @property {string} attributes.data-render-count
 */
const VizElement = {
  /** @type {'njs-viz'} */
  className: 'njs-viz',
};

const Supernova = ({ sn, snOptions: options, snPlugins: plugins, layout, appLayout, halo }) => {
  const { component } = sn;

  const { theme: themeName, language, constraints } = useContext(InstanceContext);
  const renderDebouncer = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [renderCnt, setRenderCnt] = useState(0);
  const [containerRef, containerRect, containerNode] = useRect();
  const [snNode, setSnNode] = useState(null);
  const snRef = useCallback((ref) => {
    if (!ref) {
      return;
    }
    setSnNode(ref);
  }, []);

  // Mount / Unmount
  useEffect(() => {
    if (!snNode) return undefined;
    component.created({ options });
    component.mounted(snNode);
    setIsMounted(true);
    return () => {
      clearTimeout(renderDebouncer.current);
      renderDebouncer.current = null;
      component.willUnmount();
    };
  }, [snNode, component]);

  // Render
  useEffect(() => {
    if (!isMounted || !snNode || !containerRect) {
      return;
    }
    // TODO remove in-selections guard for old component API
    if (!component.isHooked && layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections) {
      return;
    }

    if (renderDebouncer.current) {
      // rendering already scheduled
      return;
    }

    renderDebouncer.current = setTimeout(() => {
      // temporarily map constraints to permissions
      const permissions = [];
      if (!constraints.passive) {
        permissions.push('passive');
      }
      if (!constraints.active) {
        permissions.push('interact');
      }
      if (!constraints.select) {
        permissions.push('select');
      }
      if (halo.app && halo.app.session) {
        permissions.push('fetch');
      }
      Promise.resolve(
        component.render({
          layout,
          options,
          plugins,
          context: {
            constraints,
            // halo.public.theme is a singleton so themeName is used as dep to make sure this effect is triggered
            theme: halo.public.theme,
            appLayout,

            // TODO - remove when old component api is removed
            ...(component.isHooked
              ? {}
              : {
                  logicalSize: sn.logicalSize({ layout }),
                  localeInfo: (appLayout || {}).qLocaleInfo,
                  permissions,
                }),
          },
        })
      ).then(() => {
        renderDebouncer.current = null;
        if (renderCnt === 0 && typeof options.onInitialRender === 'function') {
          options.onInitialRender.call(null);
        }
        setRenderCnt(renderCnt + 1);
      });
    }, 10);
  }, [
    containerRect,
    options,
    plugins,
    snNode,
    containerNode,
    layout,
    appLayout,
    themeName,
    language,
    constraints,
    isMounted,
  ]);

  return (
    <div
      ref={containerRef}
      data-render-count={renderCnt}
      style={{ position: 'relative', height: '100%' }}
      className={VizElement.className}
    >
      <div ref={snRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />
    </div>
  );
};

export default Supernova;
