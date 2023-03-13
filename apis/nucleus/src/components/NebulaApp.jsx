import React, { useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './ClassNameSetup';

import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';

import InstanceContext from '../contexts/InstanceContext';
import useAppSelections from '../hooks/useAppSelections';

const NebulaApp = forwardRef(({ initialContext, app, renderCallback }, ref) => {
  const [appSelections] = useAppSelections(app);
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
      getAppSelections: () => appSelections,
    }),
    []
  );

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

  const root = ReactDOM.createRoot(element);
  root.render(<NebulaApp ref={appRef} app={app} initialContext={context} renderCallback={resolveRender} />);

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
          appRef.current.setContext(ctx);
        })();
      },
      getAppSelections: async () => {
        await rendered;
        return appRef.current.getAppSelections();
      },
    },
    appRef,
    rendered,
  ];
}
