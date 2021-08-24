# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.7.0](https://github.com/qlik-oss/nebula.js/compare/v1.6.0...v1.7.0) (2021-08-24)

### Features

- add properties option to Field function ([#654](https://github.com/qlik-oss/nebula.js/issues/654)) ([65d402e](https://github.com/qlik-oss/nebula.js/commit/65d402e0ba129cf68a0a254746c04fccf7c9953b))
- give charts access to the nebula instance through useEmbed ([#650](https://github.com/qlik-oss/nebula.js/issues/650)) ([0d19f69](https://github.com/qlik-oss/nebula.js/commit/0d19f698ad3f88edc9459dcb721d9744e5c44c01))

# [1.6.0](https://github.com/qlik-oss/nebula.js/compare/v1.5.0...v1.6.0) (2021-08-16)

**Note:** Version bump only for package @nebula.js/nucleus

# [1.4.0](https://github.com/qlik-oss/nebula.js/compare/v1.3.0...v1.4.0) (2021-06-28)

**Note:** Version bump only for package @nebula.js/nucleus

# [1.2.0](https://github.com/qlik-oss/nebula.js/compare/v1.1.1...v1.2.0) (2021-05-12)

### Features

- add support for chart plugins ([#599](https://github.com/qlik-oss/nebula.js/issues/599)) ([ae75817](https://github.com/qlik-oss/nebula.js/commit/ae758174261124afc8e70d026ab9a841b5dee4d5))

## [1.1.1](https://github.com/qlik-oss/nebula.js/compare/v1.1.0...v1.1.1) (2021-04-19)

### Bug Fixes

- make sure ActionsTooblar doesn't steal focus ([#597](https://github.com/qlik-oss/nebula.js/issues/597)) ([20846e9](https://github.com/qlik-oss/nebula.js/commit/20846e9667c1dfc93d46e17a9e44a1060489226a))

### Features

- add device type ([#587](https://github.com/qlik-oss/nebula.js/issues/587)) ([f6e1ead](https://github.com/qlik-oss/nebula.js/commit/f6e1ead7e14f029b1f78fa354fb98b2e089b52a9))

# [1.1.0](https://github.com/qlik-oss/nebula.js/compare/v1.1.0-alpha0...v1.1.0) (2021-02-01)

### Bug Fixes

- remove setProperties interceptor on object conversion ([#562](https://github.com/qlik-oss/nebula.js/issues/562)) ([1f43f43](https://github.com/qlik-oss/nebula.js/commit/1f43f43))

# [1.1.0-alpha0](https://github.com/qlik-oss/nebula.js/compare/v1.0.2-alpha.1...v1.1.0-alpha0) (2021-01-21)

### Bug Fixes

- support master dims ([#556](https://github.com/qlik-oss/nebula.js/issues/556)) ([e1bd228](https://github.com/qlik-oss/nebula.js/commit/e1bd228))

## [1.0.2-alpha.1](https://github.com/qlik-oss/nebula.js/compare/v1.0.2-alpha.0...v1.0.2-alpha.1) (2020-12-04)

### Bug Fixes

- **nucleus:** disable enforce focus on actions toolbar ([#540](https://github.com/qlik-oss/nebula.js/issues/540)) ([2dde426](https://github.com/qlik-oss/nebula.js/commit/2dde426))
- object-selections ([#539](https://github.com/qlik-oss/nebula.js/issues/539)) ([b5ba2d0](https://github.com/qlik-oss/nebula.js/commit/b5ba2d0))
- remove listener on unmount ([#520](https://github.com/qlik-oss/nebula.js/issues/520)) ([73e5c87](https://github.com/qlik-oss/nebula.js/commit/73e5c87))

### Features

- add basic support for object conversion ([#535](https://github.com/qlik-oss/nebula.js/issues/535)) ([d8c83ca](https://github.com/qlik-oss/nebula.js/commit/d8c83ca))
- add exportProperties for hypercube conversion ([#537](https://github.com/qlik-oss/nebula.js/issues/537)) ([5ec6a8a](https://github.com/qlik-oss/nebula.js/commit/5ec6a8a))
- support ListObject ([#526](https://github.com/qlik-oss/nebula.js/issues/526)) ([c0daa04](https://github.com/qlik-oss/nebula.js/commit/c0daa04))

## [1.0.1](https://github.com/qlik-oss/nebula.js/compare/v1.0.0...v1.0.1) (2020-06-22)

### Bug Fixes

- destroy session object ([#456](https://github.com/qlik-oss/nebula.js/issues/456)) ([c2e2d98](https://github.com/qlik-oss/nebula.js/commit/c2e2d98))

# [1.0.0](https://github.com/qlik-oss/nebula.js/compare/v1.0.0-alpha.0...v1.0.0) (2020-06-09)

**Note:** Version bump only for package @nebula.js/nucleus

# [1.0.0-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v0.6.1...v1.0.0-alpha.0) (2020-06-09)

### Code Refactoring

- rename public classnames ([#446](https://github.com/qlik-oss/nebula.js/issues/446)) ([c02a7ab](https://github.com/qlik-oss/nebula.js/commit/c02a7ab))
- update API and docs ([#439](https://github.com/qlik-oss/nebula.js/issues/439)) ([210d9c5](https://github.com/qlik-oss/nebula.js/commit/210d9c5))

### BREAKING CHANGES

- rename nebulajs-cell to njs-cell and nebulajs-sn to njs-viz
- renamed setTemporaryProperties to applyProperties

## [0.6.1](https://github.com/qlik-oss/nebula.js/compare/v0.6.0...v0.6.1) (2020-05-15)

**Note:** Version bump only for package @nebula.js/nucleus

# [0.5.0](https://github.com/qlik-oss/nebula.js/compare/v0.4.0...v0.5.0) (2020-04-20)

### Bug Fixes

- add `cellRect` to dependencies ([#410](https://github.com/qlik-oss/nebula.js/issues/410)) ([ea93201](https://github.com/qlik-oss/nebula.js/commit/ea93201))
- custom actions ([#409](https://github.com/qlik-oss/nebula.js/issues/409)) ([72eeb68](https://github.com/qlik-oss/nebula.js/commit/72eeb68))
- revert `useRect` ([#394](https://github.com/qlik-oss/nebula.js/issues/394)) ([79123c5](https://github.com/qlik-oss/nebula.js/commit/79123c5))
- set initial rect when ResizeObserver is undefined ([#407](https://github.com/qlik-oss/nebula.js/issues/407)) ([9100fad](https://github.com/qlik-oss/nebula.js/commit/9100fad))

### Features

- actions ([#401](https://github.com/qlik-oss/nebula.js/issues/401)) ([d99eabc](https://github.com/qlik-oss/nebula.js/commit/d99eabc)), closes [#398](https://github.com/qlik-oss/nebula.js/issues/398)

# [0.4.0](https://github.com/qlik-oss/nebula.js/compare/v0.3.0...v0.4.0) (2020-04-02)

### Bug Fixes

- align listbox popover more menu ([#392](https://github.com/qlik-oss/nebula.js/issues/392)) ([6ce4860](https://github.com/qlik-oss/nebula.js/commit/6ce4860))

### Features

- responsive object selections ([#389](https://github.com/qlik-oss/nebula.js/issues/389)) ([63d8cc1](https://github.com/qlik-oss/nebula.js/commit/63d8cc1)), closes [#381](https://github.com/qlik-oss/nebula.js/issues/381)

# [0.3.0](https://github.com/qlik-oss/nebula.js/compare/v0.2.1...v0.3.0) (2020-03-30)

### Bug Fixes

- only show `<Loading />` or `<LongRunningQuery />` ([#386](https://github.com/qlik-oss/nebula.js/issues/386)) ([36b634b](https://github.com/qlik-oss/nebula.js/commit/36b634b))
- use color `inherit` ([#382](https://github.com/qlik-oss/nebula.js/issues/382)) ([8de8ef1](https://github.com/qlik-oss/nebula.js/commit/8de8ef1))

### Features

- responsive app selections ([#378](https://github.com/qlik-oss/nebula.js/issues/378)) ([6f3d496](https://github.com/qlik-oss/nebula.js/commit/6f3d496)), closes [#326](https://github.com/qlik-oss/nebula.js/issues/326)
- **nucleus:** add flags api ([#384](https://github.com/qlik-oss/nebula.js/issues/384)) ([d283284](https://github.com/qlik-oss/nebula.js/commit/d283284))
