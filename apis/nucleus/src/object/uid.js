const idGen = [
  [10, 31],
  [0, 31],
  [0, 31],
  [0, 31],
  [0, 31],
  [0, 31],
];
function toChar([min, max]) {
  return (min + ((Math.random() * (max - min)) | 0)).toString(32);
}

export default function uid() {
  return idGen.map(toChar).join('');
}
