import React from 'react';
import renderer from 'react-test-renderer';
import Image from '../components/Image';

async function render(content) {
  let testRenderer;
  await renderer.act(async () => {
    testRenderer = renderer.create(content);
  });
  return testRenderer;
}

describe('<Image />', () => {
  test('should render an img with the provided src and label as alt text', async () => {
    const testRenderer = await render(
      <Image
        representation={{ imageSize: 'fitHeight', imagePosition: 'topLeft' }}
        src="http://foo/bar.png"
        label="my label"
      />
    );
    const imgs = testRenderer.root.findAllByType('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0].props.src).toBe('http://foo/bar.png');
    expect(imgs[0].props.alt).toBe('my label');
    await testRenderer.unmount();
  });

  test('should not render an img when src is missing (e.g. url mode before a url is provided)', async () => {
    const testRenderer = await render(
      <Image representation={{ imageSize: 'fitHeight', imagePosition: 'topLeft' }} src={undefined} label="my label" />
    );
    const imgs = testRenderer.root.findAllByType('img');
    expect(imgs).toHaveLength(0);
    await testRenderer.unmount();
  });

  test('should not render an img when src is an empty string', async () => {
    const testRenderer = await render(
      <Image representation={{ imageSize: 'fitHeight', imagePosition: 'topLeft' }} src="" label="my label" />
    );
    const imgs = testRenderer.root.findAllByType('img');
    expect(imgs).toHaveLength(0);
    await testRenderer.unmount();
  });

  describe('src security validation', () => {
    test.each([
      ['https URL', 'https://foo/bar.png'],
      ['http URL', 'http://foo/bar.png'],
      ['relative URL', '/media/bar.png'],
      ['image data URI', 'data:image/png;base64,iVBORw0KGgo='],
    ])('renders an img for a safe src (%s)', async (_desc, src) => {
      const testRenderer = await render(
        <Image representation={{ imageSize: 'fitHeight', imagePosition: 'topLeft' }} src={src} label="l" />
      );
      const imgs = testRenderer.root.findAllByType('img');
      expect(imgs).toHaveLength(1);
      expect(imgs[0].props.src).toBe(src);
      await testRenderer.unmount();
    });

    test.each([
      // eslint-disable-next-line no-script-url -- intentionally testing that a javascript: src is rejected
      ['javascript: URL', 'javascript:alert(1)'],
      ['data:text/html', 'data:text/html,<script>alert(1)</script>'],
      ['vbscript: URL', 'vbscript:msgbox(1)'],
    ])('does not render an img for an unsafe src (%s)', async (_desc, src) => {
      const testRenderer = await render(
        <Image representation={{ imageSize: 'fitHeight', imagePosition: 'topLeft' }} src={src} label="l" />
      );
      expect(testRenderer.root.findAllByType('img')).toHaveLength(0);
      await testRenderer.unmount();
    });
  });

  describe('imageSize', () => {
    test.each([
      ['fitHeight', { width: 'auto', objectFit: 'contain' }],
      ['fitWidth', { width: '100%', objectFit: undefined }],
      ['alwaysFit', { width: '100%', objectFit: 'contain' }],
      ['stretch', { width: '100%', objectFit: 'fill' }],
      ['alwaysFill', { width: '100%', objectFit: 'cover' }],
    ])('%s maps width/objectFit correctly', async (imageSize, expected) => {
      const testRenderer = await render(
        <Image representation={{ imageSize, imagePosition: 'topLeft' }} src="http://foo/bar.png" label="l" />
      );
      const img = testRenderer.root.findByType('img');
      expect(img.props.style.width).toBe(expected.width);
      expect(img.props.style.objectFit).toBe(expected.objectFit);
      await testRenderer.unmount();
    });

    it('fitWidth fills the width and lets the height scale proportionally (auto)', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'fitWidth', imagePosition: 'topLeft' }}
          src="http://foo/bar.png"
          label="l"
        />
      );
      const img = testRenderer.root.findByType('img');
      expect(img.props.style.width).toBe('100%');
      expect(img.props.style.height).toBe('auto');
      expect(img.props.style.maxHeight).toBeUndefined();
      expect(img.props.style.objectFit).toBeUndefined();
      await testRenderer.unmount();
    });
  });

  describe('imagePosition', () => {
    test.each([
      ['topLeft', 'left top'],
      ['centerCenter', 'center center'],
      ['bottomRight', 'right bottom'],
    ])('%s maps to object-position "%s"', async (imagePosition, expected) => {
      const testRenderer = await render(
        <Image representation={{ imageSize: 'alwaysFit', imagePosition }} src="http://foo/bar.png" label="l" />
      );
      const img = testRenderer.root.findByType('img');
      expect(img.props.style.objectPosition).toBe(expected);
      await testRenderer.unmount();
    });
  });

  test('should constrain the container height when imageSize is fitHeight', async () => {
    const testRenderer = await render(
      <Image representation={{ imageSize: 'fitHeight', imagePosition: 'topLeft' }} src="http://foo/bar.png" label="l" />
    );
    const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
    expect(container.props.style.height).toBe('200px');
    await testRenderer.unmount();
  });

  test('should let the container fill height for non-fitHeight sizes', async () => {
    const testRenderer = await render(
      <Image representation={{ imageSize: 'alwaysFit', imagePosition: 'topLeft' }} src="http://foo/bar.png" label="l" />
    );
    const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
    expect(container.props.style.height).toBe('100%');
    await testRenderer.unmount();
  });

  describe('title overlay', () => {
    test('should render the title (dimension value) over the image', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="alt"
          title="Amadeus"
        />
      );
      const titleNode = testRenderer.root.findByProps({ 'data-key': 'image-title' });
      expect(titleNode.props.children).toBe('Amadeus');
      expect(titleNode.props.style.fontWeight).toBe('bold');
      await testRenderer.unmount();
    });

    test('the subtitle is not bold', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="alt"
          title="Amadeus"
          subtitle="Milos Forman"
        />
      );
      const subtitleNode = testRenderer.root.findByProps({ 'data-key': 'image-subtitle' });
      expect(subtitleNode.props.style.fontWeight).toBeUndefined();
      await testRenderer.unmount();
    });

    test('should not render the title overlay when no title is provided', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="alt"
        />
      );
      expect(testRenderer.root.findAllByProps({ 'data-key': 'image-title-overlay' })).toHaveLength(0);
      await testRenderer.unmount();
    });

    test.each([
      ['top-left', 'flex-start', 'flex-start'],
      ['center-center', 'center', 'center'],
      ['bottom-right', 'flex-end', 'flex-end'],
    ])('titlePosition %s maps to justifyContent/alignItems', async (titlePosition, expectedJustify, expectedAlign) => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'alwaysFill', imagePosition: 'top-center', titlePosition }}
          src="http://foo/bar.png"
          label="alt"
          title="t"
        />
      );
      const overlay = testRenderer.root.findByProps({ 'data-key': 'image-title-overlay' });
      expect(overlay.props.style.justifyContent).toBe(expectedJustify);
      expect(overlay.props.style.alignItems).toBe(expectedAlign);
      await testRenderer.unmount();
    });

    test('textOverlay=false hides the whole title overlay', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'alwaysFill', imagePosition: 'top-center', textOverlay: false }}
          src="http://foo/bar.png"
          label="alt"
          title="t"
          subtitle="s"
        />
      );
      expect(testRenderer.root.findAllByProps({ 'data-key': 'image-title-overlay' })).toHaveLength(0);
      await testRenderer.unmount();
    });

    test('titleBackground=false removes the text background', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter', titleBackground: false }}
          src="http://foo/bar.png"
          label="alt"
          title="t"
        />
      );
      const overlay = testRenderer.root.findByProps({ 'data-key': 'image-title-overlay' });
      const box = overlay.props.children;
      expect(box.props.style.backgroundColor).toBe('transparent');
      await testRenderer.unmount();
    });
  });

  describe('subtitle and cell background color', () => {
    test('should render the subtitle below the title', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="alt"
          title="Amadeus"
          subtitle="Milos Forman"
        />
      );
      const subtitleNode = testRenderer.root.findByProps({ 'data-key': 'image-subtitle' });
      expect(subtitleNode.props.children).toBe('Milos Forman');
      await testRenderer.unmount();
    });

    test('should render the overlay from the subtitle alone when there is no title', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="alt"
          subtitle="Milos Forman"
        />
      );
      expect(testRenderer.root.findAllByProps({ 'data-key': 'image-title' })).toHaveLength(0);
      expect(testRenderer.root.findByProps({ 'data-key': 'image-subtitle' }).props.children).toBe('Milos Forman');
      await testRenderer.unmount();
    });

    test('should apply the cell background color to the container', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="alt"
          title="t"
          cellBgColor="#ff0000"
        />
      );
      const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(container.props.style.backgroundColor).toBe('#ff0000');
      await testRenderer.unmount();
    });
  });

  describe('corner radius and border', () => {
    test.each([
      ['none', '0px'],
      ['small', '4px'],
      ['medium', '8px'],
      ['large', '16px'],
      ['full', '50%'],
    ])('cornerRadius %s maps to border-radius %s', async (cornerRadius, expected) => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter', cornerRadius }}
          src="http://foo/bar.png"
          label="l"
        />
      );
      const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(container.props.style.borderRadius).toBe(expected);
      await testRenderer.unmount();
    });

    test('defaults to a small (4px) corner radius', async () => {
      const testRenderer = await render(
        <Image representation={{ imageSize: 'cover', imagePosition: 'topCenter' }} src="http://foo/bar.png" label="l" />
      );
      const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(container.props.style.borderRadius).toBe('4px');
      await testRenderer.unmount();
    });

    test('applies the configured border when borderWidth > 0, else a transparent placeholder', async () => {
      const withBorder = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter', borderWidth: 4, borderColor: '#ff0000' }}
          src="http://foo/bar.png"
          label="l"
        />
      );
      const withContainer = withBorder.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(withContainer.props.style.border).toBe('4px solid #ff0000');
      await withBorder.unmount();

      const noBorder = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter', borderWidth: 0 }}
          src="http://foo/bar.png"
          label="l"
        />
      );
      const noContainer = noBorder.root.findByProps({ 'data-key': 'image-horizontal-container' });
      // Transparent border of the same width avoids a layout shift when a cell becomes selected.
      expect(noContainer.props.style.border).toBe('2px solid transparent');
      await noBorder.unmount();
    });
  });

  describe('selection feedback', () => {
    test('selected cell gets a colored border and full opacity', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'alwaysFill', imagePosition: 'topCenter', borderWidth: 0 }}
          src="http://foo/bar.png"
          label="l"
          selected
          selectionColor="#009845"
          opacity={1}
        />
      );
      const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(container.props.style.border).toBe('2px solid #009845');
      expect(container.props.style.opacity).toBe(1);
      await testRenderer.unmount();
    });

    test('a selected border wins over the configured border', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter', borderWidth: 4, borderColor: '#d9d9d9' }}
          src="http://foo/bar.png"
          label="l"
          selected
          selectionColor="#009845"
        />
      );
      const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(container.props.style.border).toBe('2px solid #009845');
      await testRenderer.unmount();
    });

    test('fades a dimmed (alternative/excluded) cell via opacity', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="l"
          opacity={0.4}
        />
      );
      const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(container.props.style.opacity).toBe(0.4);
      await testRenderer.unmount();
    });
  });

  describe('placeholder background', () => {
    test('uses the placeholder background when no cell background color is set', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="l"
          placeholderBackground="#f0f0f0"
        />
      );
      const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(container.props.style.backgroundColor).toBe('#f0f0f0');
      await testRenderer.unmount();
    });

    test('the cell background color expression takes precedence over the placeholder', async () => {
      const testRenderer = await render(
        <Image
          representation={{ imageSize: 'cover', imagePosition: 'topCenter' }}
          src="http://foo/bar.png"
          label="l"
          cellBgColor="#ff0000"
          placeholderBackground="#f0f0f0"
        />
      );
      const container = testRenderer.root.findByProps({ 'data-key': 'image-horizontal-container' });
      expect(container.props.style.backgroundColor).toBe('#ff0000');
      await testRenderer.unmount();
    });
  });
});
