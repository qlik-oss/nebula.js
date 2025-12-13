module.exports = {
  build: {
    typescript: true,
  },
  spec: {
    input: 'src/PropertyDef.ts',
    output: 'generated',
    interface: 'ChartProperties',
  },
};
