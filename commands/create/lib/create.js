/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chalk = require('chalk');
const fse = require('fs-extra');
const ejs = require('ejs');
const inquirer = require('inquirer');

const pkg = require('../package.json');

const hasYarn = () => {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
};

const author = async (cwd) => {
  try {
    const email = execSync('git config --get user.email', { cwd }).toString().trim();
    const name = execSync('git config --get user.name', { cwd }).toString().trim();
    return {
      email,
      name,
    };
  } catch (e) {
    return {
      email: '',
      name: '',
    };
  }
};

const parseAuthor = (str = '') => {
  const m = str.match(/([^<(]+)?(<([^\s]+)>)?/);
  return {
    name: m && m[1] ? m[1].trim() : '',
    email: m && m[3] ? m[3].trim() : '',
  };
};

function copyFactory(root, destination) {
  return (source, target, data) => {
    if (data) {
      const content = fs.readFileSync(path.resolve(root, ...source.split('/')), { encoding: 'utf8' });
      const rendered = ejs.render(content, data);
      fs.writeFileSync(path.resolve(destination, ...target.split('/')), rendered);
    } else {
      fse.copyFileSync(path.resolve(root, ...source.split('/')), path.resolve(destination, ...target.split('/')));
    }
  };
}

const create = async (argv) => {
  const { name } = argv;

  const isMashup = argv._.includes('mashup');

  const projectFolder = name;
  const packageName = name.split('/').slice(-1)[0];

  const cwd = process.cwd();
  const templatesRoot = path.resolve(__dirname, '..', 'templates');
  const destination = path.resolve(cwd, projectFolder);

  let options = {
    install: true,
    ...argv,
    pkgm: argv.pkgm || ((await hasYarn()) ? 'yarn' : 'npm'),
    author: argv.author ? parseAuthor(argv.author) : await author(),
  };

  const results = {};

  if (await fse.exists(destination)) {
    console.error(chalk.red(`Oopsie, looks like '${projectFolder}' already exists. Try a different name.`));
    process.exit(1);
  }

  const prompt = async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'picasso',
        message: 'Pick a picasso template',
        default: 'none',
        choices: ['none', 'minimal', 'barchart'],
        when: !isMashup && !argv.picasso,
      },
    ]);

    options = { ...options, ...answers };
  };

  const write = async () => {
    console.log('\n');
    console.log('> Begin generating files...');
    const { picasso } = options;
    fse.ensureDirSync(destination);

    const copy = copyFactory(templatesRoot, destination);

    // ==== template files ====
    const folders = ['common'];
    if (isMashup) {
      folders.push('mashup');
    } else {
      folders.push('sn/common');
      if (picasso !== 'none') {
        folders.push('sn/picasso/common');
        folders.push(`sn/picasso/${picasso}`);
      } else {
        folders.push('sn/none');
      }
    }

    const data = {
      name: packageName,
      description: '',
      user: options.author.name,
      email: options.author.email,
      nebulaVersion: pkg.version,
    };

    const traverse = (sourceFolder, targetFolder = '') => {
      const files = fs.readdirSync(path.resolve(templatesRoot, sourceFolder));

      files.forEach((file) => {
        const p = `${sourceFolder}/${file}`;
        const stats = fs.lstatSync(path.resolve(templatesRoot, p));
        const next = `${targetFolder}/${file}`.replace(/^\//, '');
        if (stats.isDirectory()) {
          fse.ensureDirSync(path.resolve(destination, next));
          traverse(p, next);
        } else if (file[0] === '_') {
          const newFileName = file === '_package.json' ? 'package.json' : `.${file.substr(1)}`;
          copy(`${sourceFolder}/${file}`, `${targetFolder}/${newFileName}`.replace(/^\//, ''), data);
        } else {
          copy(`${sourceFolder}/${file}`, next, data);
        }
      });
    };

    folders.forEach((folder) => {
      traverse(folder);
    });
  };

  const install = async () => {
    if (options.install !== false) {
      console.log('> Installing dependencies...');
      console.log('\n');
      const command = `${options.pkgm} install`;
      try {
        execSync(command, {
          cwd: destination,
          stdio: 'inherit',
        });
        console.log('\n');
      } catch (e) {
        console.log('\n');
        console.log(`> Something went wrong when running ${chalk.yellow(command)}, try running the command yourself.`);
        results.fail = true;
        results.failedInstall = true;
      }
    }
  };

  const end = async () => {
    const p = options.pkgm;
    if (!results.fail) {
      console.log(`> Successfully created project ${chalk.yellow(options.name)}`);
    }
    console.log('> Get started with the following commands:');
    console.log('\n');
    console.log(chalk.cyan(`   cd ${projectFolder}`));
    if (options.install === false || results.failedInstall) {
      console.log(chalk.cyan(`   ${p} install`));
    }
    console.log(chalk.cyan(`   ${p} run start`));
    console.log('\n');
  };

  await prompt();
  await write();
  await install();
  await end();
};

module.exports = create;
