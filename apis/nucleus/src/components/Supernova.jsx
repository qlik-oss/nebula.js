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

const imageSizingToCssProperty = {
  originalSize: 'auto auto',
  alwaysFit: 'contain',
  fitWidth: '100% auto',
  fitHeight: 'auto 100%',
  stretchFit: '100% 100%',
  alwaysFill: 'cover',
};

const positionToCss = {
  'top-left': 'top left',
  'top-center': 'top center',
  'top-right': 'top right',
  'center-left': 'center left',
  'center-center': 'center center',
  'center-right': 'center right',
  'bottom-left': 'bottom left',
  'bottom-center': 'bottom center',
  'bottom-right': 'bottom right',
};

// TODO: this needs some proper verification
function getSenseServerUrl(app) {
  let config;
  let wsUrl;
  let protocol;
  let isSecure;

  if (app?.session?.config) {
    config = app.session.config;
    wsUrl = new URL(config.url);

    isSecure = wsUrl.protocol === 'wss:';
    protocol = isSecure ? 'https://' : 'http://';
    return protocol + wsUrl.host;
  }
  return undefined;
}

function getBackgroundPosition(bgComp) {
  let bkgImagePosition = 'center center';
  if (bgComp?.bgImage?.position) {
    bkgImagePosition = positionToCss[bgComp.bgImage.position];
  }
  return bkgImagePosition;
}

function getBackgroundSize(bgComp) {
  let bkgImageSize = imageSizingToCssProperty.originalSize;
  if (bgComp?.bgImage?.sizing) {
    bkgImageSize = imageSizingToCssProperty[bgComp.bgImage.sizing];
  }
  return bkgImageSize;
}

function resolveImageUrl(app, relativeUrl) {
  return relativeUrl ? getSenseServerUrl(app) + relativeUrl : undefined;
}

const resolveBgImage = (bgComp, app) => {
  const bgImageDef = bgComp?.bgImage;

  if (bgImageDef) {
    let url = '';
    if (bgImageDef.mode === 'media') {
      url = bgImageDef?.mediaUrl?.qStaticContentUrl?.qUrl
        ? decodeURIComponent(bgImageDef.mediaUrl.qStaticContentUrl.qUrl)
        : undefined;
      url = resolveImageUrl(app, url);
    }
    if (bgImageDef.mode === 'expression') {
      url = bgImageDef.expressionUrl ? decodeURIComponent(bgImageDef.expressionUrl) : undefined;
    }
    const pos = getBackgroundPosition(bgComp);
    const size = getBackgroundSize(bgComp);

    // TODO: need to resolve the URL by the WS path

    return url ? { url, pos, size } : undefined;
  }
  return undefined;
};

function Supernova({ sn, snOptions: options, snPlugins: plugins, layout, appLayout, halo }) {
  const { component } = sn;

  const { theme: themeName, language, constraints, keyboardNavigation } = useContext(InstanceContext);
  const [renderDebouncer] = useState(() => new RenderDebouncer());
  const [isMounted, setIsMounted] = useState(false);
  const [renderCnt, setRenderCnt] = useState(0);
  const [containerRef, containerRect, containerNode] = useRect();
  const [snNode, setSnNode] = useState(null);
  const [bgImage, setBgImage] = useState(undefined); // {url: "", size: "", pos: ""}

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

  // Resolve Background Image
  useEffect(() => {
    setBgImage(
      resolveBgImage(layout?.components ? layout.components.find((comp) => comp.key === 'general') : null, halo.app)
    );
  }, [layout, halo.app]);

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

  return (
    <div
      ref={containerRef}
      data-render-count={renderCnt}
      style={{
        position: 'relative',
        height: '100%',
        backgroundImage: bgImage && bgImage.url ? `url(${bgImage.url})` : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundSize: bgImage && bgImage.size,
        backgroundPosition: bgImage && bgImage.pos,
      }}
      className={VizElement.className}
    >
      <div ref={snRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />
    </div>
  );
}

export default Supernova;
