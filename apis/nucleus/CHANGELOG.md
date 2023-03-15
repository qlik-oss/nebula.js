# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v3.3.0...v4.0.0-alpha.0) (2023-03-14)

### Bug Fixes

- adapt container padding to grid mode ([#1140](https://github.com/qlik-oss/nebula.js/issues/1140)) ([fe78bac](https://github.com/qlik-oss/nebula.js/commit/fe78bac55faff97a716f7286b98c55a827b88ebf))
- align search icons and cells ([#1135](https://github.com/qlik-oss/nebula.js/issues/1135)) ([0dd499c](https://github.com/qlik-oss/nebula.js/commit/0dd499ce8777ee421deb616b6ed45e0ad1ebb64e))
- clear old handler when sn-filter-pane is cut/deleted ([#1142](https://github.com/qlik-oss/nebula.js/issues/1142)) ([873615e](https://github.com/qlik-oss/nebula.js/commit/873615e7b84143eaf927a39df035e1ad9501483b))
- fix filter pane header change the height on selection ([#1124](https://github.com/qlik-oss/nebula.js/issues/1124)) ([65f2a1a](https://github.com/qlik-oss/nebula.js/commit/65f2a1aa0fdce585b67295dd1468c213ec48e528))
- fixed frequency width and hide when width is too small ([#1136](https://github.com/qlik-oss/nebula.js/issues/1136)) ([a420ff2](https://github.com/qlik-oss/nebula.js/commit/a420ff2253fc38557b5ea46e02a7281c27b6bfa9))
- harmonise styles ([#1125](https://github.com/qlik-oss/nebula.js/issues/1125)) ([1ecafb8](https://github.com/qlik-oss/nebula.js/commit/1ecafb8d2b22c8b396a78ba946a4bbf50ce10ca0))
- hide search icon and scrollbar of a filter pane in edit mode ([#1127](https://github.com/qlik-oss/nebula.js/issues/1127)) ([46b678d](https://github.com/qlik-oss/nebula.js/commit/46b678d854c122ac95020364ea0eb2dfd6adafb9))
- hide search toggle button when not needed ([#1141](https://github.com/qlik-oss/nebula.js/issues/1141)) ([b7e2063](https://github.com/qlik-oss/nebula.js/commit/b7e20633d8dbfb83104aa98718905cb93240472e))
- optimise components below RowColumn and right align with styling fixes ([#1122](https://github.com/qlik-oss/nebula.js/issues/1122)) ([5c88236](https://github.com/qlik-oss/nebula.js/commit/5c88236cc7dad1ad84d65b38539fee141701d9ac))
- prevent flickering from engine update during selection ([#1126](https://github.com/qlik-oss/nebula.js/issues/1126)) ([e2a43c0](https://github.com/qlik-oss/nebula.js/commit/e2a43c0e5d99c0e8a78d6bfd49df9a8217f7d924))
- render listLayout opt properly ([#1130](https://github.com/qlik-oss/nebula.js/issues/1130)) ([a70b61a](https://github.com/qlik-oss/nebula.js/commit/a70b61a693784415e40c4eaf93076326d2e3c334))
- show drilldown icon for drilldown dimension ([#1129](https://github.com/qlik-oss/nebula.js/issues/1129)) ([f679e96](https://github.com/qlik-oss/nebula.js/commit/f679e96d13d72c657ffaf5bf2826af178d5bb9ed))
- use a key that triggers an update ([#1128](https://github.com/qlik-oss/nebula.js/issues/1128)) ([e94522f](https://github.com/qlik-oss/nebula.js/commit/e94522f51daed7bb1b5f0c1add590d1ce3622050))

### Features

- add tooltip for listbox title ([#1138](https://github.com/qlik-oss/nebula.js/issues/1138)) ([8f80fe1](https://github.com/qlik-oss/nebula.js/commit/8f80fe147544e373bbea90aa1d5750e6beb13f93))

# [3.3.0](https://github.com/qlik-oss/nebula.js/compare/v3.3.0-alpha.0...v3.3.0) (2023-03-10)

### Bug Fixes

- avoid re-render on unchanged-context ([#1117](https://github.com/qlik-oss/nebula.js/issues/1117)) ([ad37bc4](https://github.com/qlik-oss/nebula.js/commit/ad37bc4ac690dd326010c85dc794aa8d67634c22))
- no re-render of inline listbox from extra useLayout updates ([#1119](https://github.com/qlik-oss/nebula.js/issues/1119)) ([f47a7ba](https://github.com/qlik-oss/nebula.js/commit/f47a7ba5b634083626a4f4054f4de34a59479677))
- remove broken unused parts of appSelections ([#1118](https://github.com/qlik-oss/nebula.js/issues/1118)) ([760e80e](https://github.com/qlik-oss/nebula.js/commit/760e80e333d0fe34b8d66485c456d0e44f91e483))

# [3.3.0-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v3.2.2...v3.3.0-alpha.0) (2023-03-09)

### Bug Fixes

- assign id to all session listboxes ([#1115](https://github.com/qlik-oss/nebula.js/issues/1115)) ([a95a376](https://github.com/qlik-oss/nebula.js/commit/a95a37656c6b8d7d2655e4671015ce79a901d47f))
- autofocus search (listbox-inline) ([#1113](https://github.com/qlik-oss/nebula.js/issues/1113)) ([0244114](https://github.com/qlik-oss/nebula.js/commit/02441143b8a16475009eabd7f496163042ca98dc))
- correctly hide hidden fields in app selections ([#1094](https://github.com/qlik-oss/nebula.js/issues/1094)) ([f3213e7](https://github.com/qlik-oss/nebula.js/commit/f3213e7dea673df907072bf8ab84212f29dd287d))
- do not show Search box on selection when there is no title ([#1106](https://github.com/qlik-oss/nebula.js/issues/1106)) ([9ea0b83](https://github.com/qlik-oss/nebula.js/commit/9ea0b83656bb6ba3d4adf79385b1001094bc648d))
- fix counting the number of dimensions in a filter pane ([#1107](https://github.com/qlik-oss/nebula.js/issues/1107)) ([8cf3126](https://github.com/qlik-oss/nebula.js/commit/8cf31260b137675daae125cfcc4a358371595a5a))
- **listbox-search:** crash while searching within listbox with empty records ([#1104](https://github.com/qlik-oss/nebula.js/issues/1104)) ([6d025fd](https://github.com/qlik-oss/nebula.js/commit/6d025fd0d51b649b70b980f7ff0ce0e83538fc86))
- **Listbox:** add missing default props listbox ([#1111](https://github.com/qlik-oss/nebula.js/issues/1111)) ([21d0a4a](https://github.com/qlik-oss/nebula.js/commit/21d0a4a728a721f250df3473dce02d4fde3505c1))
- **Listbox:** truncate title, don't wrap title ([#1109](https://github.com/qlik-oss/nebula.js/issues/1109)) ([92014d9](https://github.com/qlik-oss/nebula.js/commit/92014d950092a0069c9000db8fd592b86f95ff15))
- **Listbox:** use fallback title ([#1114](https://github.com/qlik-oss/nebula.js/issues/1114)) ([f1a958b](https://github.com/qlik-oss/nebula.js/commit/f1a958baab99e97dbeeef991267418e325a0e3f4))
- search wildcard cursor & icons update ([#1096](https://github.com/qlik-oss/nebula.js/issues/1096)) ([52e2278](https://github.com/qlik-oss/nebula.js/commit/52e22787ba387f39e5837bc5b0fd2ec815270276))

### Features

- **listbox-popover:** Tab stop for search ([#1097](https://github.com/qlik-oss/nebula.js/issues/1097)) ([a65e7a1](https://github.com/qlik-oss/nebula.js/commit/a65e7a1f83aed0491d159c6c2174fcf2b8a5483b))
- **Listbox:** keyboard nav on hover ([#1101](https://github.com/qlik-oss/nebula.js/issues/1101)) ([1ebdb00](https://github.com/qlik-oss/nebula.js/commit/1ebdb00d7da02453b8518f8f2b54dc5035ce9bc2))
- **Listbox:** remove inSelection search option ([#1112](https://github.com/qlik-oss/nebula.js/issues/1112)) ([d54a321](https://github.com/qlik-oss/nebula.js/commit/d54a3218166c26a5809409648b7c02cb7008fcac))

## [3.2.2](https://github.com/qlik-oss/nebula.js/compare/v3.2.1...v3.2.2) (2023-02-28)

### Bug Fixes

- listbox more menu is broken ([#1089](https://github.com/qlik-oss/nebula.js/issues/1089)) ([662a136](https://github.com/qlik-oss/nebula.js/commit/662a1366499ae4768b80978f73a8914ecdde1bfd))

### Features

- **listbox:** enabling listbox popover for master dims ([#1088](https://github.com/qlik-oss/nebula.js/issues/1088)) ([d3126f0](https://github.com/qlik-oss/nebula.js/commit/d3126f09df1e19425e40ea58a8c8c1ad8df1bb42))

## [3.2.1](https://github.com/qlik-oss/nebula.js/compare/v3.2.0...v3.2.1) (2023-02-27)

**Note:** Version bump only for package @nebula.js/nucleus

# [3.2.0](https://github.com/qlik-oss/nebula.js/compare/v3.1.3...v3.2.0) (2023-02-27)

### Bug Fixes

- align listbox search button ([#1087](https://github.com/qlik-oss/nebula.js/issues/1087)) ([9dbcc13](https://github.com/qlik-oss/nebula.js/commit/9dbcc1365950e04cb4ed948b9f3179ed8dfa27fc))

### Features

- add property for disabling listbox search ([#1081](https://github.com/qlik-oss/nebula.js/issues/1081)) ([f9d437b](https://github.com/qlik-oss/nebula.js/commit/f9d437b17ba74d58bfa3ed3371fbd73b4ccef851))
- listbox search icon button changes ([#1083](https://github.com/qlik-oss/nebula.js/issues/1083)) ([082b28a](https://github.com/qlik-oss/nebula.js/commit/082b28a16a18701b14082649e596dff05f27d7c0))
- **Listbox:** add selection events ([#1078](https://github.com/qlik-oss/nebula.js/issues/1078)) ([12aaff9](https://github.com/qlik-oss/nebula.js/commit/12aaff9ed5c21b596ba1f5daccd36b59e1f6ba1e))
- **Listbox:** hide toolbar ([#1080](https://github.com/qlik-oss/nebula.js/issues/1080)) ([db493de](https://github.com/qlik-oss/nebula.js/commit/db493de0adca5467b6b0bb9b694c4b37e2cac639))
- **Listbox:** show search in selection ([#1077](https://github.com/qlik-oss/nebula.js/issues/1077)) ([58344b7](https://github.com/qlik-oss/nebula.js/commit/58344b7e0e239324c8e453f00dd05fcf50760c2d))

## [3.1.3](https://github.com/qlik-oss/nebula.js/compare/v3.1.2...v3.1.3) (2023-02-09)

### Features

- expose close event for listbox popover ([#1070](https://github.com/qlik-oss/nebula.js/issues/1070)) ([e92aeb0](https://github.com/qlik-oss/nebula.js/commit/e92aeb058a38758eb2a7f957c69fd065fca7da3e))
- **Listbox:** load end of data ([#1068](https://github.com/qlik-oss/nebula.js/issues/1068)) ([ae14bc4](https://github.com/qlik-oss/nebula.js/commit/ae14bc48560164f9f936ff0038e69dc5ab84df81))
- wildcard search ([#1075](https://github.com/qlik-oss/nebula.js/issues/1075)) ([a2ba9c2](https://github.com/qlik-oss/nebula.js/commit/a2ba9c2a3013be78c73e155fe014f2ad7d93eb7b))

## [3.1.2](https://github.com/qlik-oss/nebula.js/compare/v3.1.1...v3.1.2) (2023-01-30)

### Features

- created object now can extend initial properties ([#1063](https://github.com/qlik-oss/nebula.js/issues/1063)) ([c14a1e6](https://github.com/qlik-oss/nebula.js/commit/c14a1e64a4a03d3aaef72949f01ec358d8ce2a22))
- listbox popover api ([#1067](https://github.com/qlik-oss/nebula.js/issues/1067)) ([744fe21](https://github.com/qlik-oss/nebula.js/commit/744fe2189d3e0ade89b2855980c9e7d429765053))
- **Listbox:** overflow disclaimer ([#1059](https://github.com/qlik-oss/nebula.js/issues/1059)) ([ed97b08](https://github.com/qlik-oss/nebula.js/commit/ed97b081729053262fa0b69c23509a5d9f3f63cd))

### Reverts

- Revert "fix!: created object now extend initial properties" ([6e07403](https://github.com/qlik-oss/nebula.js/commit/6e0740369ceaf9deefd15e5e560bbff499a1fcda))

## [3.1.1](https://github.com/qlik-oss/nebula.js/compare/v3.1.0...v3.1.1) (2023-01-22)

**Note:** Version bump only for package @nebula.js/nucleus

# [3.1.0](https://github.com/qlik-oss/nebula.js/compare/v3.1.0-alpha.5...v3.1.0) (2023-01-17)

**Note:** Version bump only for package @nebula.js/nucleus

# [3.1.0-alpha.5](https://github.com/qlik-oss/nebula.js/compare/v3.1.0-alpha.4...v3.1.0-alpha.5) (2023-01-13)

**Note:** Version bump only for package @nebula.js/nucleus

# [3.1.0-alpha.4](https://github.com/qlik-oss/nebula.js/compare/v3.1.0-alpha.3...v3.1.0-alpha.4) (2023-01-13)

### Bug Fixes

- **listbox:** Listobx's selection dropdown anchor issue ([#1048](https://github.com/qlik-oss/nebula.js/issues/1048)) ([270769c](https://github.com/qlik-oss/nebula.js/commit/270769c7a559c5c8cd6c169eb81d726e6fc817cd))
- prevent rendering empty values ([#1035](https://github.com/qlik-oss/nebula.js/issues/1035)) ([02e1ec3](https://github.com/qlik-oss/nebula.js/commit/02e1ec372d2011a61525478795b3d93d6c6a691f))

### Features

- add checkboxes, histogram as properties ([#1028](https://github.com/qlik-oss/nebula.js/issues/1028)) ([a333cf9](https://github.com/qlik-oss/nebula.js/commit/a333cf9dd175844070acbe89dd23c6b8093565e1))
- add disclaimer listbox search ([#1030](https://github.com/qlik-oss/nebula.js/issues/1030)) ([4a5b407](https://github.com/qlik-oss/nebula.js/commit/4a5b40723271def71ba42134a76a37f002012100))
- listbox grid layout ([#994](https://github.com/qlik-oss/nebula.js/issues/994)) ([897275a](https://github.com/qlik-oss/nebula.js/commit/897275ae7c79b8214af9c99ce4e9288bbf288690))
- listbox text alignment ([#933](https://github.com/qlik-oss/nebula.js/issues/933)) ([4fec8b0](https://github.com/qlik-oss/nebula.js/commit/4fec8b06d35f86c391d6eb972720a9354a44a7ca))
- **Listbox:** row height ([#1029](https://github.com/qlik-oss/nebula.js/issues/1029)) ([1076ed4](https://github.com/qlik-oss/nebula.js/commit/1076ed4bb5e2a64e9c1592695d99882d42215401))

# [3.1.0-alpha.3](https://github.com/qlik-oss/nebula.js/compare/v3.1.0-alpha.2...v3.1.0-alpha.3) (2022-12-12)

### Bug Fixes

- leave freqmode alone ([#1026](https://github.com/qlik-oss/nebula.js/issues/1026)) ([f644c35](https://github.com/qlik-oss/nebula.js/commit/f644c35e1bb9c789190f5d1502db314b9842df41))
- make click outside work for an embedded sheet scenario ([#1024](https://github.com/qlik-oss/nebula.js/issues/1024)) ([179ed92](https://github.com/qlik-oss/nebula.js/commit/179ed920bc70eb35308eec9c83b9f59b998b62b1))

### Features

- enable frequency count property ([#1021](https://github.com/qlik-oss/nebula.js/issues/1021)) ([1dd4f9d](https://github.com/qlik-oss/nebula.js/commit/1dd4f9d293bef928d5bcea38c2035ec192ef1a11))
- Listbox specific theme ([#1022](https://github.com/qlik-oss/nebula.js/issues/1022)) ([8e2ec66](https://github.com/qlik-oss/nebula.js/commit/8e2ec6682672207359ba80cf434a35110ef27a2f))
- sheet embed support ([#1013](https://github.com/qlik-oss/nebula.js/issues/1013)) ([3dacac5](https://github.com/qlik-oss/nebula.js/commit/3dacac587b4dfa6c3196683a416357ba8dc6a88e))

# [3.1.0-alpha.2](https://github.com/qlik-oss/nebula.js/compare/v3.1.0-alpha.1...v3.1.0-alpha.2) (2022-12-02)

**Note:** Version bump only for package @nebula.js/nucleus

# [3.1.0-alpha.1](https://github.com/qlik-oss/nebula.js/compare/v3.1.0-alpha.0...v3.1.0-alpha.1) (2022-11-28)

### Bug Fixes

- **ListBox:** accept search results only if there are hits ([#1005](https://github.com/qlik-oss/nebula.js/issues/1005)) ([7bab415](https://github.com/qlik-oss/nebula.js/commit/7bab41537b0e481823ee1c8d46e0ef9943b4227e))

### Features

- add dense as a property ([#1010](https://github.com/qlik-oss/nebula.js/issues/1010)) ([7d95042](https://github.com/qlik-oss/nebula.js/commit/7d95042a1d46ff5ccf51326f126f7574f26b94ac))

# [3.1.0-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v3.0.4...v3.1.0-alpha.0) (2022-10-21)

### Bug Fixes

- **a11y:** Casey's access fixes ([#966](https://github.com/qlik-oss/nebula.js/issues/966)) ([03641e1](https://github.com/qlik-oss/nebula.js/commit/03641e141ac97eed5394d6ad12ef8e950f438fbb))
- prevent error by ensuring removeListener ([#964](https://github.com/qlik-oss/nebula.js/issues/964)) ([0e4bbe6](https://github.com/qlik-oss/nebula.js/commit/0e4bbe6b840790a2f97b27ae9a2d68f5d433b355))

### Features

- enabled support for background image and color ([#921](https://github.com/qlik-oss/nebula.js/issues/921)) ([b005bfb](https://github.com/qlik-oss/nebula.js/commit/b005bfb075098a656ba8b38f9bbe5f18a89a762a))
- render existing listbox objects ([#957](https://github.com/qlik-oss/nebula.js/issues/957)) ([f924122](https://github.com/qlik-oss/nebula.js/commit/f9241228885366e8c68086b1e4b06123ff3572bc))

## [3.0.4](https://github.com/qlik-oss/nebula.js/compare/v3.0.3...v3.0.4) (2022-10-13)

### Bug Fixes

- only handle space & enter on container focus ([#961](https://github.com/qlik-oss/nebula.js/issues/961)) ([a2a3771](https://github.com/qlik-oss/nebula.js/commit/a2a3771bc44d4b242bec0d3555879b1e1a18a7b6))

## [3.0.3](https://github.com/qlik-oss/nebula.js/compare/v3.0.2...v3.0.3) (2022-09-30)

**Note:** Version bump only for package @nebula.js/nucleus

## [3.0.2](https://github.com/qlik-oss/nebula.js/compare/v3.0.2-alpha.0...v3.0.2) (2022-09-21)

**Note:** Version bump only for package @nebula.js/nucleus

## [3.0.2-alpha.0](https://github.com/qlik-oss/nebula.js/compare/v3.0.1...v3.0.2-alpha.0) (2022-09-21)

### Bug Fixes

- apply styles on header element ([#932](https://github.com/qlik-oss/nebula.js/issues/932)) ([6ce2a74](https://github.com/qlik-oss/nebula.js/commit/6ce2a74b8e8079bcd826edc3e40238502a44db0f))

## [3.0.1](https://github.com/qlik-oss/nebula.js/compare/v3.0.0...v3.0.1) (2022-09-20)

### Reverts

- Revert "refactor: support multiple dims for filterpane (#917)" (#930) ([2e71bc1](https://github.com/qlik-oss/nebula.js/commit/2e71bc1b2686355bc22c9c4a2740ec6d5517a51d)), closes [#917](https://github.com/qlik-oss/nebula.js/issues/917) [#930](https://github.com/qlik-oss/nebula.js/issues/930)

# [3.0.0](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-rc.3...v3.0.0) (2022-09-19)

**Note:** Version bump only for package @nebula.js/nucleus

# [3.0.0-rc.3](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-rc.2...v3.0.0-rc.3) (2022-09-16)

**Note:** Version bump only for package @nebula.js/nucleus

# [3.0.0-rc.2](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-rc.1...v3.0.0-rc.2) (2022-08-31)

### Bug Fixes

- add check for rtl-ltr for direction prop ([#904](https://github.com/qlik-oss/nebula.js/issues/904)) ([f5d9e83](https://github.com/qlik-oss/nebula.js/commit/f5d9e83959f31c04ae9fbe39eae6fd0b40a3252a))
- listobject pp component issues ([#905](https://github.com/qlik-oss/nebula.js/issues/905)) ([d49b2bd](https://github.com/qlik-oss/nebula.js/commit/d49b2bd7e1daae458a572950b7db63dfa33cdf4c))

# [3.0.0-rc.1](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha13...v3.0.0-rc.1) (2022-08-30)

### Bug Fixes

- get back the styled scrollbar ([#899](https://github.com/qlik-oss/nebula.js/issues/899)) ([0743cd0](https://github.com/qlik-oss/nebula.js/commit/0743cd0e84f7806dfa06b8802b7337e3a4f57b37))

# [3.0.0-alpha13](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha12...v3.0.0-alpha13) (2022-08-22)

**Note:** Version bump only for package @nebula.js/nucleus

# [3.0.0-alpha12](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha11...v3.0.0-alpha12) (2022-08-22)

### Bug Fixes

- **ListBox:** Prevent empty list because of 0 items ([#898](https://github.com/qlik-oss/nebula.js/issues/898)) ([a48dff3](https://github.com/qlik-oss/nebula.js/commit/a48dff3299a590e7e5c1b0d02de658c861d97ad9))
- merge passed properties. remove sortByState option ([#875](https://github.com/qlik-oss/nebula.js/issues/875)) ([ee2ec3b](https://github.com/qlik-oss/nebula.js/commit/ee2ec3bb35f45e14586e615402418e654749b283))

# [3.0.0-alpha11](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha10...v3.0.0-alpha11) (2022-07-26)

### Bug Fixes

- correct height calculation of listbox ([#889](https://github.com/qlik-oss/nebula.js/issues/889)) ([35ca9ef](https://github.com/qlik-oss/nebula.js/commit/35ca9ef128b17d80496c7c0425d502c2db98ccc3))

# [3.0.0-alpha10](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha9...v3.0.0-alpha10) (2022-07-13)

**Note:** Version bump only for package @nebula.js/nucleus

**Note:** Version bump only for package @nebula.js/nucleus

# [3.0.0-alpha9](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha8...v3.0.0-alpha9) (2022-07-13)

**Note:** Version bump only for package @nebula.js/nucleus

**Note:** Version bump only for package @nebula.js/nucleus

# [3.0.0-alpha8](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha7...v3.0.0-alpha8) (2022-07-13)

**Note:** Version bump only for package @nebula.js/nucleus

**Note:** Version bump only for package @nebula.js/nucleus

# [3.0.0-alpha6](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha5...v3.0.0-alpha6) (2022-07-01)

### Bug Fixes

- enable enter key to apply selection in searches ([#881](https://github.com/qlik-oss/nebula.js/issues/881)) ([b786a5b](https://github.com/qlik-oss/nebula.js/commit/b786a5be708eabe7e369d31c32f5655a683abec7))
- reset list if search is exited ([#874](https://github.com/qlik-oss/nebula.js/issues/874)) ([a2c89ea](https://github.com/qlik-oss/nebula.js/commit/a2c89ea6582647a839a6a0f490a01228da26bda8))

# [3.0.0-alpha5](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha4...v3.0.0-alpha5) (2022-06-30)

### Bug Fixes

- issue with empty search results in listbox ([#873](https://github.com/qlik-oss/nebula.js/issues/873)) ([0a28eb7](https://github.com/qlik-oss/nebula.js/commit/0a28eb753a1753129702936991c09339c7f00094))

# [3.0.0-alpha4](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha3...v3.0.0-alpha4) (2022-06-29)

### Bug Fixes

- **BDI-5122:** empty search calls abort query ([#871](https://github.com/qlik-oss/nebula.js/issues/871)) ([4004dd1](https://github.com/qlik-oss/nebula.js/commit/4004dd12d9079e5bd21799418572d61e8ed0e400))
- filterBox react on qsize.qcy change when searching ([#872](https://github.com/qlik-oss/nebula.js/issues/872)) ([bff83bf](https://github.com/qlik-oss/nebula.js/commit/bff83bfd2b3f238ffac061fa280bffdf8544b83e))

# [3.0.0-alpha3](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha2...v3.0.0-alpha3) (2022-06-28)

### Bug Fixes

- disabling on enter select on listbox searches ([#870](https://github.com/qlik-oss/nebula.js/issues/870)) ([8d8dd53](https://github.com/qlik-oss/nebula.js/commit/8d8dd53323b7b848612a934fb8188f5508682f18))

# [3.0.0-alpha2](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha1...v3.0.0-alpha2) (2022-06-28)

### Bug Fixes

- horizontal listbox ([#862](https://github.com/qlik-oss/nebula.js/issues/862)) ([375e36a](https://github.com/qlik-oss/nebula.js/commit/375e36a5272bf6092184ed46879303959126adc0))
- **listbox:** prop to disable confirming selections on blur events ([#866](https://github.com/qlik-oss/nebula.js/issues/866)) ([d680826](https://github.com/qlik-oss/nebula.js/commit/d6808267717ef76b20dccc1719e170c49e54cc38))
- the selections is missing in dependency arrays ([#865](https://github.com/qlik-oss/nebula.js/issues/865)) ([#867](https://github.com/qlik-oss/nebula.js/issues/867)) ([88fa194](https://github.com/qlik-oss/nebula.js/commit/88fa194fc76a3ca7f9ec9305147aaf95144ab6c0))

# [3.0.0-alpha1](https://github.com/qlik-oss/nebula.js/compare/v3.0.0-alpha0...v3.0.0-alpha1) (2022-06-23)

### Bug Fixes

- add italic to checkbox text when excluded ([#855](https://github.com/qlik-oss/nebula.js/issues/855)) ([97dbc77](https://github.com/qlik-oss/nebula.js/commit/97dbc778b3b5a075ea05f9d0155856655a3e4cfe))
- multistate style ([#856](https://github.com/qlik-oss/nebula.js/issues/856)) ([6de8afa](https://github.com/qlik-oss/nebula.js/commit/6de8afa5bba7a62a00563ce8de43477e00491632))

# [3.0.0-alpha0](https://github.com/qlik-oss/nebula.js/compare/v2.11.0...v3.0.0-alpha0) (2022-06-16)

### Bug Fixes

- fix OneAndOnlyOne in app and object selection toolbar ([#850](https://github.com/qlik-oss/nebula.js/issues/850)) ([ac2689b](https://github.com/qlik-oss/nebula.js/commit/ac2689b693710b7f14ce54294f246e0debc32c2d))
- listbox radiobuttons fix ([#853](https://github.com/qlik-oss/nebula.js/issues/853)) ([09ddaec](https://github.com/qlik-oss/nebula.js/commit/09ddaeca491cb9578e416f89395f444510c15405))
- **nucleus:** fix layout timing with qIsOneAndOnlyOne ([#849](https://github.com/qlik-oss/nebula.js/issues/849)) ([6a2c46b](https://github.com/qlik-oss/nebula.js/commit/6a2c46b62e8891321eec356d7647885c0f273f9f))
- remove light-gray checkboxes in alternative state ([#846](https://github.com/qlik-oss/nebula.js/issues/846)) ([1da5e41](https://github.com/qlik-oss/nebula.js/commit/1da5e41ec25a2d742966773c1a1e59a6c803f6bd))

### Features

- data count to hosting app ([#848](https://github.com/qlik-oss/nebula.js/issues/848)) ([3907480](https://github.com/qlik-oss/nebula.js/commit/3907480a66ceef66997f323a8d135afba3fb92b5))
- **ListBox:** postProcessPages and calculatePagesHeight options ([#847](https://github.com/qlik-oss/nebula.js/issues/847)) ([715789d](https://github.com/qlik-oss/nebula.js/commit/715789d858094ed338f1c609b817fc2f8572f5bc))

# [2.11.0](https://github.com/qlik-oss/nebula.js/compare/v2.10.0...v2.11.0) (2022-06-01)

### Bug Fixes

- apply color when selecting ([#834](https://github.com/qlik-oss/nebula.js/issues/834)) ([58aa840](https://github.com/qlik-oss/nebula.js/commit/58aa840d8ec5bfb380b223b7b05eb62c4b7482d1))
- remove event listeners when unmounting ([#828](https://github.com/qlik-oss/nebula.js/issues/828)) ([0457175](https://github.com/qlik-oss/nebula.js/commit/04571756387c53ee554c30844d2f37760e3a2183))
- storybook does not work ([#838](https://github.com/qlik-oss/nebula.js/issues/838)) ([9f09d0b](https://github.com/qlik-oss/nebula.js/commit/9f09d0be77adc7ee9134d7c90385f38fb6a62117))
- **ac:** dense rows smaller ([#832](https://github.com/qlik-oss/nebula.js/issues/832)) ([1ea9105](https://github.com/qlik-oss/nebula.js/commit/1ea910544b867b3d77f250d9e990748aa0a60dcd))

### Features

- confirm selection when interacting outside of listbox ([#826](https://github.com/qlik-oss/nebula.js/issues/826)) ([5832698](https://github.com/qlik-oss/nebula.js/commit/5832698b36bb9af8ae686613cebf1f956baaa098))
- pass current scroll position to hosting app. set initial scroll position ([#837](https://github.com/qlik-oss/nebula.js/issues/837)) ([50fdefa](https://github.com/qlik-oss/nebula.js/commit/50fdefa9c70d4d79b2349ef1a37bf8c2bcf95597))

# [2.10.0](https://github.com/qlik-oss/nebula.js/compare/v2.9.0...v2.10.0) (2022-04-26)

### Features

- allow data insert in mocker ([#816](https://github.com/qlik-oss/nebula.js/issues/816)) ([1d9a0a2](https://github.com/qlik-oss/nebula.js/commit/1d9a0a2f10efd15cdcdf18308d299cd5f6d1b426))

# [2.9.0](https://github.com/qlik-oss/nebula.js/compare/v2.8.0...v2.9.0) (2022-04-01)

### Bug Fixes

- **Listbox:** Fix selections toggling on edit ([#809](https://github.com/qlik-oss/nebula.js/issues/809)) ([567cc28](https://github.com/qlik-oss/nebula.js/commit/567cc28256530b51cf4132412ac9ca0ff6828486))
- **NebulaListbox:** Minor tweaks ([#807](https://github.com/qlik-oss/nebula.js/issues/807)) ([9b38687](https://github.com/qlik-oss/nebula.js/commit/9b38687136ea917a112fc7bfa2bcf8a023cd471c))

### Features

- **Listbox:** add fill to checkboxes with state excluded or alternative ([#804](https://github.com/qlik-oss/nebula.js/issues/804)) ([b1a308e](https://github.com/qlik-oss/nebula.js/commit/b1a308edddbf4a32adb2b9fd6d7f7c16581b9b15))

# [2.8.0](https://github.com/qlik-oss/nebula.js/compare/v2.7.0...v2.8.0) (2022-03-25)

**Note:** Version bump only for package @nebula.js/nucleus

# [2.7.0](https://github.com/qlik-oss/nebula.js/compare/v2.6.1...v2.7.0) (2022-03-21)

### Bug Fixes

- update jsdocs for listbox ([#774](https://github.com/qlik-oss/nebula.js/issues/774)) ([c607e37](https://github.com/qlik-oss/nebula.js/commit/c607e372bb47432f53f5eaf16982368b39139223))

### Features

- add frequency count for listbox ([#770](https://github.com/qlik-oss/nebula.js/issues/770)) ([1ab3a4c](https://github.com/qlik-oss/nebula.js/commit/1ab3a4ca54acb17783ed24cadc2371ee22c478f7))

### Reverts

- Revert "chore: fix test for long running query" ([97b2de7](https://github.com/qlik-oss/nebula.js/commit/97b2de7df91799b7c96004db46b36bd4c6170527))

## [2.6.1](https://github.com/qlik-oss/nebula.js/compare/v2.6.0...v2.6.1) (2022-02-25)

**Note:** Version bump only for package @nebula.js/nucleus

# [2.6.0](https://github.com/qlik-oss/nebula.js/compare/v2.5.0...v2.6.0) (2022-02-25)

### Features

- **listbox:** dense mode with reduced padding and text size ([#769](https://github.com/qlik-oss/nebula.js/issues/769)) ([86f21c4](https://github.com/qlik-oss/nebula.js/commit/86f21c4b05ac4bea02d589e25960dc6de58f8b5b))

# [2.5.0](https://github.com/qlik-oss/nebula.js/compare/v2.4.1...v2.5.0) (2022-02-15)

### Bug Fixes

- **jsdoc:** mark mount and unmount as instance functions ([#763](https://github.com/qlik-oss/nebula.js/issues/763)) ([51be0a4](https://github.com/qlik-oss/nebula.js/commit/51be0a4c580357c23defea37c00cca2798234fa8))
- mark version as optional ([#761](https://github.com/qlik-oss/nebula.js/issues/761)) ([5bc52b0](https://github.com/qlik-oss/nebula.js/commit/5bc52b04c2fc250a09e777d0b2c6d306b20dc9af))

### Features

- option to disable cell padding for each object ([#765](https://github.com/qlik-oss/nebula.js/issues/765)) ([31d9ab8](https://github.com/qlik-oss/nebula.js/commit/31d9ab8bd66349e7d407ec357fe443a72586abe6))

## [2.4.1](https://github.com/qlik-oss/nebula.js/compare/v2.4.0...v2.4.1) (2022-02-10)

**Note:** Version bump only for package @nebula.js/nucleus

# [2.4.0](https://github.com/qlik-oss/nebula.js/compare/v2.3.1...v2.4.0) (2022-02-10)

**Note:** Version bump only for package @nebula.js/nucleus

## [2.3.1](https://github.com/qlik-oss/nebula.js/compare/v2.3.0...v2.3.1) (2021-12-09)

**Note:** Version bump only for package @nebula.js/nucleus

# [2.3.0](https://github.com/qlik-oss/nebula.js/compare/v2.2.0...v2.3.0) (2021-12-06)

### Bug Fixes

- **ActionsToolbar:** set keyDown to null when no keyboardAction ([#709](https://github.com/qlik-oss/nebula.js/issues/709)) ([8d69bd5](https://github.com/qlik-oss/nebula.js/commit/8d69bd56e265a8ec09fb1e863f9885faae80fbc7))

# [2.2.0](https://github.com/qlik-oss/nebula.js/compare/v2.1.0...v2.2.0) (2021-11-17)

### Features

- focus in and out of selection toolbar ([#701](https://github.com/qlik-oss/nebula.js/issues/701)) ([9b2a038](https://github.com/qlik-oss/nebula.js/commit/9b2a03804f35ad60303362a47fca217ba232de5b))

# [2.1.0](https://github.com/qlik-oss/nebula.js/compare/v2.0.0...v2.1.0) (2021-10-20)

### Features

- expose additional element ([#691](https://github.com/qlik-oss/nebula.js/issues/691)) ([a1faabf](https://github.com/qlik-oss/nebula.js/commit/a1faabfc7994a75dbd4f62aa743f02fb29e5919d))

# [2.0.0](https://github.com/qlik-oss/nebula.js/compare/v2.0.0-beta.1...v2.0.0) (2021-09-30)

**Note:** Version bump only for package @nebula.js/nucleus

# [2.0.0-beta.1](https://github.com/qlik-oss/nebula.js/compare/v1.7.0...v2.0.0-beta.1) (2021-09-21)

### Bug Fixes

- do not skip all updates if the rendering take long time ([#664](https://github.com/qlik-oss/nebula.js/issues/664)) ([4811d14](https://github.com/qlik-oss/nebula.js/commit/4811d1429661dd027fc042df3857ebcffebef881))

### Features

- add keyboard navigation support to nebula mashup ([#655](https://github.com/qlik-oss/nebula.js/issues/655)) ([417c8b2](https://github.com/qlik-oss/nebula.js/commit/417c8b221872f6d19d2fc1c72534ac28e6308541))
- expose classnames ([#673](https://github.com/qlik-oss/nebula.js/issues/673)) ([74fde09](https://github.com/qlik-oss/nebula.js/commit/74fde092f06cd40f0bf3e55f1ccbd346a12636d1))
- set conversion api to stable ([64d54b3](https://github.com/qlik-oss/nebula.js/commit/64d54b366b807c5d256ab32144acebfb19a12898))
- useRenderState hook ([#677](https://github.com/qlik-oss/nebula.js/issues/677)) ([b6388de](https://github.com/qlik-oss/nebula.js/commit/b6388de764bbf17ae4dd4ae250206db51026e536))

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
