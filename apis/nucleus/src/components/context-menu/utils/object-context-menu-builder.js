import Menu from './menu';
import SupportFunctions from './supportFunctions';

const contextMenuBuilderForObject = ({ app, model, types }) => {
  const menu = Menu();
  // Check if obj is valid
  menu.addItem({
    id: 'cut',
    translation: 'contextMenu.cut',
    tid: 'cut',
    icon: 'cut',
    select() {
      console.log('CUT');
      // Execute cut for obj
    },
  });
  menu.addItem({
    id: 'copy',
    translation: 'contextMenu.copy',
    tid: 'copy',
    icon: 'copy',
    select() {
      console.log('COPY');
      SupportFunctions.copyObject({ app, model });
    },
  });

  const canPaste = localStorage['QlikView-clipboard'] && localStorage['QlikView-clipboard'].length > 0;
  if (canPaste) {
    menu.addItem({
      id: 'paste',
      translation: 'contextMenu.paste', // grid.canInsert || cell.object.ext.addChild ?
      tid: 'paste-and-replace',
      icon: 'paste',
      select() {
        console.log('PASTE');
        SupportFunctions.getPasteObjectData(types).then((props) => {
          console.log(props);
        });
        // pubsub.publish('/activeSheet/pasteObject', cell);
      },
    });
  }

  menu.addItem({
    id: 'delete',
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
