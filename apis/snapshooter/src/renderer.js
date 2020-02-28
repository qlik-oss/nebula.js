/* eslint no-param-reassign: 0 */
async function renderSnapshot({ nucleus, element, snapshot: key }) {
  let snapshot = {};
  const renderError = e => {
    element.innerHTML = `<p>${e.message}</p>`;
    element.setAttribute('data-njs-error', e.message);
  };
  try {
    snapshot = typeof key === 'string' ? await nucleus.config.snapshot.get(key) : key;
  } catch (e) {
    renderError(e);
    throw e;
  }

  const {
    meta: { theme, language, appLayout },
    layout,
  } = snapshot;

  const objectModel = props => ({
    id: `${+new Date()}-object`,
    async getLayout() {
      return props;
    },
    on() {},
    once() {},
  });

  const app = {
    id: `${+new Date()}-app`,
    createSessionObject: async props => objectModel(props),
    async getObject(id) {
      if (id === layout.qInfo.qId) {
        return objectModel(layout);
      }
      return Promise.reject(new Error(`Could not find an object with id: ${id}`));
    },
    getAppLayout: async () => appLayout || {},
  };

  const nebbie = await nucleus(app, {
    context: {
      theme,
      language,
      constraints: {
        select: true,
        passive: true,
        active: true,
      },
    },
  });

  try {
    // snapshots should preferrable be rendered based on the snapshot of a specific chart
    // where it should already have a qId
    if (layout.qInfo && layout.qInfo.qId) {
      await nebbie.get(
        {
          id: layout.qInfo.qId,
        },
        {
          element,
        }
      );
    } else {
      // otherwise we need to create an object of a specific type to make sure its
      // initialProperies are generated
      await nebbie.create(
        {
          type: layout.visualization,
        },
        {
          element,
          properties: layout,
        }
      );
    }
  } catch (e) {
    renderError(e || { message: 'Failed to render supernova' });
    throw e;
  }
}

export default renderSnapshot;
