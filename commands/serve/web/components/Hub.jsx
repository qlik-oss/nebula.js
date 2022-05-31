/* eslint no-nested-ternary: 0 */
import React, { useState, useEffect } from 'react';

import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';
import { Help } from '@nebula.js/ui/icons';
import Remove from '@nebula.js/ui/icons/remove';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { info as connectionInfo, connect } from '../connect';
import storageFn from '../storage';

const storage = storageFn({});
const theme = createTheme('light');
const themeDark = createTheme('dark');

function SelectEngine({ info, children }) {
  const [items, setItems] = useState(storage.get('connections') || []);
  const [showInstructions, setShowInstructions] = useState(!items.length);
  const [goTo] = useState(() => (u) => `${window.location.origin}?engine_url=${u.replace('?', '&')}`);
  let typedUrl;

  const onRemove = (li) => {
    const idx = items.indexOf(li);
    if (li !== -1) {
      const its = items.slice();
      its.splice(idx, 1);
      storage.save('connections', its);
      setItems(its);
    }
  };

  const onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        typedUrl = e.target.value;
        if (typedUrl) {
          window.location.href = goTo(typedUrl.replace('?', '&'));
        }
        break;
      case 'Escape':
        break;
      default:
        break;
    }
  };
  return (
    <>
      <Grid container>
        <Grid item xs>
          <Typography variant="h5" gutterBottom>
            Connect to an engine
          </Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setShowInstructions((s) => !s)} size="small">
            <Help />
          </IconButton>
        </Grid>
      </Grid>

      {items.length ? (
        <>
          <Typography variant="h6">Previous connections</Typography>
          <List>
            {items.map((li) => (
              <ListItem button key={li} component="a" href={goTo(li)}>
                <ListItemText primary={li} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => onRemove(li)} size="large">
                    <Remove />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </>
      ) : null}
      <Typography variant="h6" gutterBottom>
        New connection
      </Typography>
      <OutlinedInput
        autoFocus
        fullWidth
        placeholder="Engine WebSocket URL"
        error={info.invalid}
        onKeyDown={onKeyDown}
        defaultValue={info.engineUrl}
      />

      {children}

      <Collapse in={showInstructions}>
        <Typography variant="h6" gutterBottom style={{ marginTop: '1rem' }}>
          WebSocket URL
        </Typography>
        <Typography variant="body2" paragraph>
          The development server needs to connect to and communicate with the Qlik Associative Engine running within any
          of Qlik&apos;s product offerings. The connection is done through the WebSocket protocol using a WebSocket URL
          format that differs slightly between products. Enter the WebSocket URL that corresponds to the Qlik product
          you are using.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Qlik Cloud Services
        </Typography>
        <Typography variant="body2" paragraph>
          WebSocket URL format:{' '}
          <code>
            wss://&lt;tenant&gt;.&lt;region&gt;.qlikcloud.com?qlik-web-integration-id=&lt;web-integration-id&gt;
          </code>
          <br />
          Example: <code>wss://qlik.eu.qlikcloud.com?qlik-web-integration-id=xxx</code>
          <br />
          <br />
          The <code>qlik-web-integration-id</code> must be present in order for QCS to confirm that the request
          originates from a whitelisted domain.
          <br />
          <br />
          For more info, visit{' '}
          <Link
            color="secondary"
            underline="always"
            href="https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Admin/mc-adminster-web-integrations.htm"
          >
            Managing web integrations
          </Link>
          .
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Qlik Sense Enterprise on Windows
        </Typography>
        <Typography variant="body2" paragraph>
          WebSocket URL format: <code>wss://&lt;sense-host.com&gt;/&lt;virtual-proxy-prefix&gt;</code>
          <br />
          Example: <code>wss://mycompany.com/bi</code>
          <br />
          <br />
          Note that for the Qlik Sense Proxy to allow sessions from this webpage, <code>
            {window.location.host}
          </code>{' '}
          needs to be whitelisted in QMC in your Qlik Sense Enterprise on Windows deployment. In addition, you need to
          enable <i>Has secure attribute</i> and set <i>SameSite attribute</i> to <i>None</i>.
          <br />
          Make sure you are logged in to Qlik Sense in another browser tab.
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Qlik Core
        </Typography>
        <Typography variant="body2" paragraph>
          WebSocket URL format: <code>ws://&lt;host&gt;:&lt;port&gt;</code>
          <br />
          Example: <code>ws://localhost:9076</code>
          <br />
          <br />
          For more info, visit{' '}
          <Link
            color="secondary"
            underline="always"
            href="https://core.qlik.com/services/qix-engine/apis/qix/introduction/#websockets"
          >
            QIX WebSocket Introduction
          </Link>
          .
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Qlik Sense Desktop
        </Typography>
        <Typography variant="body2" paragraph>
          WebSocket URL format: <code>ws://localhost:4848</code>
        </Typography>
      </Collapse>
    </>
  );
}

function AppList({ info, glob, treatAsDesktop }) {
  const [items, setItems] = useState();
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setWaiting(true);
    }, 750);

    glob.getDocList().then((its) => {
      clearTimeout(t);
      setWaiting(false);
      setItems(its);
    });

    return () => {
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Select an app
      </Typography>
      {waiting && <CircularProgress size={32} />}
      {items && items.length > 0 && (
        <List>
          {items.map((li) => (
            <ListItem
              button
              key={li.qDocId}
              component="a"
              href={`/dev/${window.location.search.replace(
                info.engineUrl,
                `${info.engineUrl}/app/${encodeURIComponent(treatAsDesktop ? li.qDocName : li.qDocId)}`
              )}`}
            >
              <ListItemText primary={li.qTitle} secondary={li.qDocId} />
            </ListItem>
          ))}
        </List>
      )}
      {items && !items.length && (
        <Box p={2}>
          <Typography component="span">No apps found</Typography>
        </Box>
      )}
    </>
  );
}

function Err({ e: { message, hints } }) {
  return (
    <>
      <Typography variant="subtitle1" color="error" gutterBottom style={{ marginTop: '1rem' }}>
        {message}
      </Typography>
      {hints.map((hint) => (
        <Typography key={hint} variant="body2">
          {hint}
        </Typography>
      ))}
    </>
  );
}

export default function Hub() {
  const [info, setInfo] = useState();
  const [glob, setGlobal] = useState();
  const [treatAsDesktop, setTreatAsDesktop] = useState(false);
  const [err, setError] = useState();
  const steps = ['Connect to an engine', 'Select an app', 'Develop'];
  const [activeStep, setActiveStep] = useState(0);

  const reset = () => {
    window.location.href = window.location.origin;
  };

  useEffect(() => {
    connectionInfo.then((i) => {
      if (i.enigma.appId) {
        window.location.href = `/dev/${window.location.search}`;
        return;
      }
      setInfo(i);
    });
  }, []);

  useEffect(() => {
    if (!info || !info.engineUrl) {
      return;
    }
    if (info.invalid) {
      setError({
        message: 'Connection failed',
        hints: ['The WebSocket URL is not valid.'],
      });
      return;
    }
    connect()
      .then((g) => {
        if (g.session) {
          g.session.on('notification:OnAuthenticationInformation', (e) => {
            if (e.mustAuthenticate) {
              setError({
                message: 'Could not authenticate.',
                hints: [
                  `In your virtual proxy advanced settings in the QMC, make sure to whitelist ${window.location.host}, ensure "Has secure attribute" is enabled and that "SameSite attribute" is set to "None".`,
                ],
              });
              setGlobal(null);
            }
          });
        }

        setGlobal(g);

        if (!g.getDocList) {
          return;
        }

        setActiveStep(1);
        const conns = storage.get('connections') || [];
        const url = `${info.engineUrl}${
          info.webIntegrationId ? `?qlik-web-integration-id=${info.webIntegrationId}` : ''
        }`;
        if (conns.indexOf(url) === -1) {
          conns.push(url);
          storage.save('connections', conns);
        }
        g.getConfiguration().then((c) => {
          if (c.qFeatures && c.qFeatures.qIsDesktop) {
            setTreatAsDesktop(true);
          }
        });
      })
      .catch((e) => {
        const oops = {
          message: 'Something went wrong, check the devtools console',
          hints: [],
        };
        if (e.target instanceof WebSocket) {
          oops.message = `Connection failed to ${info.engineUrl}`;
          if (/\.qlik[A-Za-z0-9-]+\.com/.test(info.engineUrl) && !info.webIntegrationId) {
            oops.hints.push(
              'If you are connecting to Qlik Cloud Services, make sure to provide a qlik-web-integration-id.'
            );
          }
          setError(oops);
          return;
        }
        setError(oops);
        console.error(e);
      });
  }, [info]);

  if (!info) {
    return null;
  }

  if (info.engineUrl && !(glob || err)) {
    return null;
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Container maxWidth="md">
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themeDark}>
              <Stepper alternativeLabel activeStep={activeStep} style={{ backgroundColor: 'transparent' }}>
                {steps.map((label, i) => (
                  <Step key={label}>
                    {i ? (
                      <StepLabel>{label}</StepLabel>
                    ) : (
                      <StepLabel
                        onClick={glob || err ? reset : null}
                        error={!!err}
                        style={{
                          cursor: glob || err ? 'pointer' : 'default',
                        }}
                      >
                        {label}
                      </StepLabel>
                    )}
                  </Step>
                ))}
              </Stepper>
            </ThemeProvider>
          </StyledEngineProvider>
          <Box p={[2, 2]} m={2} bgcolor="background.paper" boxShadow={24} borderRadius={1}>
            {glob ? (
              glob.status === 401 ? (
                <Typography variant="h5">Connecting...</Typography>
              ) : (
                <AppList info={info} glob={glob} treatAsDesktop={treatAsDesktop} />
              )
            ) : (
              <SelectEngine info={info}>{err && <Err e={err} />}</SelectEngine>
            )}
          </Box>
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
