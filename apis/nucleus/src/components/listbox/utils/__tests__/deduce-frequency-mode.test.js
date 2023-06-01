import deduceFrequencyMode from '../deduce-frequency-mode';

function generatePages(mode) {
  let qMatrix;
  switch (mode) {
    case 'P':
      qMatrix = [[{}], [{}], [{}], [{ qFrequency: '100.0%' }], [{ qFrequency: '' }], [{ qFrequency: '-' }]];
      break;
    case 'V':
      qMatrix = [
        [{ qFrequency: '123' }],
        [{ qFrequency: '1' }],
        [{}],
        [{ qFrequency: '123' }],
        [{ qFrequency: '123' }],
        [{ qFrequency: '-' }],
      ];
      break;
    case 'R':
      qMatrix = [
        [{ qFrequency: '0.123' }],
        [{ qFrequency: '0.1' }],
        [{}],
        [{ qFrequency: '0.123' }],
        [{ qFrequency: '0.123' }],
        [{ qFrequency: '-' }],
      ];
      break;
    default:
      qMatrix = [[{}], [{}], [{}], [{}], [{}], [{}]];
  }
  const pages = [
    {
      qMatrix: qMatrix.slice(0, 3),
    },
    {
      qMatrix: qMatrix.slice(3),
    },
  ];
  return pages;
}

describe('deduceFrequencyMode', () => {
  test('should deduce percent (P)', () => {
    const pages = generatePages('P');
    const mode = deduceFrequencyMode(pages);
    expect(mode).toEqual('P');
  });

  test('should deduce unknown (-) when no percent sign is present', () => {
    const pages = generatePages('V');
    const mode = deduceFrequencyMode(pages);
    expect(mode).toEqual('-');
  });

  test('should deduce unknown (-) when only undefined values are present', () => {
    const pages = generatePages('R');
    const mode = deduceFrequencyMode(pages);
    expect(mode).toEqual('-');
  });

  test('should deduce unknown (-) when only undefined values are present', () => {
    const pages = generatePages('N');
    const mode = deduceFrequencyMode(pages);
    expect(mode).toEqual('-');
  });
});
