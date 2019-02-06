import preact from 'preact';
import Cell from './components/Cell';

import populateData from './populator';

import './components/Style.scss';

// import viz from './viz';

export function boot({
  id,
}, visual, config, nebbie, app) {
  return new config.env.Promise((resolve) => {
    let reference;
    const unmount = () => {
      preact.render('', visual.element, reference);
    };

    const init = (model) => {
      reference = preact.render(
        <Cell
          nebbie={nebbie}
          model={model}
          app={app}
          prom={resolve}
          config={config}
          visual={visual}
          unmount={unmount}
        />,
        visual.element,
      );
      model.once('closed', unmount);
    };

    app.getObject(id).then(init);
  });
}


export function create({
  type,
  version,
}, visual, nebbie, app) {
  const t = nebbie.types.fetch(type, version);
  return t.initialProperties(visual.props)
    .then(properties => t.supernova().then((sn) => {
      if (visual.fields) {
        populateData({
          sn,
          properties,
          fields: visual.fields,
        });
      }

      return app.createSessionObject(properties)
        .then(model => nebbie.get({
          id: model.id,
        }, visual));
    }));
}
