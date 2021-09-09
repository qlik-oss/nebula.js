import getMatch from '../type-alias';

describe('type matcher', () => {
  it('should match client known charts', () => {
    expect(getMatch('bar chart', ['barchart'])).to.equal('barchart');
    expect(getMatch('combochart', ['combochart'])).to.equal('combochart');
    expect(getMatch('lineChart', ['linechart'])).to.equal('linechart');
    expect(getMatch('mekko-chart', ['mekkochart'])).to.equal('mekkochart');
    expect(getMatch('sn-pie-chart', ['piechart'])).to.equal('piechart');
  });
  it('should match themes known charts', () => {
    expect(getMatch('bar chart', ['barChart'])).to.equal('barChart');
    expect(getMatch('combochart', ['comboChart'])).to.equal('comboChart');
    expect(getMatch('lineChart', ['lineChart'])).to.equal('lineChart');
    expect(getMatch('mekko-chart', ['mekkoChart'])).to.equal('mekkoChart');
    expect(getMatch('sn-pie-chart', ['pieChart'])).to.equal('pieChart');
  });
  it('should match dash known charts', () => {
    expect(getMatch('bar chart', ['bar-chart'])).to.equal('bar-chart');
    expect(getMatch('combochart', ['combo-chart'])).to.equal('combo-chart');
    expect(getMatch('lineChart', ['line-chart'])).to.equal('line-chart');
    expect(getMatch('mekko-chart', ['mekko-chart'])).to.equal('mekko-chart');
    expect(getMatch('sn-pie-chart', ['pie-chart'])).to.equal('pie-chart');
  });
  it('should match sn prefixed known charts', () => {
    expect(getMatch('bar chart', ['sn-bar-chart'])).to.equal('sn-bar-chart');
    expect(getMatch('combochart', ['sn-combo-chart'])).to.equal('sn-combo-chart');
    expect(getMatch('lineChart', ['sn-line-chart'])).to.equal('sn-line-chart');
    expect(getMatch('mekko-chart', ['sn-mekko-chart'])).to.equal('sn-mekko-chart');
    expect(getMatch('sn-pie-chart', ['sn-pie-chart'])).to.equal('sn-pie-chart');
  });
});
