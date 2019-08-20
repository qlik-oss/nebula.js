const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const ejs = require('ejs');
const inquirer = require('inquirer');

const { execSync } = require('child_process');

const pkg = require('../package.json');

const hasYarn = () => {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
};

const author = async cwd => {
  try {
    const email = execSync('git config --get user.email', { cwd })
      .toString()
      .trim();
    const name = execSync('git config --get user.name', { cwd })
      .toString()
      .trim();
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

function cpy(root, destination) {
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

const create = async argv => {
  const { name } = argv;

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
        when: !argv.picasso,
      },
    ]);

    options = { ...options, ...answers };
  };

  const write = async () => {
    console.log('\n');
    console.log('> Generating files...');
    const { picasso } = options;
    fse.ensureDirSync(destination);

    // ==== common files ====
    // copy raw files
    ['editorconfig', 'eslintignore', 'gitignore', 'eslintrc.json'].forEach(filename =>
      fs.copyFileSync(
        path.resolve(templatesRoot, 'common', `_${filename}`), // copying dotfiles may not always work, so they are prefixed with an underline
        path.resolve(destination, `.${filename}`)
      )
    );

    const copy = cpy(templatesRoot, destination);

    copy('common/README.md', 'README.md', { name: packageName });

    // ==== template files ====
    const folders = [];
    if (picasso !== 'none') {
      folders.push('picasso/common');
      folders.push(`picasso/${picasso}`);
    } else {
      folders.push('none');
    }

    const traverse = (sourceFolder, targetFolder = '') => {
      const files = fs.readdirSync(path.resolve(templatesRoot, sourceFolder));

      files.forEach(file => {
        const p = `${sourceFolder}/${file}`;
        const stats = fs.lstatSync(path.resolve(templatesRoot, p));
        const next = `${targetFolder}/${file}`.replace(/^\//, '');
        if (stats.isDirectory()) {
          fse.ensureDirSync(path.resolve(destination, next));
          traverse(p, next);
        } else if (file === '_package.json') {
          copy(`${sourceFolder}/_package.json`, 'package.json', {
            name: packageName,
            description: '',
            user: options.author.name,
            email: options.author.email,
            nebulaVersion: pkg.version,
          });
        } else {
          copy(`${sourceFolder}/${file}`, next);
        }
      });
    };

    folders.forEach(folder => {
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
