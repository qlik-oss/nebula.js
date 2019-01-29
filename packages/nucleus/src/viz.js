import EventEmitter from 'node-event-emitter';

const mixin = (obj) => {
  /* eslint no-param-reassign: 0 */
  Object.keys(EventEmitter.prototype).forEach((key) => {
    obj[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(obj);
  return obj;
};

export default function ({
  app,
  model,
  cell,
} = {}) {
  const api = {
    model,
    app,
    close() {
      cell.unmount();
    },
    // properties(props) {

    // },
    // options(options) {
    //   cell.setState({
    //     options,
    //   });
    //   return api;
    // },
    // context(context) {
    //   cell.setState({
    //     context,
    //   });
    //   return api;
    // },
    set(o) {
      cell.setState(o);
      return api;
    },
    takeSnapshot() {
      return cell.takeSnapshot();
    },
    show() {
      return api;
    },
  };

  mixin(api);

  return api;
}
