import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider, StyledEngineProvider, createGenerateClassName } from '@nebula.js/ui/theme';

import InstanceContext from '../contexts/InstanceContext';
import useAppSelections from '../hooks/useAppSelections';

const NEBULA_VERSION_HASH = process.env.NEBULA_VERSION_HASH || '';

let counter = 0;

const NebulaApp = forwardRef(({ initialContext, app, resolver }, ref) => {
  const [appSelections] = useAppSelections(app);
  const [context, setContext] = useState(initialContext);
  const [muiThemeName, setMuiThemeName] = useState();

  useEffect(() => {
    resolver && resolver();
  });

  const { theme, generator } = useMemo(
    () => ({
      theme: createTheme(muiThemeName),
      generator: createGenerateClassName({
        productionPrefix: `${NEBULA_VERSION_HASH}`,
        disableGlobal: true,
        seed: `njs-${counter++}`,
      }),
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
    <StyledEngineProvider generateClassName={generator} injectFirst>
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
  const root = createRoot(element);

  root.render(<NebulaApp ref={appRef} app={app} initialContext={context} resolver={resolveRender} />);

  // ReactDOM.render(<NebulaApp ref={appRef} app={app} initialContext={context} />, element, resolveRender);

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
