import { getFrequencyMaxExpression } from '../frequencyMaxUtil';

describe('frequencyMaxUtil - getFrequencyMaxExpression', () => {
  test('should create correct expression and wrap and escape field if needed', async () => {
    const result = getFrequencyMaxExpression('dimension with ] in it');

    expect(result).toEqual('Max(AGGR(Count([dimension with ]] in it]), [dimension with ]] in it]))');
  });
});
