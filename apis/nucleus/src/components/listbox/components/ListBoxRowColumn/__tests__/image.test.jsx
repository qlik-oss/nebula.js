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
      ['fitWidth', { width: '100%', objectFit: 'contain' }],
      ['alwaysFit', { width: '100%', objectFit: 'contain' }],
      ['fill', { width: '100%', objectFit: 'fill' }],
      ['cover', { width: '100%', objectFit: 'cover' }],
      ['originalSize', { width: 'fit-content', objectFit: 'none' }],
    ])('%s maps width/objectFit correctly', async (imageSize, expected) => {
      const testRenderer = await render(
        <Image representation={{ imageSize, imagePosition: 'topLeft' }} src="http://foo/bar.png" label="l" />
      );
      const img = testRenderer.root.findByType('img');
      expect(img.props.style.width).toBe(expected.width);
      expect(img.props.style.objectFit).toBe(expected.objectFit);
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
});
