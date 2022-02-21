/**
 * @typedef {object} Range
 * @property {number} qCharPos The (absolute) index where the highlighted range starts.
 * @property {number} qCharCount The length of the sub-string (starting from qChartPos) that should be highlighted.
 */

/**
 * @typedef {Array<{segment: string, highlighted: boolean}>} Segment
 * @property {string} segment The sub-string/segment cut out from the original label.
 * @property {boolean} highlighted A flag which tells whether the segment should be highlighted or not.
 */

/**
 * @param {string} label The label we want to create segments out of.
 * @param {Range} range The indexes which define how to create the segments.
 * @param {number=} [startIndex] An optional index which tells where we want to start the first segment from
 *   (only relevant for creating the first unhighlighted segment of a string/sub-string).
 * @returns {Segment} An array of segments.
 */
function getSegmentsFromRange(label, range, startIndex = 0) {
  const { qCharPos, qCharCount } = range;
  const segments = [];
  if (qCharPos > startIndex) {
    // Create a non-highlighted section before the highighted section.
    segments.push([label.slice(startIndex, qCharPos), false]);
  }

  // Highlighted segment.
  segments.push([label.slice(qCharPos, qCharPos + qCharCount), true]);

  return segments;
}

/**
 * @param {string} label The label we want to create segments out of.
 * @param {Range[]} ranges The ranges defining indices for cutting the string into segments.
 * @returns {Segment[]} An array of segments in the same order as the ranges.
 */
export default function getSegmentsFromRanges(label, ranges) {
  if (!ranges.length) {
    return [];
  }
  const labels = ranges.reduce((acc, curr, ix) => {
    const startIndex = ix === 0 ? 0 : ranges[ix - 1].qCharPos + ranges[ix - 1].qCharCount;
    acc.push(...getSegmentsFromRange(label, curr, startIndex));

    // Last non highlighted segment
    const isLastRange = ix === ranges.length - 1;
    const endIndex = ranges[ix].qCharPos + ranges[ix].qCharCount;
    if (isLastRange && endIndex < label.length) {
      acc.push([label.slice(endIndex), false]);
    }
    return acc;
  }, []);

  return labels;
}
