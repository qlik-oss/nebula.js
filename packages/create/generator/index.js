const Generator = require('yeoman-generator');
const chalk = require('chalk');
const fs = require('fs');

const pkg = require('../package.json');

function cpy(source, target, args = {}) {
  this.fs.copyTpl(
    this.templatePath(source),
    this.destinationPath(target),
    args,
  );
}

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('name', { type: String, required: true });
    this.option('install', { type: Boolean, default: true });
    this.argument('pkgm', { type: 'string', required: false });
    this.argument('picasso', { type: 'string', required: false });

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
    }, {
      type: 'list',
      name: 'picasso',
      message: 'Pick a picasso template',
      default: 'none',
      choices: ['none', 'minimal', 'barchart'],
      when: !this.options.picasso,
    }]);

    const safename = this.options.name.split('/').slice(-1)[0];

    this.opts = {
      pkgm: this.answers.pkgm || this.options.pkgm || 'npm',
      packageName: safename,
      picasso: this.answers.picasso || this.options.picasso,
    };
  }

  async writing() {
    if (this.cancelled) {
      return;
    }
    const { name } = this.options;

    // ==== common files ====
    // copy raw files
    [
      'editorconfig',
      'eslintignore',
      'gitignore',
      'eslintrc.json',
    ].forEach(filename => this.fs.copy(
      this.templatePath(`project/common/_${filename}`), // copying dotfiles may not always work, so they are prefixed with an underline
      this.destinationPath(`${name}/.${filename}`),
    ));

    const copy = cpy.bind(this);

    copy('project/common/README.md', `${name}/README.md`, { name: this.opts.packageName });

    // ==== template files ====
    const folders = [];
    if (this.opts.picasso !== 'none') {
      folders.push('project/picasso/common');
      folders.push(`project/picasso/${this.opts.picasso}`);
    } else {
      folders.push('project/none');
    }

    folders.forEach((folder) => {
      const files = fs.readdirSync(this.templatePath(folder));

      files.forEach((file) => {
        if (file === '_package.json') {
          copy(`${folder}/_package.json`, `${name}/package.json`, {
            name: this.opts.packageName,
            description: '',
            user: this.user.git.name(),
            email: this.user.git.email(),
            nebulaVersion: pkg.version,
          });
        } else {
          copy(`${folder}/${file}`, `${name}/src/${file}`);
        }
      });
    });
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
