import createSelections from '../selections';

describe('supernova-wrapper', () => {
  describe('selections', () => {
    let selectionsApi;
    let backendApi;
    let selections;

    beforeEach(() => {
      selectionsApi = {
        activated: sinon.stub(),
        deactivated: sinon.stub(),
      };
      backendApi = {
        beginSelections: sinon.stub(),
        endSelections: sinon.stub(),
        model: {
          resetMadeSelections: sinon.stub(),
          app: {
            switchModalSelection: sinon.stub(),
          },
        },
      };
      selections = createSelections({ selectionsApi, backendApi });
      selections.emit = sinon.stub();
    });

    it('should `begin`', () => {
      selections.begin();
      expect(selectionsApi.activated).to.have.been.calledWithExactly(true);
      expect(backendApi.beginSelections).to.have.been.calledWithExactly();
      expect(selections.emit).to.have.been.calledWithExactly('activated');
    });

    it('should `begin` with paths', () => {
      const paths = ['hypercubePath', 'otherHypercubePath'];
      selections.begin(paths);
      expect(selectionsApi.activated).to.have.been.calledWithExactly(true);
      expect(backendApi.beginSelections).to.not.been.called;
      expect(backendApi.model.app.switchModalSelection).to.have.been.calledWithExactly(backendApi.model, paths);
      expect(selections.emit).to.have.been.calledWithExactly('activated');
    });
  });
});
