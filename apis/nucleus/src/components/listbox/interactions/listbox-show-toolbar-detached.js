/* eslint-disable no-nested-ternary */
export default function showToolbarDetached({ containerRef, titleRef, iconsWidth }) {
  const containerWidth = containerRef?.current?.clientWidth ?? 0;
  const padding = 16;
  const contentWidth = (titleRef?.current?.clientWidth ?? 0) + iconsWidth + padding;
  const actionToolbarWidth = 128;
  const notSufficientSpace = containerWidth < contentWidth + actionToolbarWidth;
  const isTruncated = titleRef?.current?.scrollWidth > titleRef?.current?.offsetWidth;
  const isDetached = !!(notSufficientSpace | isTruncated);
  const reasonDetached = isDetached ? (notSufficientSpace ? 'noSpace' : 'truncated') : '';

  return { isDetached, reasonDetached };
}
