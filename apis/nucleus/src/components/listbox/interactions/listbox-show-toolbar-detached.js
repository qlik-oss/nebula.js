export default function showToolbarDetached({
  containerRect,
  titleRef,
  iconsWidth,
  headerPaddingLeft,
  headerPaddingRight,
}) {
  const containerWidth = containerRect.width;
  const preventTruncation = 2;
  const padding = headerPaddingLeft + headerPaddingRight;
  const contentWidth = (titleRef?.current?.clientWidth ?? 0) + iconsWidth + padding + preventTruncation;
  const actionToolbarWidth = 128;
  const notSufficientSpace = containerWidth < contentWidth + actionToolbarWidth;
  const isTruncated = titleRef?.current?.scrollWidth > titleRef?.current?.offsetWidth;
  const isDetached = !!(notSufficientSpace || isTruncated);

  return isDetached;
}
