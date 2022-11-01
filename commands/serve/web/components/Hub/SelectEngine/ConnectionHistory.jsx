import React from 'react';
import Remove from '@nebula.js/ui/icons/remove';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useRootContext } from '../../../contexts/RootContext';

const ConnectionHistory = () => {
  const navigate = useNavigate();
  const { info, setError, cachedConnectionsData } = useRootContext();

  const checkIfDisabled = (item) => {
    if ((info?.isClientIdProvided || info?.isWebIntegrationIdProvided) && item.includes('localhost')) return true;
    if (info?.isClientIdProvided) {
      if (item.includes('qlik-client-id')) return false;
      return true;
    }
    if (info?.isWebIntegrationIdProvided) {
      if (item.includes('qlik-web-integration-id')) return false;
      return true;
    }

    return false;
  };

  const handleHistoryItemClick = (item) => {
    setError();
    navigate(`/app-list?engine_url=${item.replace('?', '&')}`);
  };

  if (!cachedConnectionsData.cachedConnections.length) return null;

  return (
    <Box mb={2}>
      <Typography variant="h6">Previous connections</Typography>
      <List>
        {cachedConnectionsData.cachedConnections.map((item) => (
          <ListItem
            button
            key={item}
            component="a"
            onClick={() => handleHistoryItemClick(item)}
            disabled={checkIfDisabled(item)}
          >
            <ListItemText primary={item} />
            <ListItemSecondaryAction>
              <IconButton onClick={() => cachedConnectionsData.removeCachedConnection(item)} size="large" edge="end">
                <Remove />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ConnectionHistory;
