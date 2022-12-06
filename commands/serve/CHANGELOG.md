# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.1.0-alpha.2](https://github.com/qlik-oss/nebula.js/compare/v3.1.0-alpha.1...v3.1.0-alpha.2) (2022-12-02)

### Bug Fixes

- **deps:** update dependency webpack-cli to v5 ([#1018](https://github.com/qlik-oss/nebula.js/issues/1018)) ([ae9e83b](https://github.com/qlik-oss/nebula.js/commit/ae9e83bbb73202374e986eb98bc1d48ff1aff35e))
- include webpack-cli ([#1014](https://github.com/qlik-oss/nebula.js/issues/1014)) ([9e4d431](https://github.com/qlik-oss/nebula.js/commit/9e4d4315ab1ea964d0b6c111351e8e336d3ad23e))

# [3.1.0-alpha.1](https://github.com/qlik-oss/nebula.js/compare/v3.1.0-alpha.0...v3.1.0-alpha.1) (2022-11-28)

### Features

- introducing react router to nebula web ([#973](https://github.com/qlik-oss/nebula.js/issues/973)) ([7001a47](https://github.com/qlik-oss/nebula.js/commit/7001a47232591e4549786785dace6dde19bca9bb))
- show a message to upgrade node when needed ([#999](https://github.com/qlik-oss/nebula.js/issues/999)) ([caa4174](https://github.com/qlik-oss/nebula.js/commit/caa417464eb393ada1e2cea066719a1ccf41e5cb))
- use cached connections hook ([#975](https://github.com/qlik-oss/nebula.js/issues/975)) ([68c16b8](https://github.com/qlik-oss/nebula.js/commit/68c16b826411719a5610dd0c9b945d0b29a6b436))

# [3.1.0-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v3.0.4...v3.1.0-alpha.0) (2022-10-21)

### Bug Fixes

- command line input bug ([#968](https://github.com/qlik-oss/nebula.js/issues/968)) ([5907701](https://github.com/qlik-oss/nebula.js/commit/590770160a50aad90a4c427780dc06205918aaf6))

### Features

- `clientId` from `nebula.config.js` support ([#963](https://github.com/qlik-oss/nebula.js/issues/963)) ([9d5e29d](https://github.com/qlik-oss/nebula.js/commit/9d5e29d4d82a922c0fc447fca3b0dc9e3c442a34))
- new ui for connection string ([#965](https://github.com/qlik-oss/nebula.js/issues/965)) ([e772ed7](https://github.com/qlik-oss/nebula.js/commit/e772ed7143a2024afe0cfa54e3e6ab361a92640b))
- OAuth integration in nebula mashup ([#962](https://github.com/qlik-oss/nebula.js/issues/962)) ([c354633](https://github.com/qlik-oss/nebula.js/commit/c354633132ff3882f57b82b6856b84314d99c95b))

## [3.0.4](https://github.com/qlik-oss/nebula.js/compare/v3.0.3...v3.0.4) (2022-10-13)

### Features

- sdk OAuth support in mashup template ([#950](https://github.com/qlik-oss/nebula.js/issues/950)) ([fd9a978](https://github.com/qlik-oss/nebula.js/commit/fd9a978296d17f532b15b9468e754b73defdfddd))

## [3.0.3](https://github.com/qlik-oss/nebula.js/compare/v3.0.2...v3.0.3) (2022-09-30)

### Features

- integrate `@qlik/sdk` into nebula-cli ([#929](https://github.com/qlik-oss/nebula.js/issues/929)) ([dcebeb1](https://github.com/qlik-oss/nebula.js/commit/dcebeb157c97851086766f2302ff121a4abe5dbd))

## [3.0.2](https://github.com/qlik-oss/nebula.js/compare/v3.0.2-alpha.0...v3.0.2) (2022-09-21)

**Note:** Version bump only for package @nebula.js/cli-serve

## [3.0.2-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v3.0.1...v3.0.2-alpha.0) (2022-09-21)

**Note:** Version bump only for package @nebula.js/cli-serve

## [3.0.1](https://github.com/qlik-oss/nebula.js/compare/v3.0.0...v3.0.1) (2022-09-20)

### Reverts

- Revert "refactor: support multiple dims for filterpane (#917)" (#930) ([2e71bc1](https://github.com/qlik-oss/nebula.js/commit/2e71bc1b2686355bc22c9c4a2740ec6d5517a51d)), closes [#917](https://github.com/qlik-oss/nebula.js/issues/917) [#930](https://github.com/qlik-oss/nebula.js/issues/930)

# [3.0.0](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-rc.3...v3.0.0) (2022-09-19)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-rc.3](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-rc.2...v3.0.0-rc.3) (2022-09-16)

### Bug Fixes

- add cors headers to /info and /pkg/<name> ([#922](https://github.com/qlik-oss/nebula.js/issues/922)) ([476d7bd](https://github.com/qlik-oss/nebula.js/commit/476d7bdba9423b04426da1163cd5075799538600))

### Features

- **serve:** add mfe mode ([#919](https://github.com/qlik-oss/nebula.js/issues/919)) ([48a7c40](https://github.com/qlik-oss/nebula.js/commit/48a7c40d013673e5dcb165463fb750bbae4fb449))

# [3.0.0-rc.2](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-rc.1...v3.0.0-rc.2) (2022-08-31)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-rc.1](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha13...v3.0.0-rc.1) (2022-08-30)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha13](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha12...v3.0.0-alpha13) (2022-08-22)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha12](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha11...v3.0.0-alpha12) (2022-08-22)

### Bug Fixes

- **deps:** update dependency source-map-loader to v4 ([#880](https://github.com/qlik-oss/nebula.js/issues/880)) ([d9b5dd5](https://github.com/qlik-oss/nebula.js/commit/d9b5dd56b3c1f2ce1eaef62da760c88af9085a2d))

### Features

- add variable and expression support to serve props ([#895](https://github.com/qlik-oss/nebula.js/issues/895)) ([3b8dc2e](https://github.com/qlik-oss/nebula.js/commit/3b8dc2ee56c84c118617b224c53776d0f2875f26))

# [3.0.0-alpha11](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha10...v3.0.0-alpha11) (2022-07-26)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha10](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha9...v3.0.0-alpha10) (2022-07-13)

**Note:** Version bump only for package @nebula.js/cli-serve

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha9](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha8...v3.0.0-alpha9) (2022-07-13)

**Note:** Version bump only for package @nebula.js/cli-serve

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha8](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha7...v3.0.0-alpha8) (2022-07-13)

**Note:** Version bump only for package @nebula.js/cli-serve

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha6](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha5...v3.0.0-alpha6) (2022-07-01)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha5](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha4...v3.0.0-alpha5) (2022-06-30)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha4](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha3...v3.0.0-alpha4) (2022-06-29)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha3](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha2...v3.0.0-alpha3) (2022-06-28)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha2](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha1...v3.0.0-alpha2) (2022-06-28)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha1](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha0...v3.0.0-alpha1) (2022-06-23)

**Note:** Version bump only for package @nebula.js/cli-serve

# [3.0.0-alpha0](https://github.com/qlik-oss/nebula.js/compare/v2.11.0...v3.0.0-alpha0) (2022-06-16)

### Bug Fixes

- **deps:** update dependency puppeteer to v14 ([#844](https://github.com/qlik-oss/nebula.js/issues/844)) ([bc9d19e](https://github.com/qlik-oss/nebula.js/commit/bc9d19e729184fb1537a7c6a88df74d94c38e395))

# [2.11.0](https://github.com/qlik-oss/nebula.js/compare/v2.10.0...v2.11.0) (2022-06-01)

**Note:** Version bump only for package @nebula.js/cli-serve

# [2.10.0](https://github.com/qlik-oss/nebula.js/compare/v2.9.0...v2.10.0) (2022-04-26)

**Note:** Version bump only for package @nebula.js/cli-serve

# [2.9.0](https://github.com/qlik-oss/nebula.js/compare/v2.8.0...v2.9.0) (2022-04-01)

**Note:** Version bump only for package @nebula.js/cli-serve

# [2.8.0](https://github.com/qlik-oss/nebula.js/compare/v2.7.0...v2.8.0) (2022-03-25)

**Note:** Version bump only for package @nebula.js/cli-serve

# [2.7.0](https://github.com/qlik-oss/nebula.js/compare/v2.6.1...v2.7.0) (2022-03-21)

### Bug Fixes

- **deps:** update dependency puppeteer to v13 ([#736](https://github.com/qlik-oss/nebula.js/issues/736)) ([7415205](https://github.com/qlik-oss/nebula.js/commit/7415205f807b328d950e1c38ebb5e0cf63cff2b0))

## [2.6.1](https://github.com/qlik-oss/nebula.js/compare/v2.6.0...v2.6.1) (2022-02-25)

**Note:** Version bump only for package @nebula.js/cli-serve

# [2.6.0](https://github.com/qlik-oss/nebula.js/compare/v2.5.0...v2.6.0) (2022-02-25)

**Note:** Version bump only for package @nebula.js/cli-serve

# [2.5.0](https://github.com/qlik-oss/nebula.js/compare/v2.4.1...v2.5.0) (2022-02-15)

**Note:** Version bump only for package @nebula.js/cli-serve

## [2.4.1](https://github.com/qlik-oss/nebula.js/compare/v2.4.0...v2.4.1) (2022-02-10)

**Note:** Version bump only for package @nebula.js/cli-serve

# [2.4.0](https://github.com/qlik-oss/nebula.js/compare/v2.3.1...v2.4.0) (2022-02-10)

**Note:** Version bump only for package @nebula.js/cli-serve

## [2.3.1](https://github.com/qlik-oss/nebula.js/compare/v2.3.0...v2.3.1) (2021-12-09)

### Bug Fixes

- remove support for load viz on fixture ([#730](https://github.com/qlik-oss/nebula.js/issues/730)) ([d0a1ae2](https://github.com/qlik-oss/nebula.js/commit/d0a1ae2b091e025b7b514aaeb665f6d67156df79))

# [2.3.0](https://github.com/qlik-oss/nebula.js/compare/v2.2.0...v2.3.0) (2021-12-06)

### Bug Fixes

- **deps:** update dependency puppeteer to v12 ([#722](https://github.com/qlik-oss/nebula.js/issues/722)) ([2100656](https://github.com/qlik-oss/nebula.js/commit/21006562e78f3659c73e5a00831f0f3f0d132379))

### Features

- **cli-serve:** generic object is optional when rendering from fixture ([#726](https://github.com/qlik-oss/nebula.js/issues/726)) ([72a4e3c](https://github.com/qlik-oss/nebula.js/commit/72a4e3c10a68b2b7f4b9b926502e979a9353ce87))
- **serve:** use enigma mocker when rendering fixture ([#710](https://github.com/qlik-oss/nebula.js/issues/710)) ([d2b64a8](https://github.com/qlik-oss/nebula.js/commit/d2b64a8a1ca978a77142b2660b55307cef5f1a94))

# [2.2.0](https://github.com/qlik-oss/nebula.js/compare/v2.1.0...v2.2.0) (2021-11-17)

**Note:** Version bump only for package @nebula.js/cli-serve

# [2.1.0](https://github.com/qlik-oss/nebula.js/compare/v2.0.0...v2.1.0) (2021-10-20)

### Bug Fixes

- bug in serve types ([#687](https://github.com/qlik-oss/nebula.js/issues/687)) ([2d72fdb](https://github.com/qlik-oss/nebula.js/commit/2d72fdb2a53a79753128832c0f6fc0ec3d84eebb))

# [2.0.0](https://github.com/qlik-oss/nebula.js/compare/v2.0.0-beta.1...v2.0.0) (2021-09-30)

### Bug Fixes

- only fetch apps from qlikcloud ([#680](https://github.com/qlik-oss/nebula.js/issues/680)) ([4d53c7e](https://github.com/qlik-oss/nebula.js/commit/4d53c7e757111c37aaa34062b4562534ff58a333))

# [2.0.0-beta.1](https://github.com/qlik-oss/nebula.js/compare/v1.7.0...v2.0.0-beta.1) (2021-09-21)

### Bug Fixes

- **deps:** update dependency webpack-dev-server to v4 ([#667](https://github.com/qlik-oss/nebula.js/issues/667)) ([d3c9602](https://github.com/qlik-oss/nebula.js/commit/d3c96029bf583a0e60c8ef3add1e3f6e5f3766ef))

### Features

- add types to nebula serve ([#658](https://github.com/qlik-oss/nebula.js/issues/658)) ([29e8730](https://github.com/qlik-oss/nebula.js/commit/29e8730020f3491c34643a19335ad12ae1c2de08))

# [1.7.0](https://github.com/qlik-oss/nebula.js/compare/v1.6.0...v1.7.0) (2021-08-24)

### Features

- give charts access to the nebula instance through useEmbed ([#650](https://github.com/qlik-oss/nebula.js/issues/650)) ([0d19f69](https://github.com/qlik-oss/nebula.js/commit/0d19f698ad3f88edc9459dcb721d9744e5c44c01))

# [1.6.0](https://github.com/qlik-oss/nebula.js/compare/v1.5.0...v1.6.0) (2021-08-16)

### Bug Fixes

- **deps:** update dependency ws to v8 ([#646](https://github.com/qlik-oss/nebula.js/issues/646)) ([f493307](https://github.com/qlik-oss/nebula.js/commit/f4933076d9b3a46c642944edb0790d7452a69a77))

# [1.5.0](https://github.com/qlik-oss/nebula.js/compare/v1.4.0...v1.5.0) (2021-07-01)

### Bug Fixes

- **cli-serve:** apply config when using javascript API and handle missing serve ([#631](https://github.com/qlik-oss/nebula.js/issues/631)) ([e321c18](https://github.com/qlik-oss/nebula.js/commit/e321c186dfefa5deb01fd0cc6e24eae296d38147))

# [1.4.0](https://github.com/qlik-oss/nebula.js/compare/v1.3.0...v1.4.0) (2021-06-28)

### Bug Fixes

- **deps:** update dependency puppeteer to v10 ([#617](https://github.com/qlik-oss/nebula.js/issues/617)) ([5c71bec](https://github.com/qlik-oss/nebula.js/commit/5c71bec36fab9ff210b1193410349e944b3e647a))
- **deps:** update dependency ws to v7.4.6 [security] ([#620](https://github.com/qlik-oss/nebula.js/issues/620)) ([0bef29b](https://github.com/qlik-oss/nebula.js/commit/0bef29b4c784d26dede19c9cb3cf24e1fc75ad65))

# [1.3.0](https://github.com/qlik-oss/nebula.js/compare/v1.2.0...v1.3.0) (2021-06-01)

### Bug Fixes

- **serve:** fix themes to use id, not key ([#608](https://github.com/qlik-oss/nebula.js/issues/608)) ([76189a7](https://github.com/qlik-oss/nebula.js/commit/76189a7d06de6a0f5b8eb23a587e86ef52526246))

# [1.2.0](https://github.com/qlik-oss/nebula.js/compare/v1.1.1...v1.2.0) (2021-05-12)

### Bug Fixes

- **deps:** update dependency puppeteer to v9 ([#604](https://github.com/qlik-oss/nebula.js/issues/604)) ([c1eb3fb](https://github.com/qlik-oss/nebula.js/commit/c1eb3fbd16fbe19d97a46d2631eb608183290176))

## [1.1.1](https://github.com/qlik-oss/nebula.js/compare/v1.1.0...v1.1.1) (2021-04-19)

### Bug Fixes

- make sure ActionsTooblar doesn't steal focus ([#597](https://github.com/qlik-oss/nebula.js/issues/597)) ([20846e9](https://github.com/qlik-oss/nebula.js/commit/20846e9667c1dfc93d46e17a9e44a1060489226a))
- **deps:** update dependency puppeteer to v8 ([#586](https://github.com/qlik-oss/nebula.js/issues/586)) ([24888f1](https://github.com/qlik-oss/nebula.js/commit/24888f1ab2d800edf3ae9ffa5a9b64bc9ee61c8f))

# [1.1.0](https://github.com/qlik-oss/nebula.js/compare/v1.1.0-alpha0...v1.1.0) (2021-02-01)

### Bug Fixes

- trim whitespace before using url ([#559](https://github.com/qlik-oss/nebula.js/issues/559)) ([b047758](https://github.com/qlik-oss/nebula.js/commit/b047758))

# [1.1.0-alpha0](https://github.com/qlik-oss/nebula.js/compare/v1.0.2-alpha.1...v1.1.0-alpha0) (2021-01-21)

**Note:** Version bump only for package @nebula.js/cli-serve

## [1.0.2-alpha.1](https://github.com/qlik-oss/nebula.js/compare/v1.0.2-alpha.0...v1.0.2-alpha.1) (2020-12-04)

### Features

- add exportProperties for hypercube conversion ([#537](https://github.com/qlik-oss/nebula.js/issues/537)) ([5ec6a8a](https://github.com/qlik-oss/nebula.js/commit/5ec6a8a))
- support ListObject ([#526](https://github.com/qlik-oss/nebula.js/issues/526)) ([c0daa04](https://github.com/qlik-oss/nebula.js/commit/c0daa04))

## [1.0.1](https://github.com/qlik-oss/nebula.js/compare/v1.0.0...v1.0.1) (2020-06-22)

**Note:** Version bump only for package @nebula.js/cli-serve

# [1.0.0](https://github.com/qlik-oss/nebula.js/compare/v1.0.0-alpha.0...v1.0.0) (2020-06-09)

**Note:** Version bump only for package @nebula.js/cli-serve

# [1.0.0-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v0.6.1...v1.0.0-alpha.0) (2020-06-09)

### Bug Fixes

- desktop app name ([#429](https://github.com/qlik-oss/nebula.js/issues/429)) ([4457433](https://github.com/qlik-oss/nebula.js/commit/4457433))

## [0.6.1](https://github.com/qlik-oss/nebula.js/compare/v0.6.0...v0.6.1) (2020-05-15)

**Note:** Version bump only for package @nebula.js/cli-serve

# [0.5.0](https://github.com/qlik-oss/nebula.js/compare/v0.4.0...v0.5.0) (2020-04-20)

### Bug Fixes

- **cli-serve:** remove react warning ([#400](https://github.com/qlik-oss/nebula.js/issues/400)) ([332929b](https://github.com/qlik-oss/nebula.js/commit/332929b))
- **cli-serve:** used shared storage ([#396](https://github.com/qlik-oss/nebula.js/issues/396)) ([b3d061c](https://github.com/qlik-oss/nebula.js/commit/b3d061c))

### Features

- actions ([#401](https://github.com/qlik-oss/nebula.js/issues/401)) ([d99eabc](https://github.com/qlik-oss/nebula.js/commit/d99eabc)), closes [#398](https://github.com/qlik-oss/nebula.js/issues/398)

# [0.4.0](https://github.com/qlik-oss/nebula.js/compare/v0.3.0...v0.4.0) (2020-04-02)

### Features

- responsive object selections ([#389](https://github.com/qlik-oss/nebula.js/issues/389)) ([63d8cc1](https://github.com/qlik-oss/nebula.js/commit/63d8cc1)), closes [#381](https://github.com/qlik-oss/nebula.js/issues/381)

# [0.3.0](https://github.com/qlik-oss/nebula.js/compare/v0.2.1...v0.3.0) (2020-03-30)

### Features

- responsive app selections ([#378](https://github.com/qlik-oss/nebula.js/issues/378)) ([6f3d496](https://github.com/qlik-oss/nebula.js/commit/6f3d496)), closes [#326](https://github.com/qlik-oss/nebula.js/issues/326)
