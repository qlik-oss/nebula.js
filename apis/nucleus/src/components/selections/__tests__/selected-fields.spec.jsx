import React from 'react';
import renderer from 'react-test-renderer';

const MockedOneField = () => 'OneField';
const MockedMultiState = () => 'MultiState';
const [{ default: SelectedFields }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({ useTheme: () => ({ palette: { divider: 'red', background: { paper: 'pinky' } } }) }),
    ],
    [require.resolve('../OneField'), () => MockedOneField],
    [require.resolve('../MultiState'), () => MockedMultiState],
  ],
  ['../SelectedFields']
);

describe('<SelectedFields />', () => {
  it('should render `<OneField />`', () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    const on = sinon.spy();
    const api = {
      layout: sinon.stub().returns(data),
      on,
    };
    const testRenderer = renderer.create(<SelectedFields api={api} />);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(MockedOneField);
    expect(types).to.have.length(1);
  });
  it('should render `<MultiState />`', () => {
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
    const on = sinon.spy();
    const api = {
      layout: sinon.stub().returns(data),
      on,
    };
    const testRenderer = renderer.create(<SelectedFields api={api} />);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(MockedMultiState);
    expect(types).to.have.length(1);
  });
});
