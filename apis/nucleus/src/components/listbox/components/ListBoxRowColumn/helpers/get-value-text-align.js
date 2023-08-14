export default function getValueTextAlign({ direction, cell, textAlign }) {
  const isNumeric = !['NaN', undefined].includes(cell?.qNum);
  let valueTextAlign;
  const isAutoTextAlign = !textAlign || textAlign.auto;
  const dirToTextAlignMap = {
    rtl: 'right',
    ltr: 'left',
  };

  if (isAutoTextAlign) {
    if (!isNumeric) {
      valueTextAlign = dirToTextAlignMap[direction];
    } else {
      valueTextAlign = direction === 'rtl' ? 'left' : 'right';
    }
  } else {
    valueTextAlign = textAlign?.align || 'left';
  }
  const ALLOWED_OPTIONS = ['left', 'center', 'right'];
  return ALLOWED_OPTIONS.includes(valueTextAlign) ? valueTextAlign : 'left';
}
