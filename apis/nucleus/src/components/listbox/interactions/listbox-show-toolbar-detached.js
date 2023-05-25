export default function showToolbarDetached({
  containerRect,
  titleRef,
  iconsWidth,
  headerPaddingLeft,
  headerPaddingRight,
}) {
  const containerWidth = containerRect.width;
  // const hasIcon = iconsWidth > 0;
  const padding = headerPaddingLeft + headerPaddingRight; // HEADER_PADDING_RIGHT + (hasIcon ? CELL_PADDING_LEFT : 2);
  const contentWidth = (titleRef?.current?.clientWidth ?? 0) + iconsWidth + padding;
  const actionToolbarWidth = 128;
  const notSufficientSpace = containerWidth < contentWidth + actionToolbarWidth;
  const isTruncated = titleRef?.current?.scrollWidth > titleRef?.current?.offsetWidth;
  const isDetached = !!(notSufficientSpace || isTruncated);

  return isDetached;
}
