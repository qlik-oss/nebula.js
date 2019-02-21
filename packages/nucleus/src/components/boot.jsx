import preact from 'preact';
import Cell from './Cell';

import './Style.scss';

export default function boot({
  element,
  model,
}, props, config) {
  const reference = preact.render(
    <Cell
      {...props}
      model={model}
    />,
    element,
  );

  const unmount = () => {
    preact.render('', element, reference);
  };

  const update = (p) => {
    preact.render(<Cell
      {...p}
      model={model}
    />, element, reference);
  };

  model.once('closed', unmount);

  return config.env.Promise.resolve({
    setProps(p) {
      update(p);
    },
    unmount,
    reference,
  });
}
