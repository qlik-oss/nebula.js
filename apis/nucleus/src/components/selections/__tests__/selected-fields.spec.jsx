/* eslint-disable no-param-reassign */
import React from 'react';
import { create, act } from 'react-test-renderer';

describe('<SelectedFields />', () => {
  let sandbox;
  const MockedOneField = () => 'OneField';
  const MockedMultiState = () => 'MultiState';
  let currentSelectionsModel;
  let useLayout;
  let SelectedFields;

  before(() => {
    sandbox = sinon.createSandbox();
    useLayout = sandbox.stub();
    currentSelectionsModel = {
      id: 'current-selections',
    };
    [{ default: SelectedFields }] = aw.mock(
      [
        [
          require.resolve('@nebula.js/ui/theme'),
          () => ({ useTheme: () => ({ palette: { divider: 'red', background: { paper: 'pinky' } } }) }),
        ],
        [require.resolve('../OneField'), () => MockedOneField],
        [require.resolve('../MultiState'), () => MockedMultiState],
        [require.resolve('../../../hooks/useCurrentSelectionsModel'), () => () => [currentSelectionsModel]],
        [require.resolve('../../../hooks/useLayout'), () => useLayout],
      ],
      ['../SelectedFields']
    );
  });

  let render;
  let renderer;

  beforeEach(() => {
    const defaultApp = {
      id: 'selected-fields',
    };
    const defaultApi = {
      isInModal: sandbox.stub().returns(false),
    };

    render = async ({ api = {}, app = {}, rendererOptions } = {}) => {
      api = {
        ...defaultApi,
        ...api,
      };
      app = {
        ...defaultApp,
        ...app,
      };
      await act(async () => {
        renderer = create(<SelectedFields api={api} app={app} />, rendererOptions || null);
      });
    };
  });

  afterEach(() => {
    sandbox.reset();
    renderer.unmount();
  });

  it('should render `<OneField />`', async () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    useLayout.returns([data]);
    await render();
    const types = renderer.root.findAllByType(MockedOneField);
    expect(types).to.have.length(1);
  });
  it('should render `<MultiState />`', async () => {
    const data = {
      alternateStates: [
        {
          stateName: '$',
          qSelectionObject: {
            qSelections: [
              {
                qField: 'my-field',
              },
            ],
          },
        },
        {
          stateName: 'foo',
          qSelectionObject: {
            qSelections: [
              {
                qField: 'my-field',
              },
            ],
          },
        },
      ],
    };
    useLayout.returns([data]);
    await render();
    const types = renderer.root.findAllByType(MockedMultiState);
    expect(types).to.have.length(1);
  });
  it('should keep item in modal state', async () => {
    const api = {
      isInModal: sandbox.stub().returns(true),
    };
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
          {
            qField: 'my-field1',
          },
          {
            qField: 'my-field2',
          },
        ],
      },
    };
    const newData = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
          {
            qField: 'my-field2',
          },
        ],
      },
    };
    useLayout.onFirstCall().returns([data]);
    useLayout.onSecondCall().returns([data]);
    useLayout.onThirdCall().returns([newData]);
    await render();
    api.isInModal.returns(true);
    const types = renderer.root.findAllByType(MockedOneField);
    expect(types).to.have.length(3);
    expect(types[0].props.field.name).to.equal('my-field0');
    expect(types[1].props.field.name).to.equal('my-field1');
    expect(types[2].props.field.name).to.equal('my-field2');
  });
  it('should not run keep item in modal state when doing new selection', async () => {
    const api = {
      isInModal: sandbox.stub().returns(true),
    };
    const data = {
      qSelectionObject: {
        qSelections: [],
      },
    };
    const newData = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
        ],
      },
    };
    useLayout.onFirstCall().returns([data]);
    useLayout.onSecondCall().returns([newData]);
    useLayout.onThirdCall().returns([newData]);
    await render();
    api.isInModal.returns(true);
    const types = renderer.root.findAllByType(MockedOneField);
    expect(types).to.have.length(1);
    expect(types[0].props.field.name).to.equal('my-field0');
  });
});
