/* eslint no-cond-assign: 0 */
import { color } from 'd3-color';

export function luminance(colStr) {
  const c = color(colStr).rgb();
  const { r, g, b } = c;

  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const [sR, sG, sB] = [r, g, b].map(v => v / 255);
  const [R, G, B] = [sR, sG, sB].map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));

  return +(0.2126 * R + 0.7152 * G + 0.0722 * B).toFixed(5);
}

function contrast(c1, c2) {
  return +((Math.max(c1, c2) + 0.05) / (Math.min(c1, c2) + 0.05)).toFixed(5);
}

const MAX_SIZE = 1000;

export default function colorFn(colors = ['#333333', '#ffffff']) {
  let cache = {};
  let n = 0;

  const luminances = colors.map(luminance);

  return {
    getBestContrastColor(colorString) {
      if (!cache[colorString]) {
        if (n > MAX_SIZE) {
          cache = {};
          n = 0;
        }
        const L = luminance(colorString);

        // https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html#contrast-ratiodef
        const contrasts = luminances.map(lum => contrast(L, lum));
        const c = colors[contrasts.indexOf(Math.max(...contrasts))];

        cache[colorString] = c;
        n++;
      }
      return cache[colorString];
    },
  };
}
