import SessionMock from './mocks/session-mock';
import CreateSessionObjectMock from './mocks/create-session-object-mock';
import GetObjectMock from './mocks/get-object-mock';
import GetAppLayoutMock from './mocks/get-app-layout-mock';

export default function fromGenericObjects(genericObjects, options = {}) {
  const session = new SessionMock();
  const createSessionObject = new CreateSessionObjectMock();
  const getObject = new GetObjectMock(genericObjects, options);
  const getAppLayout = new GetAppLayoutMock();

  const app = {
    id: `app - ${+Date.now()}`,
    session,
    createSessionObject,
    destroySessionObject: async () => {},
    getObject,
    getAppLayout,
  };

  return Promise.resolve(app);
}
