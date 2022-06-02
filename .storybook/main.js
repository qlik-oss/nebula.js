module.exports = {
  stories: [
    '../apis/nucleus/src/components/**/__stories__/**/*.stories.mdx',
    '../apis/nucleus/src/components/**/__stories__/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
};
