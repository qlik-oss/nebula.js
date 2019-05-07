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
  Grid,
  Toolbar,
  Button,
  Divider,
} from '@nebula.js/ui/components';

import Properties from './Properties';
import Stage from './Stage';

import AppContext from '../contexts/AppContext';
import NebulaContext from '../contexts/NebulaContext';

const defaultTheme = createTheme();

export default function App({
  app,
  info,
}) {
  const [viz, setViz] = useState(null);
  const [sn, setSupernova] = useState(null);
  const sel = useRef(null);

  const nebbie = useMemo(() => nucleus(app)
    .load((type, config) => config.Promise.resolve(snDefinition)), [app]);

  nebbie.types.supernova(info.supernova.name).then(setSupernova);

  useEffect(() => {
    nebbie.selections().mount(sel.current);
    nebbie.create({
      type: info.supernova.name,
      fields: [],
    }, {
      context: {
        permissions: ['passive', 'interact', 'select', 'fetch'],
      },
      properties: {
        qInfo: {
          qId: '__temporary_nebula__',
          qType: info.supernova.name,
        },
      },
    }).then(setViz);
    const unload = () => {
      app.destroySessionObject('__temporary_nebula__');
    };
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('beforeunload', unload);
    };
  }, []);

  return (
    <AppContext.Provider value={app}>
      <ThemeProvider theme={defaultTheme}>
        <NebulaContext.Provider value={nebbie}>
          <Grid container wrap="nowrap" direction="column">
            <Grid item>
              <Toolbar variant="dense" style={{ background: '#fff' }}>
                <Button variant="outlined" href={window.location.origin}>
                  &lt; Hub
                </Button>
              </Toolbar>
              <Divider />
            </Grid>
            <Grid item>
              <div ref={sel} style={{ flex: '0 0 auto' }} />
              <Divider />
            </Grid>
            <Grid item xs>
              <Grid container style={{ height: '100%' }}>
                <Grid item xs>
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
