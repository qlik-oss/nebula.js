import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';

import { createTheme, ThemeProvider, StylesProvider, createGenerateClassName } from '@nebula.js/ui/theme';

import LocaleContext from '../contexts/LocaleContext';
import DirectionContext from '../contexts/DirectionContext';

const THEME_PREFIX = (process.env.NEBULA_VERSION || '').replace(/[.-]/g, '_');

let counter = 0;

const NebulaApp = forwardRef(({ translator }, ref) => {
  const [d, setDirection] = useState();
  const [tn, setThemeName] = useState();
  const { theme, generator } = useMemo(
    () => ({
      theme: createTheme(tn),
      generator: createGenerateClassName({
        productionPrefix: `${THEME_PREFIX}-`,
        disableGlobal: true,
        seed: `nebulajs-${counter++}`,
      }),
    }),
    [tn]
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
    setThemeName(name) {
      setThemeName(name);
    },
    setDirection(dir) {
      setDirection(dir);
    },
  }));

  return (
    <StylesProvider generateClassName={generator}>
      <ThemeProvider theme={theme}>
        <LocaleContext.Provider value={translator}>
          <DirectionContext.Provider value={d}>
            <>{components}</>
          </DirectionContext.Provider>
        </LocaleContext.Provider>
      </ThemeProvider>
    </StylesProvider>
  );
});

export default function boot({ app, theme: themeName = 'light', translator, direction }) {
  let resolveRender;
  const rendered = new Promise(resolve => {
    resolveRender = resolve;
  });
  const appRef = React.createRef();
  const element = document.createElement('div');
  element.style.display = 'none';
  element.setAttribute('data-nebulajs-version', process.env.NEBULA_VERSION || '');
  element.setAttribute('data-app-id', app.id);
  document.body.appendChild(element);

  ReactDOM.render(
    <NebulaApp ref={appRef} themeName={themeName} translator={translator} direction={direction} />,
    element,
    resolveRender
  );

  return {
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
    theme(name) {
      (async () => {
        await rendered;
        appRef.current.setThemeName(name);
      })();
    },
    direction(d) {
      (async () => {
        await rendered;
        appRef.current.setDirection(d);
      })();
    },
  };
}
