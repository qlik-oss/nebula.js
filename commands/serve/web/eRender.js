import nucleus from '@nebula.js/nucleus';
import snDefinition from 'snDefinition'; // eslint-disable-line

import {
  openApp,
  params,
  info as serverInfo,
} from './connect';

function renderWithEngine() {
  if (!params.app) {
    location.href = location.origin; //eslint-disable-line
  }

  serverInfo.then((info) => openApp(params.app).then((app) => {
    let obj;
    let objType;

    const nebbie = nucleus.configured({
      types: [{
        name: info.supernova.name,
      }],
    })(app, {
      load: (type, config) => {
        objType = type.name;
        return config.Promise.resolve(snDefinition);
      },
    });

    const create = () => {
      obj = nebbie.create({
        type: info.supernova.name,
        fields: params.cols || [],
      }, {
        element: document.querySelector('#chart-container'),
        context: {
          permissions: params.permissions || [],
        },
      });
    };

    const get = () => {
      obj = nebbie.get({
        id: params.object,
      }, {
        element: document.querySelector('#chart-container'),
        context: {
          permissions: params.permissions || [],
        },
      });
    };

    const render = () => {
      if (params.object) {
        get();
      } else {
        create();
      }
    };

    render();

    if (module.hot) {
      module.hot.accept('snDefinition', () => {
        nebbie.types.clearFromCache(objType);
        obj.then((viz) => {
          viz.close();
          render();
        });
      });
    }
  }));
}

function renderSnapshot() {
  document.querySelector('#chart-container').classList.toggle('full', true);
  fetch(`/snapshot/${params.snapshot}`).then((response) => response.json()).then((snapshot) => {
    serverInfo.then((info) => {
      const layout = {
        ...snapshot.layout,
        visualization: info.supernova.name,
      };

      const objectModel = {
        getLayout() {
          return Promise.resolve(layout);
        },
        on() {},
        once() {},
      };

      const app = {
        getObject(id) {
          if (id === layout.qInfo.qId) {
            return Promise.resolve(objectModel);
          }
          return Promise.reject();
        },
      };

      const nebbie = nucleus.configured({
        types: [{
          name: info.supernova.name,
          load() {
            return Promise.resolve(snDefinition);
          },
        }],
      })(app);

      nebbie.get({
        id: layout.qInfo.qId,
      }, {
        element: document.querySelector('#chart-container'),
        context: {
          permissions: ['passive'],
        },
        options: {
          onInitialRender() {
            document.querySelector('.nebulajs-sn').setAttribute('data-rendered', '1');
          },
        },
      });
    });
  });
}

if (params.snapshot) {
  renderSnapshot();
} else {
  renderWithEngine();
}
