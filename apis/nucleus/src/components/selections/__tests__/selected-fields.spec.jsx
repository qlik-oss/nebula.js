/* eslint-disable no-param-reassign */
import React from 'react';
import { create, act } from 'react-test-renderer';

const MockedOneField = () => 'OneField';
const MockedMultiState = () => 'MultiState';
const currentSelectionsModel = {
  id: 0,
  getLayout: sinon.stub(),
};
const [{ default: SelectedFields }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({ useTheme: () => ({ palette: { divider: 'red', background: { paper: 'pinky' } } }) }),
    ],
    [require.resolve('../OneField'), () => MockedOneField],
    [require.resolve('../MultiState'), () => MockedMultiState],
    [require.resolve('../../../hooks/useCurrentSelectionsModel'), () => () => [currentSelectionsModel]],
  ],
  ['../SelectedFields']
);

describe('<SelectedFields />', () => {
  let sandbox;
  let render;
  let renderer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
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
    sandbox.restore();
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
    currentSelectionsModel.getLayout.returns(data);
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
    currentSelectionsModel.getLayout.returns(data);
    await render();
    const types = renderer.root.findAllByType(MockedMultiState);
    expect(types).to.have.length(1);
  });
  it('should keep item in modal state', async () => {
    currentSelectionsModel.getLayout.resetHistory();
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
    currentSelectionsModel.getLayout.onFirstCall().returns(data);
    currentSelectionsModel.getLayout.onSecondCall().returns(data);
    currentSelectionsModel.getLayout.onThirdCall().returns(newData);
    await render();
    api.isInModal.returns(true);
    await act(async () => renderer.update(<SelectedFields api={api} app={{}} />));
    const types = renderer.root.findAllByType(MockedOneField);
    expect(types).to.have.length(3);
    expect(types[0].props.field.name).to.equal('my-field0');
    expect(types[1].props.field.name).to.equal('my-field1');
    expect(types[2].props.field.name).to.equal('my-field2');
  });
  it('should not run keep item in modal state when doing new selection', async () => {
    currentSelectionsModel.getLayout.resetHistory();
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
    currentSelectionsModel.getLayout.onFirstCall().returns(data);
    currentSelectionsModel.getLayout.onSecondCall().returns(newData);
    currentSelectionsModel.getLayout.onThirdCall().returns(newData);
    await render();
    api.isInModal.returns(true);
    await render();
    const types = renderer.root.findAllByType(MockedOneField);
    expect(types).to.have.length(1);
    expect(types[0].props.field.name).to.equal('my-field0');
  });
});
