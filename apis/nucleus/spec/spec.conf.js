module.exports = {
  glob: ['./src/**/*.js', '!./src/**/*.spec.js', '!./src/hooks/useObjectSelections.js'],
  api: {
    stability: 'experimental',
    properties: {
      'x-qlik-visibility': 'public',
    },
    visibility: 'public',
  },
  output: {
    file: './spec/spec.json',
  },
  parse: {
    types: {
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
};
