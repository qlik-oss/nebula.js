import React from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';

export default function boot({
  element,
  model,
}, props, config) {
  ReactDOM.render(
    <Cell
      {...props}
      model={model}
    />,
    element,
  );

  const unmount = () => {
    ReactDOM.unmountComponentAtNode(element);
  };

  const update = (p) => {
    ReactDOM.render(<Cell
      {...p}
      model={model}
    />, element);
  };

  model.once('closed', unmount);

  return config.env.Promise.resolve({
    setProps(p) {
      update(p);
    },
    unmount,
  });
}
