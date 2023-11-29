import React, { useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './ClassNameSetup';

import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';

import InstanceContext from '../contexts/InstanceContext';
import unifyContraintsAndInteractions from '../utils/interactions';
import initModelStore from '../stores/new-model-store';
import initSelectionStore from '../stores/new-selections-store';

const NebulaApp = forwardRef(({ initialContext, renderCallback, modelStore, selectionStore }, ref) => {
  const [context, setContext] = useState(initialContext);
  const [muiThemeName, setMuiThemeName] = useState();

  const { theme } = useMemo(
    () => ({
      theme: createTheme(muiThemeName),
    }),
    [muiThemeName]
  );

  const [components, setComponents] = useState([]);

  // Will be called directly after the first render pass
  // See: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html
  useEffect(() => {
    renderCallback && renderCallback();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setComps(comps) {
        setComponents([...comps]);
      },
      setMuiThemeName,
      setContext: (ctx) =>
        setContext((oldContext) => (JSON.stringify(oldContext) !== JSON.stringify(ctx) ? ctx : oldContext)),
    }),
    []
  );
  if (context) {
    context.modelStore = modelStore;
    context.selectionStore = selectionStore;
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <InstanceContext.Provider value={context}>{components}</InstanceContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
});

export { NebulaApp };

export default function boot({ app, context }) {
  let resolveRender;
  const rendered = new Promise((resolve) => {
    resolveRender = resolve;
  });
  const appRef = React.createRef();
  const element = document.createElement('div');
  element.style.display = 'none';
  element.setAttribute('data-nebulajs-version', process.env.NEBULA_VERSION || '');
  element.setAttribute('data-app-id', app.id);
  document.body.appendChild(element);

  if (context) {
    unifyContraintsAndInteractions(context);
  }

  const modelStore = initModelStore(app.id);
  const selectionStore = initSelectionStore(app.id);

  const root = ReactDOM.createRoot(element);
  root.render(
    <NebulaApp
      ref={appRef}
      initialContext={context}
      renderCallback={resolveRender}
      modelStore={modelStore}
      selectionStore={selectionStore}
    />
  );

  const cells = {};
  const components = [];

  return [
    {
      toggleFocusOfCells(cellIdToFocus) {
        Object.keys(cells).forEach((i) => {
          cells[i].current.toggleFocus(i === cellIdToFocus);
        });
      },
      cells,
      addCell(id, cell) {
        cells[id] = cell;
      },
      removeCell(id) {
        delete cells[id];
      },
      add(component) {
        (async () => {
          await rendered;
          components.push(component);
          appRef.current.setComps(components);
        })();
      },
      remove(component) {
        (async () => {
          await rendered;
          const ix = components.indexOf(component);
          if (ix !== -1) {
            components.splice(ix, 1);
          }
          appRef.current.setComps(components);
        })();
      },
      setMuiThemeName(themeName) {
        (async () => {
          await rendered;
          appRef.current.setMuiThemeName(themeName);
        })();
      },
      context(ctx) {
        (async () => {
          await rendered;
          // Should be done here, unify contraints and interactions
          if (ctx) {
            unifyContraintsAndInteractions(ctx);
          }
          appRef.current.setContext(ctx);
        })();
      },
    },
    modelStore,
    selectionStore,
    appRef,
    rendered,
  ];
}
