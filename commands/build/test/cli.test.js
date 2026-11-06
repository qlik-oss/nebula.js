import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import yargs from 'yargs';

import command from '../command.js';

// the build command as the nebula CLI registers it, with a handler that only records what it was given
const parse = async (args) => {
  let given;
  let failure;
  try {
    await yargs(args)
      .command({
        ...command,
        handler(argv) {
          given = argv;
        },
      })
      .exitProcess(false)
      .fail((message, error) => {
        throw error || new Error(message);
      })
      .parseAsync();
  } catch (e) {
    failure = e.message;
  }
  return { argv: given, failure };
};

describe('nebula build flags', () => {
  it('accepts the documented flags, with the negations and the camel and kebab case', async () => {
    const valid = [
      ['--config', 'nebula.config.js'],
      ['-c', 'nebula.config.js'],
      ['--watch'],
      ['--watch', 'systemjs'],
      ['-w', 'esm'],
      ['--sourcemap=false'],
      ['--no-sourcemap'],
      ['-m'],
      ['--mode', 'development'],
      ['--no-systemjs'],
      ['--core', 'core'],
      ['--typescript'],
      ['--browser=false'],
      ['--codeSplit'],
      ['--code-split'],
      ['--inlineDynamic'],
      ['--cwd', '.'],
    ];
    await Promise.all(
      valid.map(async (flags) => {
        const { argv, failure } = await parse(['build', ...flags]);
        assert.equal(failure, undefined, `${flags.join(' ')} is accepted`);
        assert.ok(argv, `${flags.join(' ')} reaches the build`);
      })
    );
  });

  it('keeps the values of the flags', async () => {
    const { argv } = await parse(['build', '--no-sourcemap', '--mode', 'development', '--watch']);
    assert.equal(argv.sourcemap, false);
    assert.equal(argv.mode, 'development');
    assert.equal(argv.watch, 'esm');
  });

  it('fails on a flag that it does not know, and says which', async () => {
    const { argv, failure } = await parse(['build', '--sourcemaps']);
    assert.equal(argv, undefined, 'nothing is built');
    assert.match(failure, /Unknown argument: sourcemaps/);
  });

  it('does not know preferBuiltins anymore', async () => {
    const { failure } = await parse(['build', '--preferBuiltins']);
    assert.match(failure, /Unknown argument: preferBuiltins/);
  });

  it('accepts the flags that are not in the help', async () => {
    const hidden = [['--reactNative'], ['--reactNative', '--reactNativePath', 'rn'], ['--cwd', '.']];
    await Promise.all(
      hidden.map(async (flags) => {
        const { failure } = await parse(['build', ...flags]);
        assert.equal(failure, undefined, `${flags.join(' ')} is accepted`);
      })
    );
  });

  describe('the build section of the config file', () => {
    const configWith = (build) => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-build-cli-'));
      const file = path.join(dir, 'nebula.config.js');
      fs.writeFileSync(file, `module.exports = { build: ${JSON.stringify(build)} };\n`);
      return file;
    };

    it('accepts the keys that are options, replacementStrings and the systemjs settings', async () => {
      const config = configWith({
        typescript: true,
        codeSplit: true,
        inlineDynamic: false,
        replacementStrings: { 'process.env.NAME': '"nebula"' },
        systemjs: { external: ['a'] },
      });
      const { argv, failure } = await parse(['build', '--config', config]);
      assert.equal(failure, undefined);
      assert.equal(argv.typescript, true);
      assert.deepEqual(argv.replacementStrings, { 'process.env.NAME': '"nebula"' });
    });

    it('fails on a key that it does not know, and says which', async () => {
      const { argv, failure } = await parse(['build', '--config', configWith({ externals: [] })]);
      assert.equal(argv, undefined, 'nothing is built');
      assert.match(failure, /Unknown argument: externals/);
    });
  });
});
