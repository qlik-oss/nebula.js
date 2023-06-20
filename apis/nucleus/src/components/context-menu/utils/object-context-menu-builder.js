import Menu from './menu';

const contextMenuBuilderForObject = (obj) => {
  const menu = Menu();
  // Check if obj is valid
  menu.addItem({
    translation: 'contextMenu.cut',
    tid: 'cut',
    icon: 'cut',
    select() {
      console.log('CUT');
      // Execute cut for obj
    },
  });
  menu.addItem({
    translation: 'contextMenu.copy',
    tid: 'copy',
    icon: 'copy',
    select() {
      console.log('COPY');
      // Execute copy for obj
    },
  });

  const canPaste = localStorage['QlikView-clipboard'] && localStorage['QlikView-clipboard'].length > 0;
  if (canPaste) {
    menu.addItem({
      translation: 'contextMenu.paste', // grid.canInsert || cell.object.ext.addChild ?
      tid: 'paste-and-replace',
      icon: 'paste',
      select() {
        console.log('PASTE');
        // pubsub.publish('/activeSheet/pasteObject', cell);
      },
    });
  }

  menu.addItem({
    translation: 'Common.Delete',
    tid: 'delete',
    icon: 'bin',
    select() {
      console.log('DELETE');
      // grid.gridService.removeCell(cell);
    },
  });
  return menu;
};

export default contextMenuBuilderForObject;
