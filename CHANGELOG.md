# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.1.0](https://github.com/qlik-oss/nebula.js/compare/v1.1.0-alpha0...v1.1.0) (2021-02-01)

### Bug Fixes

- remove setProperties interceptor on object conversion ([#562](https://github.com/qlik-oss/nebula.js/issues/562)) ([1f43f43](https://github.com/qlik-oss/nebula.js/commit/1f43f43))
- trim whitespace before using url ([#559](https://github.com/qlik-oss/nebula.js/issues/559)) ([b047758](https://github.com/qlik-oss/nebula.js/commit/b047758))

# [1.1.0-alpha0](https://github.com/qlik-oss/nebula.js/compare/v1.0.2-alpha.1...v1.1.0-alpha0) (2021-01-21)

### Bug Fixes

- support master dims ([#556](https://github.com/qlik-oss/nebula.js/issues/556)) ([e1bd228](https://github.com/qlik-oss/nebula.js/commit/e1bd228))
- **deps:** update dependency rollup-plugin-postcss to v4 ([#554](https://github.com/qlik-oss/nebula.js/issues/554)) ([542bbfc](https://github.com/qlik-oss/nebula.js/commit/542bbfc))

## [1.0.2-alpha.1](https://github.com/qlik-oss/nebula.js/compare/v1.0.2-alpha.0...v1.0.2-alpha.1) (2020-12-04)

### Bug Fixes

- **nucleus:** disable enforce focus on actions toolbar ([#540](https://github.com/qlik-oss/nebula.js/issues/540)) ([2dde426](https://github.com/qlik-oss/nebula.js/commit/2dde426))
- object-selections ([#539](https://github.com/qlik-oss/nebula.js/issues/539)) ([b5ba2d0](https://github.com/qlik-oss/nebula.js/commit/b5ba2d0))
- **cli-create:** add missing / in template ([#522](https://github.com/qlik-oss/nebula.js/issues/522)) ([f0575f3](https://github.com/qlik-oss/nebula.js/commit/f0575f3))
- remove listener on unmount ([#520](https://github.com/qlik-oss/nebula.js/issues/520)) ([73e5c87](https://github.com/qlik-oss/nebula.js/commit/73e5c87))

### Features

- add basic support for object conversion ([#535](https://github.com/qlik-oss/nebula.js/issues/535)) ([d8c83ca](https://github.com/qlik-oss/nebula.js/commit/d8c83ca))
- add exportProperties for hypercube conversion ([#537](https://github.com/qlik-oss/nebula.js/issues/537)) ([5ec6a8a](https://github.com/qlik-oss/nebula.js/commit/5ec6a8a))
- add importProperties for hypercube conversion ([#538](https://github.com/qlik-oss/nebula.js/issues/538)) ([0071d3c](https://github.com/qlik-oss/nebula.js/commit/0071d3c))
- **test-utils:** add support for actions ([#534](https://github.com/qlik-oss/nebula.js/issues/534)) ([18db348](https://github.com/qlik-oss/nebula.js/commit/18db348))
- support ListObject ([#526](https://github.com/qlik-oss/nebula.js/issues/526)) ([c0daa04](https://github.com/qlik-oss/nebula.js/commit/c0daa04))

## [1.0.1](https://github.com/qlik-oss/nebula.js/compare/v1.0.0...v1.0.1) (2020-06-22)

### Bug Fixes

- **cli-sense:** do not remove target dir ([#451](https://github.com/qlik-oss/nebula.js/issues/451)) ([0f5432e](https://github.com/qlik-oss/nebula.js/commit/0f5432e))
- destroy session object ([#456](https://github.com/qlik-oss/nebula.js/issues/456)) ([c2e2d98](https://github.com/qlik-oss/nebula.js/commit/c2e2d98))

# [1.0.0](https://github.com/qlik-oss/nebula.js/compare/v1.0.0-alpha.0...v1.0.0) (2020-06-09)

**Note:** Version bump only for package nebula.js

# [1.0.0-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v0.6.1...v1.0.0-alpha.0) (2020-06-09)

### Bug Fixes

- desktop app name ([#429](https://github.com/qlik-oss/nebula.js/issues/429)) ([4457433](https://github.com/qlik-oss/nebula.js/commit/4457433))

### Code Refactoring

- rename public classnames ([#446](https://github.com/qlik-oss/nebula.js/issues/446)) ([c02a7ab](https://github.com/qlik-oss/nebula.js/commit/c02a7ab))
- update API and docs ([#439](https://github.com/qlik-oss/nebula.js/issues/439)) ([210d9c5](https://github.com/qlik-oss/nebula.js/commit/210d9c5))

### Features

- **cli-sense:** build for legacy Sense ([#438](https://github.com/qlik-oss/nebula.js/issues/438)) ([5485eab](https://github.com/qlik-oss/nebula.js/commit/5485eab))
- **translations:** UI bus - 2020-05-20 ([#434](https://github.com/qlik-oss/nebula.js/issues/434)) ([97d0811](https://github.com/qlik-oss/nebula.js/commit/97d0811)), closes [#428](https://github.com/qlik-oss/nebula.js/issues/428)

### BREAKING CHANGES

- rename nebulajs-cell to njs-cell and nebulajs-sn to njs-viz
- renamed setTemporaryProperties to applyProperties

## [0.6.1](https://github.com/qlik-oss/nebula.js/compare/v0.6.0...v0.6.1) (2020-05-15)

### Bug Fixes

- hide action when hidden is true ([#421](https://github.com/qlik-oss/nebula.js/issues/421)) ([6a8172a](https://github.com/qlik-oss/nebula.js/commit/6a8172a))

# [0.5.0](https://github.com/qlik-oss/nebula.js/compare/v0.4.0...v0.5.0) (2020-04-20)

### Bug Fixes

- **cli-serve:** remove react warning ([#400](https://github.com/qlik-oss/nebula.js/issues/400)) ([332929b](https://github.com/qlik-oss/nebula.js/commit/332929b))
- **cli-serve:** used shared storage ([#396](https://github.com/qlik-oss/nebula.js/issues/396)) ([b3d061c](https://github.com/qlik-oss/nebula.js/commit/b3d061c))
- **supernova:** batch action observer update ([#402](https://github.com/qlik-oss/nebula.js/issues/402)) ([c989ad3](https://github.com/qlik-oss/nebula.js/commit/c989ad3))
- add `cellRect` to dependencies ([#410](https://github.com/qlik-oss/nebula.js/issues/410)) ([ea93201](https://github.com/qlik-oss/nebula.js/commit/ea93201))
- custom actions ([#409](https://github.com/qlik-oss/nebula.js/issues/409)) ([72eeb68](https://github.com/qlik-oss/nebula.js/commit/72eeb68))
- revert `useRect` ([#394](https://github.com/qlik-oss/nebula.js/issues/394)) ([79123c5](https://github.com/qlik-oss/nebula.js/commit/79123c5))
- set initial rect when ResizeObserver is undefined ([#407](https://github.com/qlik-oss/nebula.js/issues/407)) ([9100fad](https://github.com/qlik-oss/nebula.js/commit/9100fad))
- store action dispatcher when called before component initia… ([#403](https://github.com/qlik-oss/nebula.js/issues/403)) ([cfa7ac2](https://github.com/qlik-oss/nebula.js/commit/cfa7ac2))

### Features

- actions ([#401](https://github.com/qlik-oss/nebula.js/issues/401)) ([d99eabc](https://github.com/qlik-oss/nebula.js/commit/d99eabc)), closes [#398](https://github.com/qlik-oss/nebula.js/issues/398)

# [0.4.0](https://github.com/qlik-oss/nebula.js/compare/v0.3.0...v0.4.0) (2020-04-02)

### Bug Fixes

- align listbox popover more menu ([#392](https://github.com/qlik-oss/nebula.js/issues/392)) ([6ce4860](https://github.com/qlik-oss/nebula.js/commit/6ce4860))
- **supernova:** handle multiple useRect ([#393](https://github.com/qlik-oss/nebula.js/issues/393)) ([df884b3](https://github.com/qlik-oss/nebula.js/commit/df884b3)), closes [#374](https://github.com/qlik-oss/nebula.js/issues/374)
- **supernova:** update all options ([#391](https://github.com/qlik-oss/nebula.js/issues/391)) ([f9d5e4b](https://github.com/qlik-oss/nebula.js/commit/f9d5e4b))

### Features

- responsive object selections ([#389](https://github.com/qlik-oss/nebula.js/issues/389)) ([63d8cc1](https://github.com/qlik-oss/nebula.js/commit/63d8cc1)), closes [#381](https://github.com/qlik-oss/nebula.js/issues/381)

# [0.3.0](https://github.com/qlik-oss/nebula.js/compare/v0.2.1...v0.3.0) (2020-03-30)

### Bug Fixes

- only show `<Loading />` or `<LongRunningQuery />` ([#386](https://github.com/qlik-oss/nebula.js/issues/386)) ([36b634b](https://github.com/qlik-oss/nebula.js/commit/36b634b))
- use color `inherit` ([#382](https://github.com/qlik-oss/nebula.js/issues/382)) ([8de8ef1](https://github.com/qlik-oss/nebula.js/commit/8de8ef1))

### Features

- **cli-build:** add sourcemap option to build ([#376](https://github.com/qlik-oss/nebula.js/issues/376)) ([09f9dbf](https://github.com/qlik-oss/nebula.js/commit/09f9dbf))
- responsive app selections ([#378](https://github.com/qlik-oss/nebula.js/issues/378)) ([6f3d496](https://github.com/qlik-oss/nebula.js/commit/6f3d496)), closes [#326](https://github.com/qlik-oss/nebula.js/issues/326)
- **nucleus:** add flags api ([#384](https://github.com/qlik-oss/nebula.js/issues/384)) ([d283284](https://github.com/qlik-oss/nebula.js/commit/d283284))
