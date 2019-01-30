module.exports = {
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
      ],
      plugins: [
        ['@babel/plugin-transform-react-jsx', { pragma: 'preact.h' }],
        [
          'istanbul',
          {
            exclude: [
              '**/__test__/**',
              '**/dist/**',
            ],
          },
        ],
      ],
    },
  },
};
