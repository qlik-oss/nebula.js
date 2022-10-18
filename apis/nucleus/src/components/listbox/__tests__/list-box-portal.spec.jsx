import React from 'react';
import renderer from 'react-test-renderer';

describe('ListBoxPortal', () => {
  let sandbox;
  let ListBoxPortal;
  let testRenderer;
  let ListBoxInlineMock;
  let useObjectSelectionsMock;
  let useExistingModel;
  let useOnTheFlyModelMock;

  async function render(content) {
    await renderer.act(async () => {
      testRenderer = renderer.create(content);
    });
    return testRenderer;
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    ListBoxInlineMock = sandbox.stub().returns((options) => <div>{options.model.id}</div>);
    useObjectSelectionsMock = sandbox.stub().returns([{ id: 'objectSelection' }]);
    useExistingModel = sandbox.stub().returns({});
    useOnTheFlyModelMock = sandbox.stub().returns({});

    [{ default: ListBoxPortal }] = aw.mock(
      [
        [require.resolve('../ListBoxInline'), () => ListBoxInlineMock],
        [require.resolve('../../../hooks/useObjectSelections'), () => useObjectSelectionsMock],
        [require.resolve('../hooks/useExistingModel'), () => useExistingModel],
        [require.resolve('../hooks/useOnTheFlyModel'), () => useOnTheFlyModelMock],
        [require.resolve('react-dom'), () => ({ createPortal: (element) => element })],
      ],
      ['../ListBoxPortal']
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('existing generic object', () => {
    it('should get object from app and use as model', async () => {
      const qId = '1337';
      const app = {};
      const elem = ListBoxPortal({ app, qId });
      await render(elem);
      expect(useExistingModel).to.have.been.calledWith({ app, qId, options: {} });
    });

    it('should use provided "sessionModel"', async () => {
      const app = {};
      const options = { sessionModel: {} };
      const elem = ListBoxPortal({ app, options });
      await render(elem);
      expect(useExistingModel).to.have.been.calledWith({
        app,
        options: { sessionModel: options.sessionModel },
        qId: undefined,
      });
    });
  });

  describe('on the fly', () => {
    it('should create session model when providing field name', async () => {
      const fieldIdentifier = 'Alpha';
      const app = {};
      const elem = ListBoxPortal({ app, fieldIdentifier });
      await render(elem);
      expect(useOnTheFlyModelMock).to.have.been.calledWith({ app, fieldIdentifier, stateName: '$', options: {} });
    });

    it('should create session model when providing qLibraryId', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const elem = ListBoxPortal({ app, fieldIdentifier });
      await render(elem);
      expect(useOnTheFlyModelMock).to.have.been.calledWith({ app, fieldIdentifier, stateName: '$', options: {} });
    });
  });

  describe('internal selections Api', () => {
    it('should get selections from useObjectSelections hook', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const options = { sessionModel: {} };
      const elem = ListBoxPortal({ app, fieldIdentifier, options });
      await render(elem);
      expect(useObjectSelectionsMock).to.have.been.calledWith(app, options.sessionModel);
    });
  });

  describe('external selections Api', () => {
    it('should pass in provided selectionApi as "selections" into ListBoxInline', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const options = { selectionsApi: {}, sessionModel: {} };
      const elem = ListBoxPortal({ app, fieldIdentifier, options });
      await render(elem);
      expect(ListBoxInlineMock).to.have.been.calledWith({
        options: { ...options, selections: options.selectionsApi, model: options.sessionModel },
      });
    });
  });
});
