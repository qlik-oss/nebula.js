module.exports = {
  fromJsdoc: {
    glob: ['../nucleus/src/components/listbox/default-properties.js'],
    api: {
      stability: 'experimental',
      name: '@nebula.js/stardust:listbox',
      description: 'nebula listbox properties definition',
    },
    output: {
      sort: {
        alpha: true,
      },
      file: './api-spec/listbox-spec.json',
    },
    parse: {
      types: {
        undefined: {},
        'EngineAPI.IListObjectDef': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FListObjectDef',
        },
      },
    },
  },
};
