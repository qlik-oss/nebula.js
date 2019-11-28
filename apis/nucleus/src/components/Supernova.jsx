import React, { useState, useEffect, useCallback } from 'react';
import useRect from '../hooks/useRect';

const setStyle = (el, d) => {
  /* eslint-disable no-param-reassign */
  if (d) {
    el.style.width = `${d.width}px`;
    el.style.height = `${d.height}px`;
    el.style.top = `${d.top}px`;
    el.style.left = `${d.left}px`;
  } else {
    el.style.width = undefined;
    el.style.height = '100%';
    el.style.top = undefined;
    el.style.left = undefined;
    el.style.right = undefined;
    el.style.bottom = undefined;
  }
  /* eslint-enable no-param-reassign */
};

const constrainElement = ({ snNode, parentNode, sn, snContext, layout }) => {
  const parentRect = parentNode.getBoundingClientRect();
  const r =
    typeof snContext.logicalSize === 'function' ? snContext.logicalSize(layout, sn) : sn.logicalSize({ layout });
  const logicalSize = r || undefined;
  let width;
  let height;
  let left = 0;
  let top = 0;
  if (r) {
    const parentRatio = parentRect.width / parentRect.height;
    const rRatio = r.width / r.height;

    if (parentRatio > rRatio) {
      // parent is wider -> limit height
      ({ height } = parentRect);
      width = height * rRatio;
      left = (parentRect.width - width) / 2;
      top = 0;
    } else {
      ({ width } = parentRect);
      height = width / rRatio;
      left = 0;
      top = (parentRect.height - height) / 2;
    }
  }
  setStyle(snNode, r ? { left, top, width, height } : undefined);
  return logicalSize;
};

const Supernova = ({ sn, snOptions: options, snContext, layout }) => {
  const { component } = sn;

  const [renderCnt, setRenderCnt] = useState(0);
  const [snRef, snRect, snNode] = useRect();
  const [logicalSize, setLogicalSize] = useState({ width: 0, height: 0 });
  const [parentNode, setParentNode] = useState(null);
  const callbackContainerRef = useCallback(ref => {
    if (!ref) {
      return;
    }
    setParentNode(ref);
  }, []);

  const render = () =>
    component.render({
      layout,
      options,
      context: {
        permissions: (snContext || {}).permissions,
        theme: (snContext || {}).theme,
        rtl: (snContext || {}).rtl,
        localeInfo: (snContext || {}).localeInfo,
        logicalSize,
      },
    });

  // Mount / Unmount / ThemeChanged
  useEffect(() => {
    if (!snNode || !parentNode || !snContext) return undefined;
    setLogicalSize(constrainElement({ snNode, parentNode, sn, snContext, layout }));
    component.created({ options, snContext });
    component.mounted(snNode);
    snContext.theme.on('changed', render);
    return () => {
      component.willUnmount();
      snContext.theme.removeListener('changed', render);
    };
  }, [snNode, parentNode, snContext]);

  // Render
  useEffect(() => {
    if (!snRect) return undefined;
    // Skip render in selections
    if (layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections) return undefined;
    if (renderCnt === 0) {
      if (typeof options.onInitialRender === 'function') {
        options.onInitialRender.call(null);
      }
      render();
      setRenderCnt(renderCnt + 1);
    } else {
      // Debounce render
      const handle = setTimeout(() => {
        render();
        setRenderCnt(renderCnt + 1);
      }, 100);
      return () => clearTimeout(handle);
    }
    return undefined;
  }, [snRect, layout]);
  return (
    <div
      ref={callbackContainerRef}
      data-render-count={renderCnt}
      style={{ position: 'relative', height: '100%' }}
      className="nebulajs-sn"
    >
      <div ref={snRef} />
    </div>
  );
};

export default Supernova;
