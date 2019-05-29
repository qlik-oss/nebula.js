import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useMemo,
} from 'react';

import nucleus from '@nebula.js/nucleus';
import snDefinition from 'snDefinition'; // eslint-disable-line

import {
  createTheme,
  ThemeProvider,
} from '@nebula.js/ui/theme';

import {
  ChevronLeft,
  WbSunny,
  Brightness3,
} from '@nebula.js/ui/icons';

import {
  Grid,
  Toolbar,
  Button,
  Divider,
  Switch,
  FormControlLabel,
} from '@nebula.js/ui/components';

import { observe } from '@nebula.js/nucleus/src/object/observer';

import Properties from './Properties';
import Stage from './Stage';

import AppContext from '../contexts/AppContext';
import NebulaContext from '../contexts/NebulaContext';

const storage = (() => {
  const stored = window.localStorage.getItem('nebula-dev');
  const parsed = stored ? JSON.parse(stored) : {};

  const s = {
    save(name, value) {
      parsed[name] = value;
      window.localStorage.setItem('nebula-dev', JSON.stringify(parsed));
    },
    get(name) {
      return parsed[name];
    },
    props(name, v) {
      if (v) {
        s.save(`props:${name}`, JSON.stringify(v)); // TODO add app id to key to avoid using fields that don't exist
        return undefined;
      }
      const p = s.get(`props:${name}`);
      return p ? JSON.parse(p) : {};
    },
  };

  return s;
})();

export default function App({
  app,
  info,
}) {
  const [viz, setViz] = useState(null);
  const [sn, setSupernova] = useState(null);
  const [isReadCacheEnabled, setReadCacheEnabled] = useState(storage.get('readFromCache') !== false);
  const [darkMode, setDarkMode] = useState(storage.get('darkMode') === true);
  const currentSelectionsRef = useRef(null);
  const uid = useRef();

  const themeName = darkMode ? 'dark' : 'light';

  const theme = useMemo(() => createTheme(themeName), [themeName]);

  const nebbie = useMemo(() => nucleus(app)
    .load((type, config) => config.Promise.resolve(window.snDefinition || snDefinition)), [app]);

  useLayoutEffect(() => {
    nebbie.theme(themeName);
  }, [nebbie, theme]);

  useEffect(() => {
    let propertyObserver = () => {};

    const create = () => {
      uid.current = String(Date.now());
      nebbie.create({
        type: info.supernova.name,
      }, {
        context: {
          permissions: ['passive', 'interact', 'select', 'fetch'],
        },
        properties: {
          ...(storage.get('readFromCache') !== false ? storage.props(info.supernova.name) : {}),
          qInfo: {
            qId: uid.current,
            qType: info.supernova.name,
          },
        },
      }).then((v) => {
        setViz(v);
        propertyObserver = observe(v.model, (p) => {
          storage.props(info.supernova.name, p);
        }, 'properties');
      });
    };

    nebbie.types.supernova(info.supernova.name).then(setSupernova);
    nebbie.selections().mount(currentSelectionsRef.current);
    if (window.hotReload) {
      window.hotReload(() => {
        propertyObserver();
        nebbie.types.clearFromCache(info.supernova.name);
        app.destroySessionObject(uid.current).then(create);
      });
    }

    create();

    const unload = () => {
      app.destroySessionObject(uid.current);
    };
    window.addEventListener('beforeunload', unload);
    return () => {
      propertyObserver();
      window.removeEventListener('beforeunload', unload);
    };
  }, []);

  const handleCacheChange = (e) => {
    storage.save('readFromCache', e.target.checked);
    setReadCacheEnabled(e.target.checked);
  };

  const handleThemeChange = (e) => {
    storage.save('darkMode', e.target.checked);
    setDarkMode(e.target.checked);
  };

  return (
    <AppContext.Provider value={app}>
      <ThemeProvider theme={theme}>
        <NebulaContext.Provider value={nebbie}>
          <Grid container wrap="nowrap" direction="column" style={{ background: theme.palette.background.darkest }}>
            <Grid item>
              <Toolbar variant="dense" style={{ background: theme.palette.background.paper }}>
                <Grid container>
                  <Grid item>
                    <Button variant="outlined" href={window.location.origin}>
                      <ChevronLeft style={{ marginLeft: -theme.spacing(1 * 1.5) }} />
                      Hub
                    </Button>
                  </Grid>
                  <Grid item xs />
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Switch checked={isReadCacheEnabled} onChange={handleCacheChange} value="isReadFromCacheEnabled" />
                      }
                      label="Cache"
                    />
                    <FormControlLabel
                      label=""
                      control={(
                        <>
                          <WbSunny fontSize="small" style={{ color: theme.palette.text.secondary, marginLeft: theme.spacing(2) }} />
                          <Switch checked={darkMode} onChange={handleThemeChange} value="darkMode" />
                          <Brightness3 fontSize="small" style={{ color: theme.palette.text.secondary }} />
                        </>
                      )}
                    />
                  </Grid>
                </Grid>
              </Toolbar>
              <Divider />
            </Grid>
            <Grid item>
              <div ref={currentSelectionsRef} style={{ flex: '0 0 auto' }} />
              <Divider />
            </Grid>
            <Grid item xs>
              <Grid container wrap="nowrap" style={{ height: '100%' }}>
                <Grid item xs style={{ overflow: 'hidden' }}>
                  <Stage viz={viz} />
                </Grid>
                <Grid item style={{ background: theme.palette.background.paper }}>
                  <Properties sn={sn} viz={viz} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </NebulaContext.Provider>
      </ThemeProvider>
    </AppContext.Provider>
  );
}
