import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ListItemIcon } from '@mui/material';

export default function ContextMenu({ point, handleClose, menuItems, translator }) {
  const { mouseX, mouseY } = point;
  const [currentMenu, setCurrentMenu] = React.useState(menuItems);

  return (
    <Menu
      open={point.mouseX !== -1}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: mouseY, left: mouseX }}
    >
      {currentMenu.items.map((item, index) => (
        <MenuItem
          onClick={() => {
            item.select();
            handleClose();
          }}
          divider={index !== menuItems.items.length}
        >
          {item.getLabel(translator)}
        </MenuItem>
      ))}
    </Menu>
  );
}
