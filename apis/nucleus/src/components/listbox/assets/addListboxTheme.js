const addListboxTheme = (themeApi) => {
  const getListboxStyle = (path, prop) => themeApi.getStyle('object.listBox', path, prop);

  return {
    backgroundColor: getListboxStyle('', 'backgroundColor'),
    title: {
      main: {
        color: getListboxStyle('title.main', 'color'),
        fontSize: getListboxStyle('title.main', 'fontSize'),
        fontFamily: getListboxStyle('title.main', 'fontFamily'),
      },
    },
    content: {
      color: getListboxStyle('content', 'color'),
      fontSize: getListboxStyle('content', 'fontSize'),
      fontFamily: getListboxStyle('content', 'fontFamily'),
    },
  };
};

export default addListboxTheme;
