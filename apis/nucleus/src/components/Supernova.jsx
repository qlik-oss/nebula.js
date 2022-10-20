import React, { useState, useEffect, useCallback, useContext } from 'react';
import InstanceContext from '../contexts/InstanceContext';
import useRect from '../hooks/useRect';
import RenderDebouncer from '../utils/render-debouncer';

/**
 * @interface VizElementAttributes
 * @extends NamedNodeMap
 * @property {string} data-render-count
 */

/**
 * @interface
 * @extends HTMLElement
 * @property {VizElementAttributes} attributes
 */
const VizElement = {
  /** @type {'njs-viz'} */
  className: 'njs-viz',
};

function Supernova({ sn, snOptions: options, snPlugins: plugins, layout, appLayout, halo }) {
  const { component } = sn;

  const { theme: themeName, language, constraints, keyboardNavigation } = useContext(InstanceContext);
  const [renderDebouncer] = useState(() => new RenderDebouncer());
  const [isMounted, setIsMounted] = useState(false);
  const [renderCnt, setRenderCnt] = useState(0);
  const [containerRef, containerRect, containerNode] = useRect();
  const [snNode, setSnNode] = useState(null);
  const [bgImage, setBgImage] = useState(undefined);
  const [bgComp, setBgComp] = useState(null);
  const snRef = useCallback((ref) => {
    if (!ref) {
      return;
    }
    setSnNode(ref);
  }, []);

  const resolveBgImage = () => {
    const bgImageDef = bgComp && bgComp.bgImage ? bgComp.bgImage : null;

    if (bgImageDef && bgImageDef.mode === 'media') {
      return bgImageDef.mediaUrl && bgImageDef.mediaUrl.qStaticContentUrl && bgImageDef.mediaUrl.qStaticContentUrl.qUrl
        ? decodeURIComponent(bgImageDef.mediaUrl.qStaticContentUrl.qUrl)
        : undefined;
    }
    if (bgImageDef && bgImageDef.mode === 'expression') {
      return bgImageDef.expressionUrl ? decodeURIComponent(bgImageDef.expressionUrl) : undefined;
    }
    return undefined;
  };

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

  // Resolve Background Image
  useEffect(() => {
    setBgComp(layout && layout.components ? layout.components.find((comp) => comp.key === 'general') : null);
  }, [layout]);

  useEffect(() => {
    setBgImage(resolveBgImage(bgComp));
  }, [bgComp]);

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
      ).then((done) => {
        if (done === false) {
          return;
        }
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

  const imageSizingToCssProperty = {
    originalSize: 'auto auto',
    alwaysFit: 'contain',
    fitWidth: '100% auto',
    fitHeight: 'auto 100%',
    stretchFit: '100% 100%',
    alwaysFill: 'cover',
  };

  function getBackgroundPosition() {
    let bkgImagePosition = 'center center';
    if (bgComp && bgComp.bgImage && bgComp.bgImage.position) {
      bkgImagePosition = bgComp.bgImage.position.replace('-', ' ');
    }
    return bkgImagePosition;
  }

  function getBackgroundSize() {
    let bkgImageSize = imageSizingToCssProperty.originalSize;
    if (bgComp && bgComp.bgImage && bgComp.bgImage.position) {
      bkgImageSize = imageSizingToCssProperty[bgComp.bgImage.sizing];
    }
    return bkgImageSize;
  }

  return (
    <div
      ref={containerRef}
      data-render-count={renderCnt}
      style={{
        position: 'relative',
        height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: getBackgroundSize(),
        backgroundPosition: getBackgroundPosition(),
      }}
      className={VizElement.className}
    >
      <div ref={snRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />
    </div>
  );
}

export default Supernova;
