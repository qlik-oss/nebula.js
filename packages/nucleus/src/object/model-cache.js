const cache = {};

export function key(definition, app) {
  return app && `${app.id}:${JSON.stringify(definition)}`;
}

export default function model(definition, app) {
  const k = key(definition, app);
  if (!cache[k]) {
    cache[k] = app.createSessionObject(definition);
  }
  return Promise.resolve(cache[k]);
}
