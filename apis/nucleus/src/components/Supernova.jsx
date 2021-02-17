import React, { useState, useEffect, useCallback, useContext } from 'react';
import InstanceContext from '../contexts/InstanceContext';
import useRect from '../hooks/useRect';
import RenderDebouncer from '../utils/render-debouncer';

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

  const { theme: themeName, language, constraints, keyboardNavigation } = useContext(InstanceContext);
  const [renderDebouncer] = useState(() => new RenderDebouncer());

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
      renderDebouncer.stop();
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

    renderDebouncer.schedule(() => {
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
      return Promise.resolve(
        component.render({
          layout,
          options,
          plugins,
          embed: halo.public.nebbie,
          context: {
            constraints,
            // halo.public.theme is a singleton so themeName is used as dep to make sure this effect is triggered
            theme: halo.public.theme,
            appLayout,
            keyboardNavigation,

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
        if (renderCnt === 0 && typeof options.onInitialRender === 'function') {
          options.onInitialRender.call(null);
        }
        setRenderCnt(renderCnt + 1);
      });
    });
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
    keyboardNavigation,
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
