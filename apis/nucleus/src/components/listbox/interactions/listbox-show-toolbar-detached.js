export default function showToolbarDetached({ containerRect, titleRef, iconsWidth }) {
  const containerWidth = containerRect.width;
  const padding = 16;
  const contentWidth = (titleRef?.current?.clientWidth ?? 0) + iconsWidth + padding;
  const actionToolbarWidth = 128;
  const notSufficientSpace = containerWidth < contentWidth + actionToolbarWidth;
  const isTruncated = titleRef?.current?.scrollWidth > titleRef?.current?.offsetWidth;
  const isDetached = !!(notSufficientSpace || isTruncated);

  return isDetached;
}
