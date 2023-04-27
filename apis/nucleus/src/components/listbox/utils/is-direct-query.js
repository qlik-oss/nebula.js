export default function isDirectQueryEnabled({ appLayout }) {
  const isDQ = !!appLayout?.qIsDirectQueryMode;
  return isDQ;
}
