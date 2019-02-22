import preact from 'preact';
import render from 'preact-render-to-string';
import looksLike from 'html-looks-like';

import Header from '../../src/components/Header';

describe('<Header />', () => {
  it('should be empty when input is falsy', () => {
    expect(render(<Header />)).to.equal('');
    expect(render(<Header layout={{ showTitles: true }} />)).to.equal('');
  });

  it('should render a title', () => {
    const layout = { showTitles: true, title: 'foo' };
    const html = render(<Header layout={layout} />);
    looksLike(html, `
    <header class="nucleus-cell__header">
      <div class="nucleus-type--m">foo</div>
      <div class="nucleus-type--s"></div>
    </header>
    `);
  });

  it('should render a subtitle', () => {
    const layout = { showTitles: true, subtitle: 'foo' };
    const html = render(<Header layout={layout} />);
    looksLike(html, `
    <header class="nucleus-cell__header">
      <div class="nucleus-type--m"></div>
      <div class="nucleus-type--s">foo</div>
    </header>
    `);
  });
});
