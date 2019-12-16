import { modelStore } from '../stores/modelStore';

export default async function createFromDefinition(definition, app) {
  const key = `${app.id}/${JSON.stringify(definition)}`;
  const model = modelStore.get(key) || modelStore.set(key, await app.createSessionObject(definition));
  return model;
}
