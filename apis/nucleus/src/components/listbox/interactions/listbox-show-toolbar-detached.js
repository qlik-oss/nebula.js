export default function showToolbarDetached({ containerRef, titleRef, searchIconWidth }) {
  const containerWidth = containerRef?.current?.clientWidth ?? 0;
  const padding = 16;
  const contentWidth = (titleRef?.current?.clientWidth ?? 0) + searchIconWidth + padding;
  const actionToolbarWidth = 128;
  const notSufficientSpace = containerWidth < contentWidth + actionToolbarWidth;
  const isTruncated = titleRef?.current?.scrollWidth > titleRef?.current?.offsetWidth;

  return !!(notSufficientSpace | isTruncated);
}
