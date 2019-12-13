/* eslint no-param-reassign: 0 */
async function renderSnapshot({ nucleus, element }) {
  const params = (() => {
    const opts = {};
    const { pathname } = window.location;
    const am = pathname.match(/\/app\/([^/?&]+)/);
    if (am) {
      opts.app = decodeURIComponent(am[1]);
    }
    window.location.search
      .substring(1)
      .split('&')
      .forEach(pair => {
        const idx = pair.indexOf('=');
        const name = pair.substr(0, idx);
        const value = decodeURIComponent(pair.substring(idx + 1));
        opts[name] = value;
      });

    return opts;
  })();

  let snapshot = {};
  const renderError = e => {
    element.innerHTML = `
    <p>${e.message}</p>
    `;
    element.setAttribute('data-njs-error', e.message);
  };
  try {
    snapshot = await nucleus.config.snapshot.get(params.snapshot);
  } catch (e) {
    renderError(e);
    throw e;
  }

  const {
    meta: { theme, language },
    layout,
  } = snapshot;

  const objectModel = {
    async getLayout() {
      return layout;
    },
    on() {},
    once() {},
  };

  const app = {
    async getObject(id) {
      if (id === layout.qInfo.qId) {
        return objectModel;
      }
      return Promise.reject();
    },
  };

  const nebbie = await nucleus(app, {
    context: {
      theme,
      language,
    },
  });

  nebbie
    .get(
      {
        id: layout.qInfo.qId,
      },
      {
        element,
      }
    )
    .catch(e => {
      renderError(e || { message: 'Failed to render supernova' });
      throw e;
    });
}

export default renderSnapshot;
