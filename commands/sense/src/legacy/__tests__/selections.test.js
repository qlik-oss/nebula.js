import createSelections from '../selections';

describe('supernova-wrapper', () => {
  describe('selections', () => {
    let selectionsApi;
    let selectionsApiActivateMock;
    let selectionsApiDeactivateMock;

    let backendApi;
    let backendApiBeganSelectionMock;
    let backendApiEndSelectionMock;
    let backendApiResetSelectionMock;
    let backendApiSwitchModalSelectionMock;

    let selections;
    let selectionsEmitMock;

    beforeEach(() => {
      selectionsApiActivateMock = jest.fn();
      selectionsApiDeactivateMock = jest.fn();

      backendApiBeganSelectionMock = jest.fn();
      backendApiEndSelectionMock = jest.fn();
      backendApiResetSelectionMock = jest.fn();
      backendApiSwitchModalSelectionMock = jest.fn();

      selectionsEmitMock = jest.fn();

      selectionsApi = {
        activated: selectionsApiActivateMock,
        deactivated: selectionsApiDeactivateMock,
      };
      backendApi = {
        beginSelections: backendApiBeganSelectionMock,
        endSelections: backendApiEndSelectionMock,
        model: {
          resetMadeSelections: backendApiResetSelectionMock,
          app: {
            switchModalSelection: backendApiSwitchModalSelectionMock,
          },
        },
      };
      selections = createSelections({ selectionsApi, backendApi });
      selections.emit = selectionsEmitMock;
    });

    it('should `begin`', () => {
      selections.begin();
      expect(selectionsApi.activated).toHaveBeenCalledWith(true);
      expect(backendApi.beginSelections).toHaveBeenCalledWith();
      expect(selections.emit).toHaveBeenCalledWith('activated');
    });

    it('should `begin` with paths', () => {
      const paths = ['hypercubePath', 'otherHypercubePath'];
      selections.begin(paths);
      expect(selectionsApi.activated).toHaveBeenCalledWith(true);
      expect(backendApi.beginSelections).toHaveBeenCalledTimes(0);
      expect(backendApi.model.app.switchModalSelection).toHaveBeenCalledWith(backendApi.model, paths);
      expect(selections.emit).toHaveBeenCalledWith('activated');
    });
  });
});
