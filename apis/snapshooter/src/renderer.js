/* eslint no-param-reassign: 0 */
async function renderSnapshot({ embed, element, snapshot: key }) {
  let snapshot = {};
  const renderError = (e) => {
    element.innerHTML = `<p>${e.message}</p>`;
    element.setAttribute('data-njs-error', e.message);
  };
  try {
    snapshot = typeof key === 'string' ? await embed.config.snapshot.get(key) : key;
  } catch (e) {
    renderError(e);
    throw e;
  }

  const {
    meta: { theme, language, appLayout },
    layout,
  } = snapshot;

  const objectModel = (props) => ({
    id: `${+new Date()}-object`,
    async getLayout() {
      return props;
    },
    on() {},
    once() {},
  });

  const app = {
    id: `${+new Date()}-app`,
    createSessionObject: async (props) => objectModel(props),
    async getObject(id) {
      if (id === layout.qInfo.qId) {
        return objectModel(layout);
      }
      return Promise.reject(new Error(`Could not find an object with id: ${id}`));
    },
    getAppLayout: async () => appLayout || {},
  };

  const nebbie = await embed(app, {
    context: {
      theme,
      language,
      // do NOT override constraints to allow the passed in embedding config to control it instead,
      // however, since it's a snapshot the 'select' constraint will always be set to true from
      // the embed internals
      // constraints: {}
    },
  });

  try {
    await nebbie.render(
      layout.qInfo && layout.qInfo.qId
        ? {
            id: layout.qInfo.qId,
            element,
          }
        : {
            type: layout.visualization,
            element,
            properties: layout,
          }
    );
  } catch (e) {
    renderError(e || { message: 'Failed to render visualization.' });
    throw e;
  }
}

export default renderSnapshot;
