import React from 'react';
import Remove from '@nebula.js/ui/icons/remove';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';

import { goToApp } from '../../../utils';

const ConnectionHistory = ({ info, items, onRemove }) => {
  if (!items.length) return null;

  const checkIfDisabled = (item) => {
    if ((info.isClientIdProvided || info.isWebIntegrationIdProvided) && item.includes('localhost')) return true;
    if (info.isClientIdProvided) {
      if (item.includes('qlik-client-id')) return false;
      return true;
    }
    if (info.isWebIntegrationIdProvided) {
      if (item.includes('qlik-web-integration-id')) return false;
      return true;
    }

    return false;
  };

  return (
    <Box mb={2}>
      <Typography variant="h6">Previous connections</Typography>
      <List>
        {items.map((item) => (
          <ListItem button key={item} component="a" onClick={() => goToApp(item)} disabled={checkIfDisabled(item)}>
            <ListItemText primary={item} />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => onRemove(item)} size="large">
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
