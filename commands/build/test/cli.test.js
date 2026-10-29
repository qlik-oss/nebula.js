/* eslint-disable import/extensions */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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
      ['-w', 'umd'],
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
    assert.equal(argv.watch, 'umd');
  });

  it('fails on a flag that it does not know, and says which', async () => {
    const { argv, failure } = await parse(['build', '--sourcemaps']);
    assert.equal(argv, undefined, 'nothing is built');
    assert.match(failure, /Unknown argument: sourcemaps/);
  });

  it('fails on the flags that are gone', async () => {
    const gone = ['preferBuiltins', 'reactNative', 'reactNativePath'];
    await Promise.all(
      gone.map(async (flag) => {
        const { failure } = await parse(['build', `--${flag}`]);
        assert.match(failure, new RegExp(`Unknown argument: ${flag}`));
      })
    );
  });
});
