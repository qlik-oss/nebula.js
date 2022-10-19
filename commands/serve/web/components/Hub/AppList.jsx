import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const AppList = ({ info, glob, treatAsDesktop }) => {
  const [items, setItems] = useState();
  const [waiting, setWaiting] = useState(false);

  const checkIfAuthorized = async () => {
    const { isAuthorized } = await (await fetch('/isAuthorized')).json();
    return { isAuthorized };
  };

  const getAppList = async () => {
    const apps = await (await fetch(`/apps`)).json();
    return apps || [];
  };

  useEffect(() => {
    setWaiting(true);
    const searchParam = new URLSearchParams(window.location.search);

    // if is already authorized and does not have "shouldFetchAppList" -> append it to the url
    checkIfAuthorized().then(({ isAuthorized }) => {
      if (isAuthorized && !searchParam.get('shouldFetchAppList')) {
        const url = new URL(window.location.href);
        url.searchParams.append('shouldFetchAppList', true);
        window.location.href = decodeURIComponent(url.toString());
      }
    });

    (searchParam.get('shouldFetchAppList') ? getAppList() : glob.getDocList()).then((apps) => {
      setItems(apps);
      if (apps) setWaiting(false);
    });
  }, [window.location.search, setWaiting]);

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
              href={`/dev/${window.location.search
                .replace(
                  info.engineUrl,
                  `${info.engineUrl}/app/${encodeURIComponent(treatAsDesktop ? li.qDocName : li.qDocId)}`
                )
                .replace('&shouldFetchAppList=true', '')}`}
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
};
export default AppList;
