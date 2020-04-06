import { color } from 'd3-color';

export default function luminance(colStr) {
  const c = color(colStr).rgb();
  const { r, g, b } = c;

  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const [sR, sG, sB] = [r, g, b].map((v) => v / 255);
  const [R, G, B] = [sR, sG, sB].map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));

  return +(0.2126 * R + 0.7152 * G + 0.0722 * B).toFixed(5);
}
