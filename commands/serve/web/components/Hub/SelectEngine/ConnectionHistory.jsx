import React from 'react';
import Remove from '@nebula.js/ui/icons/remove';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';

const ConnectionHistory = ({ items, onRemove, goTo }) => {
  if (!items.length) return null;

  return (
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
  );
};

export default ConnectionHistory;
