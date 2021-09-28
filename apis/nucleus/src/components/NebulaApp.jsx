import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';

import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';

import InstanceContext from '../contexts/InstanceContext';
import useAppSelections from '../hooks/useAppSelections';

const NebulaApp = forwardRef(({ initialContext, app }, ref) => {
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

  useImperativeHandle(ref, () => ({
    addComponent(component) {
      setComponents([...components, component]);
    },
    removeComponent(component) {
      const ix = components.indexOf(component);
      if (ix !== -1) {
        components.splice(ix, 1);
        setComponents([...components]);
      }
    },
    setMuiThemeName,
    setContext,
    getAppSelections: () => appSelections,
  }));

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <InstanceContext.Provider value={context}>
          <>{components}</>
        </InstanceContext.Provider>
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

  ReactDOM.render(<NebulaApp ref={appRef} app={app} initialContext={context} />, element, resolveRender);

  const cells = {};

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
      add(component) {
        (async () => {
          await rendered;
          appRef.current.addComponent(component);
        })();
      },
      remove(component) {
        (async () => {
          await rendered;
          appRef.current.removeComponent(component);
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
