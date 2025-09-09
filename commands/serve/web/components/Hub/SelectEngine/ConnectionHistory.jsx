import React from 'react';
import Remove from '@nebula.js/ui/icons/remove';
import { useNavigate } from 'react-router';
import { ListItemButton, ListItemText, List, Typography, Box, IconButton } from '@mui/material';
import { useRootContext } from '../../../contexts/RootContext';
import { checkIfHistoryConnectionDisabled } from '../../../utils';

const ConnectionHistory = () => {
  const navigate = useNavigate();
  const { info, setError, cachedConnectionsData } = useRootContext();

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
          <ListItemButton
            key={item}
            component="a"
            onClick={() => handleHistoryItemClick(item)}
            disabled={checkIfHistoryConnectionDisabled({ item, info })}
          >
            <ListItemText primary={item} />
            <IconButton
              onClick={() => cachedConnectionsData.removeCachedConnection(item)}
              data-testid="close-btn"
              size="large"
              edge="end"
            >
              <Remove />
            </IconButton>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default ConnectionHistory;
