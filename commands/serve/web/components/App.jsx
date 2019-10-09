import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useMemo,
} from 'react';

import nucleus from '@nebula.js/nucleus';
import snDefinition from 'snDefinition'; // eslint-disable-line

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import {
  createTheme,
  ThemeProvider,
} from '@nebula.js/ui/theme';

import {
  WbSunny,
  Brightness3,
} from '@nebula.js/ui/icons';

import {
  Grid,
  Toolbar,
  Button,
  Divider,
  Switch,
  IconButton,
  Typography,
} from '@nebula.js/ui/components';

import Properties from './Properties';
import Stage from './Stage';
import Collection from './Collection';

import AppContext from '../contexts/AppContext';
import NebulaContext from '../contexts/NebulaContext';
import DirectionContext from '../contexts/DirectionContext';
import VizContext from '../contexts/VizContext';

const rtlShape = {
  size: 'large',
  viewBox: '0 0 20 20',
  d: 'M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4zm12 8l-4-4v3H5v2h12v3l4-4z',
};
const ltrShape = {
  size: 'large',
  viewBox: '0 0 20 20',
  d: 'M10 10v5h2V4h2v11h2V4h2V2h-8C7.79 2 6 3.79 6 6s1.79 4 4 4zm-2 7v-3l-4 4 4 4v-3h12v-2H8z',
};
const directionShape = {
  ltr: ltrShape,
  rtl: rtlShape,
};

const gridShape = {
  on: {
    size: 'large',
    viewBox: '0 0 24 24',
    d: 'M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z',
  },
  off: {
    size: 'large',
    viewBox: '0 0 24 24',
    d: 'M8 4v1.45l2 2V4h4v4h-3.45l2 2H14v1.45l2 2V10h4v4h-3.45l2 2H20v1.45l2 2V4c0-1.1-.9-2-2-2H4.55l2 2H8zm8 0h4v4h-4V4zM1.27 1.27L0 2.55l2 2V20c0 1.1.9 2 2 2h15.46l2 2 1.27-1.27L1.27 1.27zM10 12.55L11.45 14H10v-1.45zm-6-6L5.45 8H4V6.55zM8 20H4v-4h4v4zm0-6H4v-4h3.45l.55.55V14zm6 6h-4v-4h3.45l.55.54V20zm2 0v-1.46L17.46 20H16z',
  },
};

const storageFn = (app) => {
  const stored = window.localStorage.getItem('nebula-dev');
  const parsed = stored ? JSON.parse(stored) : {};
  const appid = app.id;

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
        s.save(`props:${appid}:${name}`, JSON.stringify(v));
        return undefined;
      }
      const p = s.get(`props:${appid}:${name}`);
      return p ? JSON.parse(p) : {};
    },
  };

  return s;
};

export default function App({
  app,
  info,
}) {
  const storage = useMemo(() => storageFn(app), [app]);
  const [activeViz, setActiveViz] = useState(null);
  const [expandedObject, setExpandedObject] = useState(null);
  const [sn, setSupernova] = useState(null);
  const [isReadCacheEnabled, setReadCacheEnabled] = useState(storage.get('readFromCache') !== false);
  const [darkMode, setDarkMode] = useState(storage.get('darkMode') === true);
  const [objectListMode, setObjectListMode] = useState(storage.get('objectListMode') === true);
  const [direction, setDirection] = useState('ltr');
  const currentSelectionsRef = useRef(null);
  const uid = useRef();
  const [currentId, setCurrentId] = useState();

  const themeName = darkMode ? 'dark' : 'light';

  const theme = useMemo(() => createTheme(themeName), [themeName]);

  const vizContext = useMemo(() => ({
    activeViz,
    setActiveViz,
    expandedObject,
    setExpandedObject,
  }), [activeViz, expandedObject]);

  const nebbie = useMemo(() => {
    const n = nucleus(app, {
      load: (type, config) => config.Promise.resolve(window.snDefinition || snDefinition),
      theme: themeName,
      direction,
    });
    n.types.register(info.supernova);
    return n;
  }, [app]);

  useLayoutEffect(() => {
    nebbie.theme(themeName);
  }, [nebbie, theme]);

  useEffect(() => {
    const create = () => {
      uid.current = String(Date.now());
      setCurrentId(uid.current);
    };

    nebbie.types.get({
      name: info.supernova.name,
    }).supernova().then(setSupernova);

    nebbie.selections().mount(currentSelectionsRef.current);
    if (window.hotReload) {
      window.hotReload(() => {
        nebbie.types.clearFromCache(info.supernova.name);
        nebbie.types.register(info.supernova);
        app.destroySessionObject(uid.current).then(create);
      });
    }

    create();

    const unload = () => {
      app.destroySessionObject(uid.current);
    };
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('beforeunload', unload);
    };
  }, []);

  const handleCacheChange = (e) => {
    storage.save('readFromCache', e.target.checked);
    setReadCacheEnabled(e.target.checked);
  };

  const toggleDarkMode = () => {
    storage.save('darkMode', !darkMode);
    setDarkMode(!darkMode);
  };

  const toggleDirection = () => {
    setDirection((dir) => {
      let nextDir;
      if (dir === 'ltr') {
        nextDir = 'rtl';
      } else {
        nextDir = 'ltr';
      }
      document.body.setAttribute('dir', nextDir);
      nebbie.direction(nextDir);
      return nextDir;
    });
  };

  const toggleObjectListMode = () => {
    storage.save('objectListMode', !objectListMode);
    if (!objectListMode) {
      setActiveViz(null);
      setExpandedObject(null);
    }
    setObjectListMode(!objectListMode);
  };

  return (
    <AppContext.Provider value={app}>
      <ThemeProvider theme={theme}>
        <DirectionContext.Provider value={direction}>
          <NebulaContext.Provider value={nebbie}>
            <Grid container wrap="nowrap" direction="column" style={{ background: theme.palette.background.darkest }}>
              <Grid item>
                <Toolbar variant="dense" style={{ background: theme.palette.background.paper }}>
                  <Grid container>
                    <Grid item>
                      <Button variant="outlined" href={window.location.origin}>
                        {/* <IconButton style={{ padding: '0px' }}>
                        <ChevronLeft style={{ verticalAlign: 'middle' }} />
                      </IconButton> */}
                      Go to Hub
                      </Button>
                    </Grid>
                    <Grid item xs />
                    <Grid item>
                      <Grid container>
                        <Grid item>
                          <IconButton title="Toggle get/create objects" onClick={toggleObjectListMode}>
                            {SvgIcon(gridShape[objectListMode ? 'off' : 'on'])}
                          </IconButton>
                        </Grid>
                        <Grid item>
                          <Typography component="span">Cache</Typography>
                          <Switch checked={isReadCacheEnabled} onChange={handleCacheChange} value="isReadFromCacheEnabled" />
                        </Grid>
                        <Grid item>
                          <IconButton title="Toggle light/dark mode" onClick={toggleDarkMode}>
                            {darkMode ? <WbSunny fontSize="small" /> : <Brightness3 fontSize="small" />}
                          </IconButton>
                        </Grid>
                        <Grid item>
                          <IconButton title="Toggle right-to-left/left-to-right" onClick={toggleDirection}>
                            {SvgIcon(directionShape[direction])}
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Toolbar>
                <Divider />
              </Grid>
              <Grid item>
                <div ref={currentSelectionsRef} style={{ flex: '0 0 auto' }} />
                <Divider />
              </Grid>
              <Grid item xs style={{ overflowX: 'hidden', overflowY: 'auto' }}>
                <VizContext.Provider value={vizContext}>
                  <Grid container wrap="nowrap" style={{ height: '100%' }}>
                    <Grid item xs>
                      {objectListMode ? <Collection cache={currentId} types={[info.supernova.name]} /> : <Stage info={info} storage={storage} uid={currentId} /> }
                    </Grid>
                    <Grid item style={{ background: theme.palette.background.paper, overflowY: 'auto' }}>
                      {activeViz && <Properties sn={sn} viz={activeViz} />}
                    </Grid>
                  </Grid>
                </VizContext.Provider>
              </Grid>
            </Grid>
          </NebulaContext.Provider>
        </DirectionContext.Provider>
      </ThemeProvider>
    </AppContext.Provider>
  );
}
