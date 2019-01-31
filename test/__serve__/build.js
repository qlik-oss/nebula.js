#! /usr/bin/env node

const path = require('path');

const rollup = require('rollup');
const jsn = require('rollup-plugin-json');

async function build() {
  const bundle = await rollup.rollup({
    input: path.resolve(__dirname, 'index.js'),
    plugins: [
      jsn(),
    ],
  });

  await bundle.write({
    file: path.resolve(__dirname, 'dist/bundle.js'),
    format: 'umd',
  });
}

module.exports = build;
