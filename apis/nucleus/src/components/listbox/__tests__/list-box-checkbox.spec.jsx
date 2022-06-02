import React from 'react';
import renderer from 'react-test-renderer';
import { Checkbox } from '@material-ui/core';

async function render(content) {
  let testRenderer;
  await renderer.act(async () => {
    testRenderer = renderer.create(content);
  });
  return testRenderer;
}

describe('<ListBoxCheckbox />', () => {
  let ListBoxCheckbox;

  before(() => {
    [{ default: ListBoxCheckbox }] = aw.mock(
      [
        [
          require.resolve('@nebula.js/ui/theme'),
          () => ({
            makeStyles: () => () => ({
              cbIcon: 'cbIcon',
              cbIconChecked: 'cbIconChecked',
              checkbox: 'checkbox',
              cbIconAlternative: 'cbIconAlternative',
              cbIconExcluded: 'cbIconExcluded',
            }),
          }),
        ],
      ],
      ['../ListBoxCheckbox']
    );
  });
  it('should render an unchecked checkbox', async () => {
    const testRenderer = await render(<ListBoxCheckbox label="just check it" />);
    const cbs = testRenderer.root.findAllByType(Checkbox);
    expect(cbs).to.have.length(1);
    const [cb] = cbs;
    expect(cb.props.className).to.equal('checkbox');
    expect(cb.props.checked).to.equal(undefined);

    expect(cb.props.icon.props.className).to.equal('cbIcon');
    expect(cb.props.checkedIcon.props.className).to.equal('cbIconChecked');
    expect(cb.props.edge).to.equal('start');
    expect(cb.props.disableRipple).to.equal(true);
    expect(cb.props.tabIndex).to.equal(undefined);
  });

  it('should render a checked checkbox', async () => {
    const testRenderer = await render(<ListBoxCheckbox checked label="just check it" />);
    const cbs = testRenderer.root.findAllByType(Checkbox);
    expect(cbs).to.have.length(1);
    const [cb] = cbs;
    expect(cb.props.className).to.equal('checkbox');
    expect(cb.props.checked).to.equal(true);
  });

  it('should render checkbox filled with excluded gray', async () => {
    const testRenderer = await render(<ListBoxCheckbox excluded label="filled with gray" />);
    const cb = testRenderer.root.findByType(Checkbox);
    expect(cb.props.className).to.equal('checkbox');
    expect(cb.props.icon.props.children.props.className).to.equal('cbIconExcluded');
  });

  it('should not render checkbox filled with excluded gray when showGray is false', async () => {
    const testRenderer = await render(<ListBoxCheckbox excluded showGray={false} label="filled with gray" />);
    const cb = testRenderer.root.findByType(Checkbox);
    expect(cb.props.className).to.equal('checkbox');
    expect(cb.props.icon.props.children.props.className).to.equal('');
  });
});
