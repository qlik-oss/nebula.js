import EventEmitter from 'node-event-emitter';

export default function(obj) {
  /* eslint no-param-reassign: 0 */
  Object.keys(EventEmitter.prototype).forEach(key => {
    obj[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(obj);
  return obj;
}
