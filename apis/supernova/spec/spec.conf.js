module.exports = {
  fromJsdoc: {
    glob: [
      './src/**/*.js',
      '!./src/**/*.spec.js',
      '../nucleus/src/hooks/useObjectSelections.js',
      '../locale/src/translator.js',
      '../theme/src/**/*.js',
    ],
    api: {
      stability: 'experimental',
    },
    output: {
      sort: {
        alpha: false,
      },
      file: './spec/spec.json',
    },
    parse: {
      types: {
        'qae.GenericObjectProperties': {},
        'qae.GenericObjectLayout': {},
        'qae.NxAppLayout': {},
        'qae.NxDimension': {},
        'qae.NxMeasure': {},
        'enigma.GenericObject': {},
        'enigma.Doc': {},
        'enigma.Global': {},
      },
    },
  },
  toMd: {
    output: '../../docs/supernova-api.md',
    type(e) {
      if (e.indexOf('qae.') === 0) {
        return {
          url: `https://core.qlik.com/services/qix-engine/apis/qix/definitions/#${e.substr(4).toLowerCase()}`,
        };
      }
      return undefined;
    },
  },
};
