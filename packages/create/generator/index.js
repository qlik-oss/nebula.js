const Generator = require('yeoman-generator');
const chalk = require('chalk');
const fs = require('fs');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('name', { type: String, required: true });
    this.option('install', { type: Boolean, default: true });
    this.argument('pkgm', { type: 'string', required: false });

    // console.log('OPTS', this.options);
    // console.log('ARGS', this.arguments);

    const destination = this.destinationPath(this.options.name);
    if (fs.existsSync(destination)) {
      this.cancelled = true;
      this.log.error(chalk.red(`Oopsie, looks like ${this.options.name} already exists.`));
    }

    // silence create
    this.log.create = () => {};
  }

  async prompting() {
    if (this.cancelled) {
      return;
    }

    this.answers = await this.prompt([{
      type: 'list',
      name: 'pkgm',
      message: 'Pick the package manager you want to use:',
      choices: ['npm', 'yarn'],
      when: !this.options.pkgm && this.options.install,
    }]);

    const safename = this.options.name.split('/').slice(-1)[0];

    this.opts = {
      pkgm: this.answers.pkgm || this.options.pkgm || 'npm',
      packageName: safename,
    };
  }

  async writing() {
    if (this.cancelled) {
      return;
    }
    const { name } = this.options;

    // copy raw files
    [
      '.editorconfig',
      '.eslintignore',
      '.gitignore',
      '.eslintrc.json',
    ].forEach(filename => this.fs.copy(
      this.templatePath(`project/${filename}`),
      this.destinationPath(`${name}/${filename}`),
    ));

    this.fs.copyTpl(
      this.templatePath('project/_package.json'), // npm pack will not pack the whole folder if it contains a package.json file
      this.destinationPath(`${name}/package.json`),
      {
        name: this.opts.packageName,
        description: '',
        user: this.user.git.name(),
        email: this.user.git.email(),
        // username: await this.user.github.username(),
      },
    );

    this.fs.copyTpl(
      this.templatePath('project/README.md'),
      this.destinationPath(`${name}/README.md`),
      {
        name,
      },
    );

    this.fs.copyTpl(
      this.templatePath('project/sn.js'),
      this.destinationPath(`${name}/src/index.js`),
      {},
    );

    this.fs.copyTpl(
      this.templatePath('project/object-properties.js'),
      this.destinationPath(`${name}/src/object-properties.js`),
      { name },
    );
  }

  install() {
    if (this.cancelled || !this.options.install) {
      return;
    }
    process.chdir(this.options.name);
    this.installDependencies({
      npm: this.opts.pkgm === 'npm',
      bower: false,
      yarn: this.opts.pkgm === 'yarn',
    });
  }

  end() {
    if (this.cancelled) {
      return;
    }
    const p = this.opts.pkgm;
    this.log('\n');
    this.log(`Successfully created project ${chalk.yellow(this.options.name)}`);
    this.log('Get started with the following commands:');
    this.log('\n');
    this.log(chalk.cyan(`   cd ${this.options.name}`));
    if (this.options.install === false) {
      this.log(chalk.cyan(`   ${p} install`));
    }
    this.log(chalk.cyan(`   ${p} run start`));
    this.log('\n');
  }
};
