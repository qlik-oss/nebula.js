import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function ContextMenu({ point, handleClose, menu, translator }) {
  const { mouseX, mouseY } = point;
  const [levels, setLevels] = React.useState([menu]);
  React.useEffect(() => {
    setLevels([menu]);
  }, [menu]);
  const isSubMenu = (item) => item.hasSubmenu();

  const isMenuTitle = (item) => !item.select && (!item.items || item.items.length === 0);
  const goBack = () => {
    setLevels((prev) => {
      const copy = [...prev];
      copy.pop();
      return copy;
    });
  };
  return (
    <Menu
      open={point.mouseX !== -1}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: mouseY, left: mouseX }}
    >
      {levels.length > 0 &&
        levels[levels.length - 1].items.map((item, index) => {
          switch (true) {
            case isSubMenu(item): {
              return (
                <MenuItem
                  key={item.id}
                  onClick={() => {
                    setLevels((prev) => [...prev, item]);
                  }}
                  divider={index !== levels[levels.length - 1].items.length - 1 || levels.length > 1}
                >
                  {item.getLabel(translator)}
                </MenuItem>
              );
            }
            case isMenuTitle(item): {
              return (
                <MenuItem
                  key={item.id}
                  // Disable pointer
                  divider={index !== levels[levels.length - 1].items.length - 1 || levels.length > 1}
                >
                  {item.getLabel(translator)}
                </MenuItem>
              );
            }
            default:
              return (
                <MenuItem
                  key={item.id}
                  onClick={() => {
                    item.select();
                    handleClose();
                  }}
                  divider={index !== levels[levels.length - 1].items.length - 1 || levels.length > 1}
                >
                  {item.getLabel(translator)}
                </MenuItem>
              );
          }
        })}
      {levels.length > 1 && (
        <MenuItem key="goBack" onClick={goBack}>
          Back
        </MenuItem>
      )}
    </Menu>
  );
}
