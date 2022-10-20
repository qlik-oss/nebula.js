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

const ConnectionHistory = ({ items, onRemove }) => {
  if (!items.length) return null;

  return (
    <Box mb={2}>
      <Typography variant="h6">Previous connections</Typography>
      <List>
        {items.map((item) => (
          <ListItem button key={item} component="a" onClick={() => goToApp(item)}>
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
