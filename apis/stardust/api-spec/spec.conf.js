module.exports = {
  fromJsdoc: {
    glob: [
      '!*.spec.js',
      '../nucleus/src/**/*.js',
      '../supernova/src/**/*.js',
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
      file: './api-spec/spec.json',
    },
    parse: {
      types: {
        'qae.NxAppLayout': {},
        'enigma.GenericObject': {},
        'enigma.Global': {},
        'enigma.Doc': {
          url: 'https://github.com/qlik-oss/enigma.js/blob/master/docs/api.md#generated-api',
        },
        'qae.GenericObjectLayout': {
          url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectlayout',
        },
        'qae.GenericObjectProperties': {
          url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectproperties',
        },
        'qae.NxDimension': {
          url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxdimension',
        },
        'qae.NxMeasure': {
          url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxmeasure',
        },
      },
    },
  },
  toMd: {
    output: '../../docs/stardust-api.md',
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
