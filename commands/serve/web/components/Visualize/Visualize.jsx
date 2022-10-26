/* eslint no-underscore-dangle:0 */
import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { embed } from '@nebula.js/stardust';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';
import { WbSunny, Brightness3, ColorLens, Language, Home } from '@nebula.js/ui/icons';

import {
  Grid,
  Toolbar,
  Button,
  IconButton,
  Typography,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import initiateWatch from '../../hot';

import Properties from './Properties';
import Stage from './Stage';
import Collection from './Collection';

import AppContext from '../../contexts/AppContext';
import NebulaContext from '../../contexts/NebulaContext';
import VizContext from '../../contexts/VizContext';

import storageFn from '../../storage';
import { useInfo, useOpenApp } from '../../hooks';

const SPACING = 2;

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

export default function Visualize() {
  const uid = useRef();
  const navigate = useNavigate();
  const { info } = useInfo();
  const { waiting, app } = useOpenApp({ info });
  const storage = useMemo(() => storageFn(app), [app]);
  const [activeViz, setActiveViz] = useState(null);
  const [expandedObject, setExpandedObject] = useState(null);
  const [sn, setSupernova] = useState(null);
  const [currentThemeName, setCurrentThemeName] = useState(storage.get('themeName'));
  const [currentLanguage, setCurrentLanguage] = useState(storage.get('language') || 'en-US');
  const [currentMuiThemeName, setCurrentMuiThemeName] = useState('light');
  const [objectListMode, setObjectListMode] = useState(storage.get('objectListMode') === true);
  const currentSelectionsRef = useRef(null);
  const [currentId, setCurrentId] = useState();
  const [themeChooserAnchorEl, setThemeChooserAnchorEl] = React.useState(null);
  const [languageChooserAnchorEl, setLanguageChooserAnchorEl] = React.useState(null);
  const [nebbie, setNebbie] = useState(null);
  const customThemes = info?.themes && info?.themes.length ? ['light', 'dark', ...info?.themes] : [];

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

  useEffect(() => {
    if (info) {
      initiateWatch(info);
    }
  }, [info]);

  useEffect(() => {
    if (waiting) return;
    const n = embed(app, {
      context: {
        theme: currentThemeName,
        language: currentLanguage,
        keyboardNavigation: info?.keyboardNavigation,
      },
      load: (type) => Promise.resolve(window[type.name]),
      flags: info?.flags,
      themes: info?.themes
        ? info?.themes.map((t) => ({
            id: t,
            load: () =>
              fetch(`/theme/${t}`)
                .then((response) => response.json())
                .then((raw) => {
                  setCurrentMuiThemeName(raw.type === 'dark' ? 'dark' : 'light');
                  return raw;
                }),
          }))
        : null,
    });
    n.__DO_NOT_USE__.types.register(info?.supernova);
    if (info?.types) {
      info?.types.forEach((t) => {
        n.__DO_NOT_USE__.types.register(t);
      });
    }

    setNebbie(n);
  }, [app, info, waiting]);

  useLayoutEffect(() => {
    if (!nebbie) return;

    nebbie.context({ theme: currentThemeName });
    if (currentThemeName === 'light' || currentThemeName === 'dark') {
      setCurrentMuiThemeName(currentThemeName);
    }
  }, [nebbie, currentThemeName]);

  useEffect(() => {
    if (!nebbie) return;

    nebbie.selections().then((s) => s.mount(currentSelectionsRef.current));
    window.onHotChange(info?.supernova.name, () => {
      nebbie.__DO_NOT_USE__.types.clearFromCache(info?.supernova.name);
      nebbie.__DO_NOT_USE__.types.register(info?.supernova);

      create();

      nebbie.__DO_NOT_USE__.types
        .get({
          name: info?.supernova.name,
        })
        .supernova()
        .then(setSupernova);
    });

    create();
  }, [nebbie, info]);

  useEffect(() => {
    const unload = () => {
      if (app) app.destroySessionObject(uid.current);
    };
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('beforeunload', unload);
    };
  }, [app]);

  const create = () => {
    if (window[info?.supernova.name]) {
      uid.current = String(Date.now());
      setCurrentId(uid.current);
    }
  };

  const handleThemeChange = (t) => {
    setThemeChooserAnchorEl(null);
    storage.save('themeName', t);
    setCurrentThemeName(t);
  };

  const handleLanguageChange = (lang) => {
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
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <NebulaContext.Provider value={nebbie}>
            <Grid
              container
              wrap="nowrap"
              direction="column"
              style={{ background: theme.palette.background.darkest, height: '100%' }}
              gap={0}
            >
              <Grid item>
                <Toolbar
                  variant="dense"
                  style={{ background: theme.palette.background.paper, boxShadow: theme.shadows[1] }}
                >
                  <Grid container gap={1}>
                    <Grid item container alignItems="center" style={{ width: 'auto' }}>
                      <Grid item>
                        <a href="https://github.com/qlik-oss/nebula.js" target="_blank" rel="noopener noreferrer">
                          <img
                            src="/assets/logo.svg"
                            alt="nebula.js logo"
                            href="https://github.com/qlik-oss/nebula.js"
                            style={{ height: '24px', position: 'relative', top: '2px' }}
                          />
                        </a>
                      </Grid>
                    </Grid>
                    <Grid item container alignItems="center" style={{ width: 'auto' }}>
                      <IconButton title="Home" onClick={() => navigate('/')} size="large">
                        <Home style={{ verticalAlign: 'middle' }} />
                      </IconButton>
                    </Grid>
                    <Grid item xs zeroMinWidth>
                      <Tabs value={objectListMode ? 1 : 0} onChange={handleCreateEditChange} aria-label="Navigation">
                        <Tab label={<Typography>Create</Typography>} value={0} />
                        <Tab label={<Typography>Edit</Typography>} value={1} />
                      </Tabs>
                    </Grid>
                    <Grid item container alignItems="center" style={{ width: 'auto' }}>
                      <Grid item>
                        {customThemes.length ? (
                          <>
                            <IconButton
                              title="Select theme"
                              onClick={(e) => setThemeChooserAnchorEl(e.currentTarget)}
                              size="large"
                            >
                              <ColorLens fontSize="small" />
                            </IconButton>
                            <Menu
                              anchorEl={themeChooserAnchorEl}
                              open={!!themeChooserAnchorEl}
                              keepMounted
                              onClose={() => setThemeChooserAnchorEl(null)}
                            >
                              {customThemes.map((t) => (
                                <MenuItem
                                  key={t}
                                  selected={t === currentThemeName}
                                  onClick={() => handleThemeChange(t)}
                                >
                                  {t}
                                </MenuItem>
                              ))}
                            </Menu>
                          </>
                        ) : (
                          <IconButton title="Toggle light/dark mode" onClick={toggleDarkMode} size="large">
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
                          onClick={(e) => setLanguageChooserAnchorEl(e.currentTarget)}
                        >
                          {currentLanguage}
                        </Button>
                        <Menu
                          anchorEl={languageChooserAnchorEl}
                          open={!!languageChooserAnchorEl}
                          keepMounted
                          onClose={() => setLanguageChooserAnchorEl(null)}
                        >
                          {languages.map((t) => (
                            <MenuItem key={t} selected={t === currentLanguage} onClick={() => handleLanguageChange(t)}>
                              {t}
                            </MenuItem>
                          ))}
                        </Menu>
                      </Grid>
                    </Grid>
                  </Grid>
                </Toolbar>
              </Grid>

              <Grid item style={{ padding: theme.spacing(SPACING / 2, SPACING / 2, 0, SPACING / 2) }}>
                <div ref={currentSelectionsRef} style={{ flex: '0 0 auto', boxShadow: theme.shadows[1] }} />
              </Grid>

              <Grid
                item
                xs
                style={{
                  overflowX: 'hidden',
                  overflowY: 'auto',
                  padding: theme.spacing(0, SPACING / 2, SPACING / 2, SPACING / 2),
                }}
              >
                <VizContext.Provider value={vizContext}>
                  {sn ? (
                    <Grid container wrap="nowrap" style={{ height: '100%' }} gap={SPACING / 2}>
                      <Grid item xs zeroMinWidth>
                        {objectListMode ? (
                          <Collection cache={currentId} types={[info?.supernova.name]} />
                        ) : (
                          <Stage info={info} storage={storage} uid={currentId} />
                        )}
                      </Grid>
                      {activeViz && (
                        <Grid
                          item
                          style={{
                            background: theme.palette.background.paper,
                            overflow: 'hidden auto',
                            marginTop: 48,
                            boxShadow: theme.shadows[1],
                            padding: 0,
                          }}
                        >
                          <Properties
                            sn={sn}
                            viz={activeViz}
                            isTemp={!objectListMode}
                            storage={storage}
                            flags={info?.flags}
                          />
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <Grid container wrap="nowrap" style={{ paddingTop: '48px' }} justifyContent="center">
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
      </StyledEngineProvider>
    </AppContext.Provider>
  );
}
