import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import yargs from 'yargs';

import command from '../command.js';

// the sense command as the nebula CLI registers it, with a handler that only records what it was given
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

describe('nebula sense flags', () => {
  it('has the defaults', async () => {
    const { argv, failure } = await parse(['sense']);
    assert.equal(failure, undefined);
    assert.equal(argv.output, '<name>-ext');
    assert.equal(argv.minify, true);
    assert.equal(argv.sourcemap, false);
    assert.equal(argv.ext, undefined);
    assert.equal(argv.meta, undefined);
  });

  it('accepts the documented flags, with the negations', async () => {
    const valid = [
      ['--ext', 'def.js'],
      ['--meta', 'meta.json'],
      ['--output', 'out'],
      ['--minify=false'],
      ['--no-minify'],
      ['--sourcemap'],
      ['--no-sourcemap'],
    ];
    await Promise.all(
      valid.map(async (flags) => {
        const { argv, failure } = await parse(['sense', ...flags]);
        assert.equal(failure, undefined, `${flags.join(' ')} is accepted`);
        assert.ok(argv, `${flags.join(' ')} reaches the build`);
      })
    );
  });

  it('keeps the values of the flags', async () => {
    const { argv } = await parse([
      'sense',
      '--ext',
      'def.js',
      '--meta',
      'm.json',
      '--output',
      'out',
      '--no-minify',
      '--sourcemap',
    ]);
    assert.deepEqual(
      [argv.ext, argv.meta, argv.output, argv.minify, argv.sourcemap],
      ['def.js', 'm.json', 'out', false, true]
    );
  });

  it('accepts --legacy, which the command refuses with a message of its own', async () => {
    const { argv, failure } = await parse(['sense', '--legacy']);
    assert.equal(failure, undefined);
    assert.equal(argv.legacy, true);
  });

  it('fails on a flag that it does not know, and says which', async () => {
    const { argv, failure } = await parse(['sense', '--sourcemaps']);
    assert.equal(argv, undefined, 'nothing is built');
    assert.match(failure, /Unknown argument: sourcemaps/);
  });

  it('does not make the other commands strict', async () => {
    let given;
    await yargs(['other', '--anything'])
      .command({ command: 'sense', builder: command.builder, handler() {} })
      .command({
        command: 'other',
        handler(argv) {
          given = argv;
        },
      })
      .exitProcess(false)
      .parseAsync();
    assert.equal(given.anything, true);
  });

  it('shows its name and description in the help', async () => {
    let help = '';
    await yargs(['sense', '--help'])
      .command(command)
      .exitProcess(false)
      .parseAsync(['sense', '--help'], {}, (e, a, output) => {
        help = output;
      });
    assert.match(help, /sense\n\nBuild a nebula visualization as a Qlik Sense extension/);
  });

  it('does not accept short forms of the flags, they never existed', async () => {
    const { failure } = await parse(['sense', '-o', 'out']);
    assert.match(failure, /Unknown argument: o/);
  });
});
