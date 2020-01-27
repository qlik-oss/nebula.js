import React, { useState, useEffect } from 'react';

import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import Box from '@material-ui/core/Box';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import { info as connectionInfo, connect } from '../connect';
import storageFn from '../storage';

const theme = createTheme('light');
const storage = storageFn({});

function URLInput({ info }) {
  const [url, setUrl] = useState(storage.get('nebula-ws-url') || 'ws://localhost:9076');
  let typedUrl;
  const onKeyDown = e => {
    switch (e.key) {
      case 'Enter':
        typedUrl = e.target.value;
        if (typedUrl === '') {
          typedUrl = url;
        } else {
          storage.save('nebula-ws-url', typedUrl);
          setUrl(typedUrl);
        }
        window.location.href = `${window.location.origin}?engine_url=${typedUrl}`;
        break;
      case 'Escape':
        break;
      default:
        break;
    }
  };
  return (
    <>
      <Box style={{ height: '30vh' }} />
      <Typography variant="h5">Engine WebSocket URL</Typography>
      <Box boxShadow={24}>
        <OutlinedInput autoFocus fullWidth placeholder={url} onKeyDown={onKeyDown} defaultValue={info.engineUrl} />
      </Box>
    </>
  );
}

function AppList({ info }) {
  const [items, setItems] = useState();
  const [err, setError] = useState();
  useEffect(() => {
    connect()
      .then(g => g.getDocList().then(setItems))
      .catch(e => {
        const oops = {
          message: 'Something went wrong, check the console',
          hints: [],
        };
        if (e.target instanceof WebSocket) {
          oops.message = `Connection failed to ${info.engineUrl}`;
          if (!info.webIntegrationId) {
            oops.hints.push('If you are connecting to QCS/QSEoK, make sure to provide a web-integration-id');
          }
          setError(oops);
          return;
        }
        setError(oops);
        console.error(e);
      });
  }, []);

  if (err) {
    return (
      <Paper elevation={24}>
        <Box p={2}>
          <Typography variant="h6" color="error" gutterBottom>
            Error
          </Typography>
          <Typography gutterBottom>{err.message} </Typography>
          {err.hints.map(hint => (
            <Typography key={hint} variant="body2" color="textSecondary">
              {hint}
            </Typography>
          ))}
        </Box>
      </Paper>
    );
  }

  if (!items) {
    return (
      <Grid container align="center" direction="column" spacing={2}>
        <Grid item>
          <CircularProgress size={48} />
        </Grid>
        <Grid item>
          <Typography>Connecting</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Paper elevation={24}>
      {items.length ? (
        <List>
          {items.map(li => (
            <ListItem
              button
              key={li.qDocId}
              component="a"
              href={`/dev/${window.location.search.replace(
                info.engineUrl,
                `${info.engineUrl}/app/${encodeURIComponent(li.qDocId)}`
              )}`}
            >
              <ListItemText primary={li.qTitle} secondary={li.qDocId} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box p={2}>
          <Typography component="span">No apps found</Typography>
        </Box>
      )}
    </Paper>
  );
}

export default function Hub() {
  const [n, setInfo] = useState();
  useEffect(() => {
    connectionInfo.then(setInfo);
  }, []);
  if (!n) {
    return null;
  }
  if (n.enigma.appId) {
    window.location.href = `/dev/${window.location.search}`;
  }
  return (
    <ThemeProvider theme={theme}>
      <Box p={[2, 4]}>
        <Grid container justify="center">
          <Grid item xs style={{ maxWidth: '800px' }}>
            {!n.invalid && n.engineUrl ? <AppList info={n} /> : <URLInput info={n} />}
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
