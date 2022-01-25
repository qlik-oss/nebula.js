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
      'EngineAPI.IApp': {
        url: 'https://github.com/qlik-oss/enigma.js/blob/master/docs/api.md#generated-api',
      },
      'EngineAPI.IGenericObjectLayout': {
        url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectlayout',
      },
      'EngineAPI.IGenericObjectProperties': {
        url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectproperties',
      },
      'EngineAPI.INxDimension': {
        url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxdimension',
      },
      'EngineAPI.INxMeasure': {
        url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxmeasure',
      },
    },
  },
};
