import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';

import nucleus from '@nebula.js/nucleus/src/index';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';

import { WbSunny, Brightness3, ColorLens, Language } from '@nebula.js/ui/icons';

import {
  Grid,
  Toolbar,
  Button,
  Divider,
  Switch,
  IconButton,
  Typography,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  CircularProgress,
} from '@material-ui/core';

import Properties from './Properties';
import Stage from './Stage';
import Collection from './Collection';

import AppContext from '../contexts/AppContext';
import NebulaContext from '../contexts/NebulaContext';
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

const languages = [
  'en-US',
  'it-IT',
  'zh-CN',
  'zh-TW',
  'ko-KR',
  'de-DE',
  'sv-SE',
  'es-ES',
  'pt-BR',
  'ja-JP',
  'fr-FR',
  'nl-NL',
  'tr-TR',
  'pl-PL',
  'ru-RU',
];

const storageFn = app => {
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

export default function App({ app, info }) {
  const storage = useMemo(() => storageFn(app), [app]);
  const [activeViz, setActiveViz] = useState(null);
  const [expandedObject, setExpandedObject] = useState(null);
  const [sn, setSupernova] = useState(null);
  const [isReadCacheEnabled, setReadCacheEnabled] = useState(storage.get('readFromCache') !== false);
  const [currentThemeName, setCurrentThemeName] = useState(storage.get('themeName'));
  const [currentLanguage, setCurrentLanguage] = useState(storage.get('language') || 'en-US');
  const [currentMuiThemeName, setCurrentMuiThemeName] = useState('light');
  const [objectListMode, setObjectListMode] = useState(storage.get('objectListMode') === true);
  const [direction, setDirection] = useState('ltr');
  const currentSelectionsRef = useRef(null);
  const uid = useRef();
  const [currentId, setCurrentId] = useState();
  const [themeChooserAnchorEl, setThemeChooserAnchorEl] = React.useState(null);
  const [languageChooserAnchorEl, setLanguageChooserAnchorEl] = React.useState(null);

  const customThemes = info.themes && info.themes.length ? ['light', 'dark', ...info.themes] : [];

  const theme = useMemo(() => createTheme(currentMuiThemeName), [currentMuiThemeName]);

  const vizContext = useMemo(
    () => ({
      currentThemeName,
      activeViz,
      setActiveViz,
      expandedObject,
      setExpandedObject,
    }),
    [activeViz, expandedObject, currentThemeName]
  );

  const nebbie = useMemo(() => {
    const n = nucleus(app, {
      context: {
        theme: currentThemeName,
        language: currentLanguage,
      },
      load: type => Promise.resolve(window[type.name]),
      themes: info.themes
        ? info.themes.map(t => ({
            key: t,
            load: () =>
              fetch(`/theme/${t}`)
                .then(response => response.json())
                .then(raw => {
                  setCurrentMuiThemeName(raw.type === 'dark' ? 'dark' : 'light');
                  return raw;
                }),
          }))
        : null,
    });
    n.types.register(info.supernova);
    return n;
  }, [app]);

  useLayoutEffect(() => {
    nebbie.context({ theme: currentThemeName });
    if (currentThemeName === 'light' || currentThemeName === 'dark') {
      setCurrentMuiThemeName(currentThemeName);
    }
  }, [nebbie, currentThemeName]);

  useEffect(() => {
    const create = () => {
      if (window[info.supernova.name]) {
        uid.current = String(Date.now());
        setCurrentId(uid.current);
      }
    };

    nebbie.selections().then(s => s.mount(currentSelectionsRef.current));
    window.onHotChange(info.supernova.name, () => {
      nebbie.types.clearFromCache(info.supernova.name);
      nebbie.types.register(info.supernova);
      if (uid.current) {
        app.destroySessionObject(uid.current).then(create);
      } else {
        create();
      }

      nebbie.types
        .get({
          name: info.supernova.name,
        })
        .supernova()
        .then(setSupernova);
    });

    create();

    const unload = () => {
      app.destroySessionObject(uid.current);
    };
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('beforeunload', unload);
    };
  }, []);

  const handleCacheChange = e => {
    storage.save('readFromCache', e.target.checked);
    setReadCacheEnabled(e.target.checked);
  };

  const handleThemeChange = t => {
    setThemeChooserAnchorEl(null);
    storage.save('themeName', t);
    setCurrentThemeName(t);
  };

  const handleLanguageChange = lang => {
    setLanguageChooserAnchorEl(null);
    storage.save('language', lang);
    setCurrentLanguage(lang);
    nebbie.context({ language: lang });
  };

  const toggleDarkMode = () => {
    const v = currentThemeName === 'dark' ? 'light' : 'dark';
    storage.save('themeName', v);
    setCurrentThemeName(v);
  };

  const toggleDirection = () => {
    setDirection(dir => {
      let nextDir;
      if (dir === 'ltr') {
        nextDir = 'rtl';
      } else {
        nextDir = 'ltr';
      }
      document.body.setAttribute('dir', nextDir);
      return nextDir;
    });
  };

  const handleCreateEditChange = (e, newValue) => {
    const listMode = newValue === 1;
    storage.save('objectListMode', listMode);
    if (listMode) {
      setActiveViz(null);
      setExpandedObject(null);
    }
    setObjectListMode(listMode);
  };

  return (
    <AppContext.Provider value={app}>
      <ThemeProvider theme={theme}>
        <NebulaContext.Provider value={nebbie}>
          <Grid container wrap="nowrap" direction="column" style={{ background: theme.palette.background.darkest }}>
            <Grid item>
              <Toolbar variant="dense" style={{ background: theme.palette.background.paper }}>
                <Grid container>
                  <Grid item container alignItems="center" style={{ width: 'auto' }}>
                    <Button
                      variant="contained"
                      href={`${window.location.origin}?engine_url=${info.engineUrl || ''}${
                        info.webIntegrationId ? `&web-integration-id=${info.webIntegrationId}` : ''
                      }`}
                    >
                      {/* <IconButton style={{ padding: '0px' }}>
                        <ChevronLeft style={{ verticalAlign: 'middle' }} />
                      </IconButton> */}
                      Go to Hub
                    </Button>
                  </Grid>
                  <Grid item xs>
                    <Tabs
                      centered
                      value={objectListMode ? 1 : 0}
                      onChange={handleCreateEditChange}
                      aria-label="simple tabs example"
                    >
                      <Tab label={<Typography>Create</Typography>} value={0} />
                      <Tab label={<Typography>Edit</Typography>} value={1} />
                    </Tabs>
                  </Grid>
                  <Grid item container alignItems="center" style={{ width: 'auto' }}>
                    <Grid item container alignItems="center" style={{ width: 'auto' }}>
                      <Typography component="span">Cache</Typography>
                      <Switch
                        disabled={objectListMode}
                        checked={isReadCacheEnabled}
                        onChange={handleCacheChange}
                        value="isReadFromCacheEnabled"
                      />
                    </Grid>
                    <Grid item>
                      {customThemes.length ? (
                        <>
                          <IconButton title="Select theme" onClick={e => setThemeChooserAnchorEl(e.currentTarget)}>
                            <ColorLens fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={themeChooserAnchorEl}
                            open={!!themeChooserAnchorEl}
                            keepMounted
                            onClose={() => setThemeChooserAnchorEl(null)}
                          >
                            {customThemes.map(t => (
                              <MenuItem key={t} selected={t === currentThemeName} onClick={() => handleThemeChange(t)}>
                                {t}
                              </MenuItem>
                            ))}
                          </Menu>
                        </>
                      ) : (
                        <IconButton title="Toggle light/dark mode" onClick={toggleDarkMode}>
                          {currentThemeName === 'dark' ? (
                            <WbSunny fontSize="small" />
                          ) : (
                            <Brightness3 fontSize="small" />
                          )}
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item>
                      <Button
                        startIcon={<Language />}
                        title="Select language"
                        onClick={e => setLanguageChooserAnchorEl(e.currentTarget)}
                      >
                        {currentLanguage}
                      </Button>
                      <Menu
                        anchorEl={languageChooserAnchorEl}
                        open={!!languageChooserAnchorEl}
                        keepMounted
                        onClose={() => setLanguageChooserAnchorEl(null)}
                      >
                        {languages.map(t => (
                          <MenuItem key={t} selected={t === currentLanguage} onClick={() => handleLanguageChange(t)}>
                            {t}
                          </MenuItem>
                        ))}
                      </Menu>
                    </Grid>
                    <Grid item>
                      <IconButton title="Toggle right-to-left/left-to-right" onClick={toggleDirection}>
                        {SvgIcon(directionShape[direction])}
                      </IconButton>
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
                {sn ? (
                  <Grid container wrap="nowrap" style={{ height: '100%' }}>
                    <Grid item xs>
                      {objectListMode ? (
                        <Collection cache={currentId} types={[info.supernova.name]} />
                      ) : (
                        <Stage info={info} storage={storage} uid={currentId} />
                      )}
                    </Grid>
                    <Grid item style={{ background: theme.palette.background.paper, overflow: 'hidden auto' }}>
                      {activeViz && <Properties sn={sn} viz={activeViz} />}
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container wrap="nowrap" style={{ paddingTop: '48px' }} justify="center">
                    <Grid item>
                      <CircularProgress />
                    </Grid>
                  </Grid>
                )}
              </VizContext.Provider>
            </Grid>
          </Grid>
        </NebulaContext.Provider>
      </ThemeProvider>
    </AppContext.Provider>
  );
}
