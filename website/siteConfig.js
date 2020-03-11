const siteConfig = {
  title: 'nebula.js', // Title for your website.
  tagline: 'A new star on the rise',
  url: 'https://nebulajs.netlify.com', // Your website URL
  baseUrl: '/', // Base URL for your project */

  // Used for publishing and more
  projectName: 'nebula.js',
  organizationName: 'qlik-oss',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    // { doc: 'introduction', label: 'Introduction' },
  ],

  /* path to images for header/footer */
  headerIcon: 'docs/assets/logos/nebula_white.svg',
  disableHeaderTitle: true,
  footerIcon: 'docs/assets/logos/nebula_white.svg',
  favicon: 'img/favicon.svg',

  /* Colors for website */
  colors: {
    primaryColor: '#91298C',
    secondaryColor: '#0f0',
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} QlikTech International AB`,

  highlight: {
    theme: 'atom-one-light',
  },
  usePrism: ['jsx', 'js', 'html', 'bash'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  // ogImage: 'img/.svg',
  // twitterImage: 'img/.svg',

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/qlik-oss/nebula.js',
  editUrl: 'https://github.com/qlik-oss/nebula.js/edit/master/docs/',
};

module.exports = siteConfig;
