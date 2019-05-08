import React, {
  useEffect,
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

const defaultTheme = createTheme();

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
        s.save(`props:${name}`, JSON.stringify(v));
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
  const currentSelectionsRef = useRef(null);
  const uid = useRef();

  const nebbie = useMemo(() => nucleus(app)
    .load((type, config) => config.Promise.resolve(window.snDefinition || snDefinition)), [app]);

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

  return (
    <AppContext.Provider value={app}>
      <ThemeProvider theme={defaultTheme}>
        <NebulaContext.Provider value={nebbie}>
          <Grid container wrap="nowrap" direction="column">
            <Grid item>
              <Toolbar variant="dense" style={{ background: '#fff' }}>
                <Grid container>
                  <Grid item>
                    <Button variant="outlined" href={window.location.origin}>
                      <ChevronLeft />
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
                <Grid item style={{ background: '#fff' }}>
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
