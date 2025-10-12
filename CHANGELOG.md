# Changelog

## [0.8.12-beta.7](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.12-beta.6...v0.8.12-beta.7) (2025-10-12)


### Features

* support retrieve context from repo by AFS ([#175](https://github.com/AIGNE-io/aigne-doc-smith/issues/175)) ([352ce75](https://github.com/AIGNE-io/aigne-doc-smith/commit/352ce751ae9b51a71581793ead7952fb49cda7c4))


### Bug Fixes

* disable git based update history within git repo ([#180](https://github.com/AIGNE-io/aigne-doc-smith/issues/180)) ([826b4bd](https://github.com/AIGNE-io/aigne-doc-smith/commit/826b4bdeb5042b2dcd14ce1da975965ad7805347))

## [0.8.12-beta.6](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.12-beta.5...v0.8.12-beta.6) (2025-10-11)


### Bug Fixes

* **publish:** enhance access token retrieval and session check logic ([#178](https://github.com/AIGNE-io/aigne-doc-smith/issues/178)) ([e19e9f5](https://github.com/AIGNE-io/aigne-doc-smith/commit/e19e9f52b1c80ba8eb725cfa945cd312d0690ef1))

## [0.8.12-beta.5](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.12-beta.4...v0.8.12-beta.5) (2025-10-11)


### Bug Fixes

* **agent:** include missing locale on document check ([#176](https://github.com/AIGNE-io/aigne-doc-smith/issues/176)) ([8ca04f2](https://github.com/AIGNE-io/aigne-doc-smith/commit/8ca04f2d96b5fa20af65ed77b110d188079c7a29))

## [0.8.12-beta.4](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.12-beta.3...v0.8.12-beta.4) (2025-10-11)


### Features

* implement large context handling and optimize document generation ([#172](https://github.com/AIGNE-io/aigne-doc-smith/issues/172)) ([de09f7c](https://github.com/AIGNE-io/aigne-doc-smith/commit/de09f7c7f9d1ecbf620a6a4684be84f13f4fb644))


### Bug Fixes

* add heading level constraint for doc generating ([#170](https://github.com/AIGNE-io/aigne-doc-smith/issues/170)) ([f4c7163](https://github.com/AIGNE-io/aigne-doc-smith/commit/f4c71631cc89524abf945ae5f829f8111317a5bf))
* tune update tips and support clear deployment config  ([#174](https://github.com/AIGNE-io/aigne-doc-smith/issues/174)) ([71c19e0](https://github.com/AIGNE-io/aigne-doc-smith/commit/71c19e06730111f8b757e523abebaed57bbaea95))

## [0.8.12-beta.3](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.12-beta.2...v0.8.12-beta.3) (2025-10-09)


### Bug Fixes

* should not require admin when publish to cloud ([0a74dd1](https://github.com/AIGNE-io/aigne-doc-smith/commit/0a74dd19a2c2390ca223d0cc393661bf3f408a6f))

## [0.8.12-beta.2](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.12-beta.1...v0.8.12-beta.2) (2025-10-09)


### Bug Fixes

* fix update document include path ([#166](https://github.com/AIGNE-io/aigne-doc-smith/issues/166)) ([40c3aa2](https://github.com/AIGNE-io/aigne-doc-smith/commit/40c3aa2739cb35d36fb1daed87a0e23c81285328))
* resolve failure in document update and generate ([#168](https://github.com/AIGNE-io/aigne-doc-smith/issues/168)) ([c00c759](https://github.com/AIGNE-io/aigne-doc-smith/commit/c00c759473a01ce3d16b89f2bfa974f43420b82a))

## [0.8.12-beta.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.12-beta...v0.8.12-beta.1) (2025-10-08)


### Features

* add history tracking and make translation optional during update ([#165](https://github.com/AIGNE-io/aigne-doc-smith/issues/165)) ([e1d3d97](https://github.com/AIGNE-io/aigne-doc-smith/commit/e1d3d97c7e57c1c663c0478870aab7421de9d4bc))


### Bug Fixes

* split generate/update document & structure to system & user ([#159](https://github.com/AIGNE-io/aigne-doc-smith/issues/159)) ([ad1802d](https://github.com/AIGNE-io/aigne-doc-smith/commit/ad1802d1aecefc414ab3d1217a9ba31655479e86))

## [0.8.12-beta](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11...v0.8.12-beta) (2025-10-07)


### Bug Fixes

* read file tool should support relative path ([#162](https://github.com/AIGNE-io/aigne-doc-smith/issues/162)) ([cf1291b](https://github.com/AIGNE-io/aigne-doc-smith/commit/cf1291b0be5b51db15d052310c30b0552a4092e1))

## [0.8.11](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11-beta.7...v0.8.11) (2025-10-05)


### Miscellaneous Chores

* release 0.8.11 ([9c62cb5](https://github.com/AIGNE-io/aigne-doc-smith/commit/9c62cb5af233081f1b5c4a85d395eb01216040e5))

## [0.8.11-beta.7](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11-beta.6...v0.8.11-beta.7) (2025-10-03)


### Features

* enhance document generator and updater by fs tools ([#156](https://github.com/AIGNE-io/aigne-doc-smith/issues/156)) ([64ee91c](https://github.com/AIGNE-io/aigne-doc-smith/commit/64ee91c59498b4fd788e287cb81bbc640d042bcc))
* use shared context for faster structure and doc tuning ([#157](https://github.com/AIGNE-io/aigne-doc-smith/issues/157)) ([e5cb30e](https://github.com/AIGNE-io/aigne-doc-smith/commit/e5cb30ec114d51a19f0086b3e4aaf2ec70aea046))


### Bug Fixes

* update docs and refine custom component prompts ([#160](https://github.com/AIGNE-io/aigne-doc-smith/issues/160)) ([233f3ca](https://github.com/AIGNE-io/aigne-doc-smith/commit/233f3ca449646b39a3e493d2bb1fe59e50376827))

## [0.8.11-beta.6](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11-beta.5...v0.8.11-beta.6) (2025-10-02)


### Miscellaneous Chores

* release 0.8.11-beta.6 ([ecc8f5c](https://github.com/AIGNE-io/aigne-doc-smith/commit/ecc8f5c4ff9cc813e5cf7e35cbfdb915826cd183))

## [0.8.11-beta.5](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11-beta.4...v0.8.11-beta.5) (2025-10-01)


### Features

* add user role requirement for publish and custom rule support ([#151](https://github.com/AIGNE-io/aigne-doc-smith/issues/151)) ([95866f9](https://github.com/AIGNE-io/aigne-doc-smith/commit/95866f9fcb2ca697da42e950e9011b29913726d4))
* split d2 diagram generate as independent tool ([#152](https://github.com/AIGNE-io/aigne-doc-smith/issues/152)) ([8e9b811](https://github.com/AIGNE-io/aigne-doc-smith/commit/8e9b811dc6108bb19ab8a1853afb4cab92af1d62))

## [0.8.11-beta.4](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11-beta.3...v0.8.11-beta.4) (2025-09-30)


### Features

* add check-only option for agents with selection input ([#147](https://github.com/AIGNE-io/aigne-doc-smith/issues/147)) ([3340988](https://github.com/AIGNE-io/aigne-doc-smith/commit/3340988e67ffef7e1087d560930b3cf98c860693))


### Bug Fixes

* improve error handling in choose-docs utility ([#145](https://github.com/AIGNE-io/aigne-doc-smith/issues/145)) ([7052ffc](https://github.com/AIGNE-io/aigne-doc-smith/commit/7052ffc106817144bff815422dced7faa4dfc3e8))
* translation prompt tuned; translate comments only in code blocks ([#149](https://github.com/AIGNE-io/aigne-doc-smith/issues/149)) ([30ce2c0](https://github.com/AIGNE-io/aigne-doc-smith/commit/30ce2c0e43c01b6588b4ada84aafecfd83c1b23b))

## [0.8.11-beta.3](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11-beta.2...v0.8.11-beta.3) (2025-09-29)


### Bug Fixes

* add evaluation agents cil entry ([#143](https://github.com/AIGNE-io/aigne-doc-smith/issues/143)) ([016096a](https://github.com/AIGNE-io/aigne-doc-smith/commit/016096af6c0cec0b86fc538e1f0b7b42e928451b))

## [0.8.11-beta.2](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11-beta.1...v0.8.11-beta.2) (2025-09-27)


### Bug Fixes

* fix dependency conflicts ([8e06ce7](https://github.com/AIGNE-io/aigne-doc-smith/commit/8e06ce716620f4bc526971300eab664115ffd8f0))

## [0.8.11-beta.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.11-beta...v0.8.11-beta.1) (2025-09-27)


### Features

* **cli:** deploy website with @blocklet/payment-broker-client ([#139](https://github.com/AIGNE-io/aigne-doc-smith/issues/139)) ([a52f397](https://github.com/AIGNE-io/aigne-doc-smith/commit/a52f397728808e44ba41ccdcd7404ffa168fef94))
* **cli:** improve vendor handling and debugability on publish ([#138](https://github.com/AIGNE-io/aigne-doc-smith/issues/138)) ([430e17c](https://github.com/AIGNE-io/aigne-doc-smith/commit/430e17c4eadfc919bba66953bd93f21de00dba92))
* **core:** support doc evaluation and reports ([#140](https://github.com/AIGNE-io/aigne-doc-smith/issues/140)) ([3222f97](https://github.com/AIGNE-io/aigne-doc-smith/commit/3222f97c5b0c82039cd5b913ea42ea567e1d74e3))
* tune document and structure update with tools ([#137](https://github.com/AIGNE-io/aigne-doc-smith/issues/137)) ([90e645c](https://github.com/AIGNE-io/aigne-doc-smith/commit/90e645c0be8a5926d3f97009a449b539ef6b2954))


### Bug Fixes

* treat description as text node instead of markdown attribute value ([#136](https://github.com/AIGNE-io/aigne-doc-smith/issues/136)) ([67fccdd](https://github.com/AIGNE-io/aigne-doc-smith/commit/67fccdd6dc8faa272f3c58e3575909d7833c813b))

## [0.8.11-beta](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.10...v0.8.11-beta) (2025-09-22)


### Bug Fixes

* update readme docs ([#130](https://github.com/AIGNE-io/aigne-doc-smith/issues/130)) ([16b5acf](https://github.com/AIGNE-io/aigne-doc-smith/commit/16b5acf2398ee7b242c5f3229f2bcf2de2fad7d0))

## [0.8.10](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.10-beta.3...v0.8.10) (2025-09-20)


### Miscellaneous Chores

* release 0.8.10 ([35ac7c8](https://github.com/AIGNE-io/aigne-doc-smith/commit/35ac7c8fb56d6612595af1429ccad1b7804edeb8))
* release 0.8.10 ([59c98bb](https://github.com/AIGNE-io/aigne-doc-smith/commit/59c98bbc479cd415c6540ee138e4e711c8dc0490))

## [0.8.10-beta.3](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.10-beta.2...v0.8.10-beta.3) (2025-09-19)


### Bug Fixes

* **cli:** add enterprise deployment related links ([#125](https://github.com/AIGNE-io/aigne-doc-smith/issues/125)) ([f115309](https://github.com/AIGNE-io/aigne-doc-smith/commit/f11530967fef0bf2ead7f307a5513a1f3d6513f5))
* polish review prompt copywriting ([#124](https://github.com/AIGNE-io/aigne-doc-smith/issues/124)) ([ea3c6a8](https://github.com/AIGNE-io/aigne-doc-smith/commit/ea3c6a837a32b0135e75faf85406049406055931))

## [0.8.10-beta.2](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.10-beta.1...v0.8.10-beta.2) (2025-09-18)


### Bug Fixes

* polish code test ([#122](https://github.com/AIGNE-io/aigne-doc-smith/issues/122)) ([0629705](https://github.com/AIGNE-io/aigne-doc-smith/commit/0629705ebd271282411d507421c1ba5dd01473b9))
* update documentation structure review prompts and display ([#119](https://github.com/AIGNE-io/aigne-doc-smith/issues/119)) ([e2d99db](https://github.com/AIGNE-io/aigne-doc-smith/commit/e2d99db83ff3a6266b32dd450a79b6e000aff09e))
* update usage rules for field elements ([#120](https://github.com/AIGNE-io/aigne-doc-smith/issues/120)) ([434f161](https://github.com/AIGNE-io/aigne-doc-smith/commit/434f161ab7dd989d57ca670f36d0828c09abe38a))

## [0.8.10-beta.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.10-beta...v0.8.10-beta.1) (2025-09-18)


### Features

* support documentation structure review workflow ([#117](https://github.com/AIGNE-io/aigne-doc-smith/issues/117)) ([ec7ae80](https://github.com/AIGNE-io/aigne-doc-smith/commit/ec7ae80b26a1b66928bddef7ac401f633a0f5a2b))


### Bug Fixes

* improve English language consistency and clarity ([#118](https://github.com/AIGNE-io/aigne-doc-smith/issues/118)) ([74c9e8e](https://github.com/AIGNE-io/aigne-doc-smith/commit/74c9e8e19a78767c32da772133662818b8e50715))
* update doc-smith logo ([#114](https://github.com/AIGNE-io/aigne-doc-smith/issues/114)) ([52ab351](https://github.com/AIGNE-io/aigne-doc-smith/commit/52ab3519d98533f26c1a18203be51e0965c586bc))

## [0.8.10-beta](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.9...v0.8.10-beta) (2025-09-16)


### Bug Fixes

* **ci:** support publish beta releases ([#112](https://github.com/AIGNE-io/aigne-doc-smith/issues/112)) ([aa51523](https://github.com/AIGNE-io/aigne-doc-smith/commit/aa515237cff275ef8c46f5ac2ad7ff60e9915ab4))

## [0.8.9](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.8...v0.8.9) (2025-09-15)


### Bug Fixes

* update d2 diagram theme color ([#108](https://github.com/AIGNE-io/aigne-doc-smith/issues/108)) ([d31dd80](https://github.com/AIGNE-io/aigne-doc-smith/commit/d31dd80c7cb1ca0c4d99d85eb2b6a529651d426f))

## [0.8.8](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.7...v0.8.8) (2025-09-13)


### Bug Fixes

* optimize the copy for inquiry feedback ([#106](https://github.com/AIGNE-io/aigne-doc-smith/issues/106)) ([d219ab8](https://github.com/AIGNE-io/aigne-doc-smith/commit/d219ab8e49fedfb2fbe1d3746e30f36751a924df))

## [0.8.7](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.6...v0.9.0) (2025-09-12)


### Features

* support defining API parameters with field element ([#104](https://github.com/AIGNE-io/aigne-doc-smith/issues/104)) ([2296ead](https://github.com/AIGNE-io/aigne-doc-smith/commit/2296ead15a00aaf809b3854bf349361f0213f522))

## [0.8.6](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.5...v0.8.6) (2025-09-11)


### Features

* add deploy unit tests and improve publish workflow with better logging ([e33a94b](https://github.com/AIGNE-io/aigne-doc-smith/commit/e33a94bef5eda09398901fa1f953e662ae5fbd16))
* **publish:** display publish url for the default publish processing ([9d1d018](https://github.com/AIGNE-io/aigne-doc-smith/commit/9d1d0180dc9c8bb0a4393a893eed2395eec300ab))


### Bug Fixes

* **deploy:** ensure log is saved after await to prevent save failure ([793343f](https://github.com/AIGNE-io/aigne-doc-smith/commit/793343fc7f96ab962e70eb310cb07f4e7eaec9e0))


### Miscellaneous Chores

* release 0.8.6 ([1e25cb4](https://github.com/AIGNE-io/aigne-doc-smith/commit/1e25cb49a26d8bcc3c83ec36120b6bad4042cadf))

## [0.8.5](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.4...v0.8.5) (2025-09-10)


### Features

* support publish docs to enterprise spaces ([#82](https://github.com/AIGNE-io/aigne-doc-smith/issues/82)) ([35b577a](https://github.com/AIGNE-io/aigne-doc-smith/commit/35b577ac0f2c1b860a23185054a55bada3742e8e))


### Miscellaneous Chores

* release 0.8.5 ([7a60a03](https://github.com/AIGNE-io/aigne-doc-smith/commit/7a60a03f91a20f378e94b12dd32a6a8b0a4bede5))

## [0.8.4](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.3...v0.8.4) (2025-09-09)


### Bug Fixes

* parse markdown code blocks into custom x-code element ([#89](https://github.com/AIGNE-io/aigne-doc-smith/issues/89)) ([96ea776](https://github.com/AIGNE-io/aigne-doc-smith/commit/96ea7761299b93ea406abe04193f531fc406ccfa))
* **utils:** update code block regex to support enhanced attributes ([#92](https://github.com/AIGNE-io/aigne-doc-smith/issues/92)) ([bf1fbab](https://github.com/AIGNE-io/aigne-doc-smith/commit/bf1fbabf193e90a83ed6e83e4ff4c5b3b2930477))
* **ux:** make background transparent for d2 diagrams ([13eed81](https://github.com/AIGNE-io/aigne-doc-smith/commit/13eed81cb6be13c64ad04c41505d9d76f34d54bb))
* **ux:** make background transparent for d2 diagrams ([#96](https://github.com/AIGNE-io/aigne-doc-smith/issues/96)) ([13eed81](https://github.com/AIGNE-io/aigne-doc-smith/commit/13eed81cb6be13c64ad04c41505d9d76f34d54bb))

## [0.8.3](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.2...v0.8.3) (2025-09-05)


### Bug Fixes

* add image dimension detection and auto-setting for local images ([#87](https://github.com/AIGNE-io/aigne-doc-smith/issues/87)) ([2d139e6](https://github.com/AIGNE-io/aigne-doc-smith/commit/2d139e60c55fbfd204b08f427807ffeecdae14df))

## [0.8.2](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.1...v0.8.2) (2025-09-04)


### Miscellaneous Chores

* release 0.8.2 ([849bc69](https://github.com/AIGNE-io/aigne-doc-smith/commit/849bc694edf167187f65cb34f1dd9a3966efd96c))

## [0.8.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.8.0...v0.8.1) (2025-09-03)


### Features

* tune d2 chart generating with comprehensive examples ([#80](https://github.com/AIGNE-io/aigne-doc-smith/issues/80)) ([3423e4c](https://github.com/AIGNE-io/aigne-doc-smith/commit/3423e4cff24335552503916694a3489e5d91bf6c))


### Miscellaneous Chores

* release 0.8.1 ([21f64d4](https://github.com/AIGNE-io/aigne-doc-smith/commit/21f64d450377b1aef00f12613ba3b87aa4ef1d31))

## [0.8.0](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.7.2...v0.8.0) (2025-09-03)


### Features

* **tests:** add comprehensive workflow test coverage ([#76](https://github.com/AIGNE-io/aigne-doc-smith/issues/76)) ([d5f6062](https://github.com/AIGNE-io/aigne-doc-smith/commit/d5f6062311f36dc5b6394ae0768583fb8f3853a4))
* update custom component guidelines with formatting restrictions ([#79](https://github.com/AIGNE-io/aigne-doc-smith/issues/79)) ([76158de](https://github.com/AIGNE-io/aigne-doc-smith/commit/76158de236696e68c63c057f5ea4b8458a15e787))

## [0.7.2](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.7.1...v0.7.2) (2025-09-01)


### Miscellaneous Chores

* release 0.7.2 ([c3be232](https://github.com/AIGNE-io/aigne-doc-smith/commit/c3be2323e885cf5d11d654629fe30cc3720f79d3))

## [0.7.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.7.0...v0.7.1) (2025-08-31)


### Bug Fixes

* fix tab key path selection bug ([#72](https://github.com/AIGNE-io/aigne-doc-smith/issues/72)) ([369b342](https://github.com/AIGNE-io/aigne-doc-smith/commit/369b342d8ab8ce95b61a3b72e367157d2f71cce4))

## [0.7.0](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.6.0...v0.7.0) (2025-08-30)


### Features

* add chat mode support ([#60](https://github.com/AIGNE-io/aigne-doc-smith/issues/60)) ([9b2ce50](https://github.com/AIGNE-io/aigne-doc-smith/commit/9b2ce50014d1894a4e41bf043e699fdc4f1d74b7))
* support custom components and more robust config handling ([#70](https://github.com/AIGNE-io/aigne-doc-smith/issues/70)) ([727ab42](https://github.com/AIGNE-io/aigne-doc-smith/commit/727ab429b00f924ef605530b35d2a12b4be77e3a))
* support d2 chart in doc generate and publish workflow ([#69](https://github.com/AIGNE-io/aigne-doc-smith/issues/69)) ([bf95889](https://github.com/AIGNE-io/aigne-doc-smith/commit/bf958891516973636c4847b084c6fe75d1ea124b))
* support multi purpose doc planning and generating ([#68](https://github.com/AIGNE-io/aigne-doc-smith/issues/68)) ([44152c5](https://github.com/AIGNE-io/aigne-doc-smith/commit/44152c53b7e8f82e3af1245a1affd77b9817486d))

## [0.6.0](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.5.1...v0.6.0) (2025-08-27)


### Features

* complete support for media processing before publish ([#63](https://github.com/AIGNE-io/aigne-doc-smith/issues/63)) ([5257ca1](https://github.com/AIGNE-io/aigne-doc-smith/commit/5257ca1756f47487b65a1813949e547b6fc51aca))

## [0.5.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.5.0...v0.5.1) (2025-08-26)


### Miscellaneous Chores

* release 0.5.1 ([892d96e](https://github.com/AIGNE-io/aigne-doc-smith/commit/892d96e939a6404a42e8d2521f95bb7acfeabe27))

## [0.5.0](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.4.5...v0.5.0) (2025-08-26)


### Features

* support persistent user feedback as preferences ([#57](https://github.com/AIGNE-io/aigne-doc-smith/issues/57)) ([761a583](https://github.com/AIGNE-io/aigne-doc-smith/commit/761a583297b397a12d848d10d26cd5b675f8a9e7))


### Bug Fixes

* polish init question copy ([#65](https://github.com/AIGNE-io/aigne-doc-smith/issues/65)) ([d4e8762](https://github.com/AIGNE-io/aigne-doc-smith/commit/d4e8762f26fd757bde43427860a0c1dade384269))

## [0.4.5](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.4.4...v0.4.5) (2025-08-25)


### Miscellaneous Chores

* release 0.4.5 ([12aa6c3](https://github.com/AIGNE-io/aigne-doc-smith/commit/12aa6c340fdd95cbd74833662f4c3a80f19dfa30))

## [0.4.4](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.4.3...v0.4.4) (2025-08-22)


### Bug Fixes

* support assign board id ([#58](https://github.com/AIGNE-io/aigne-doc-smith/issues/58)) ([0bcc196](https://github.com/AIGNE-io/aigne-doc-smith/commit/0bcc1969131f70caf2b1bc9303a3811be1b000ab))

## [0.4.3](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.4.2...v0.4.3) (2025-08-21)


### Miscellaneous Chores

* release 0.4.3 ([f37ac7c](https://github.com/AIGNE-io/aigne-doc-smith/commit/f37ac7cd1fd129d8e3019cc7e952a0cf7dcb3db7))

## [0.4.2](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.4.1...v0.4.2) (2025-08-21)


### Miscellaneous Chores

* release 0.4.2 ([9e36cf6](https://github.com/AIGNE-io/aigne-doc-smith/commit/9e36cf678ac51a0f4e7b3c19e4b5248e42b80437))

## [0.4.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.4.0...v0.4.1) (2025-08-21)


### Bug Fixes

* support update board info ([#53](https://github.com/AIGNE-io/aigne-doc-smith/issues/53)) ([b2f7307](https://github.com/AIGNE-io/aigne-doc-smith/commit/b2f7307555c6f33d181aba408b11443700ecca71))

## [0.4.0](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.3.1...v0.4.0) (2025-08-20)


### Features

* brand new doc translate command ([#50](https://github.com/AIGNE-io/aigne-doc-smith/issues/50)) ([514138d](https://github.com/AIGNE-io/aigne-doc-smith/commit/514138d6b81624977171e9144ed802aad72d4a9c))

## [0.3.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.3.0...v0.3.1) (2025-08-19)


### Bug Fixes

* polish load sources pattern ([#48](https://github.com/AIGNE-io/aigne-doc-smith/issues/48)) ([5f83b91](https://github.com/AIGNE-io/aigne-doc-smith/commit/5f83b917ea6779ba79418e3ff2490eb692c3e48a))

## [0.3.0](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.11...v0.3.0) (2025-08-19)


### Features

* **core:** polish generation context collecting workflow ([#46](https://github.com/AIGNE-io/aigne-doc-smith/issues/46)) ([687d06a](https://github.com/AIGNE-io/aigne-doc-smith/commit/687d06afd648e0e697d25e85dcc841b17c3c311c))


### Bug Fixes

* optimizing help copy for running a self-hosted discuss kit ([#45](https://github.com/AIGNE-io/aigne-doc-smith/issues/45)) ([6841de8](https://github.com/AIGNE-io/aigne-doc-smith/commit/6841de817408d85ac8d993860ab431f7b8816aef))

## [0.2.11](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.10...v0.2.11) (2025-08-15)


### Bug Fixes

* switch default model ([#43](https://github.com/AIGNE-io/aigne-doc-smith/issues/43)) ([203e280](https://github.com/AIGNE-io/aigne-doc-smith/commit/203e280b07d3856445b1877469ed4198db56f6f3))

## [0.2.10](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.9...v0.2.10) (2025-08-14)


### Bug Fixes

* fix bug bush feedback ([#41](https://github.com/AIGNE-io/aigne-doc-smith/issues/41)) ([2740d1a](https://github.com/AIGNE-io/aigne-doc-smith/commit/2740d1abef70ea36780b030917a6d54f74df4327))

## [0.2.9](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.8...v0.2.9) (2025-08-13)


### Bug Fixes

* polish ignore check ([#25](https://github.com/AIGNE-io/aigne-doc-smith/issues/25)) ([90bc866](https://github.com/AIGNE-io/aigne-doc-smith/commit/90bc866513fef7b47047b1016e07bf38881c101c))

## [0.2.8](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.7...v0.2.8) (2025-08-13)


### Miscellaneous Chores

* release 0.2.8 ([da19bc0](https://github.com/AIGNE-io/aigne-doc-smith/commit/da19bc0b2c6c4e5fddaff84b4fa85c9d495b3ba0))

## [0.2.7](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.6...v0.2.7) (2025-08-12)


### Bug Fixes

* polish detail check ([#21](https://github.com/AIGNE-io/aigne-doc-smith/issues/21)) ([0268732](https://github.com/AIGNE-io/aigne-doc-smith/commit/02687329c3507b73f9cbf1aa2ff1b87921452516))


### Miscellaneous Chores

* release 0.2.7 ([3b807fe](https://github.com/AIGNE-io/aigne-doc-smith/commit/3b807fed833a5160931747bce37aac00cf11d9ac))

## [0.2.6](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.5...v0.2.6) (2025-08-12)


### Miscellaneous Chores

* release 0.2.6 ([c5b5ea5](https://github.com/AIGNE-io/aigne-doc-smith/commit/c5b5ea5c404d44f3b0d420f0b57e4ae64ae5d624))

## [0.2.5](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.4...v0.2.5) (2025-08-08)


### Bug Fixes

* polish cli process ([#17](https://github.com/AIGNE-io/aigne-doc-smith/issues/17)) ([4c94263](https://github.com/AIGNE-io/aigne-doc-smith/commit/4c9426378dff9ca3270bd0e455aa6fb1045f6abb))

## [0.2.4](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.3...v0.2.4) (2025-08-07)


### Bug Fixes

* polish agent output log ([40a2451](https://github.com/AIGNE-io/aigne-doc-smith/commit/40a245122ce4d8747e5b5dbe88be6986047c38ae))

## [0.2.3](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.2...v0.2.3) (2025-08-07)


### Bug Fixes

* polish process info ([#14](https://github.com/AIGNE-io/aigne-doc-smith/issues/14)) ([a4a314f](https://github.com/AIGNE-io/aigne-doc-smith/commit/a4a314f65af25f6012726b782f30895ce4124f52))

## [0.2.2](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.1...v0.2.2) (2025-08-07)


### Miscellaneous Chores

* release 0.2.2 ([c3fb52a](https://github.com/AIGNE-io/aigne-doc-smith/commit/c3fb52a78b95676e1c13361b30ebec2914a89fa8))

## [0.2.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.2.0...v0.2.1) (2025-08-06)


### Miscellaneous Chores

* release 0.2.1 ([e3a39ae](https://github.com/AIGNE-io/aigne-doc-smith/commit/e3a39aedcee129deae424e96942f9798b9191663))

## [0.2.0](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.1.4...v0.2.0) (2025-08-05)


### Features

* support automatic init configuration when calling agents ([24d29db](https://github.com/AIGNE-io/aigne-doc-smith/commit/24d29db4dd86709750aa22ff649e7dacc4124126))
* update docs when sources changed ([#9](https://github.com/AIGNE-io/aigne-doc-smith/issues/9)) ([4adcecf](https://github.com/AIGNE-io/aigne-doc-smith/commit/4adcecfb32e72c9e88d0b0bd8ce0a91022847ca7))

## [0.1.4](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.1.3...v0.1.4) (2025-08-04)


### Miscellaneous Chores

* release 0.1.4 ([4122cf5](https://github.com/AIGNE-io/aigne-doc-smith/commit/4122cf5cc0285bef2b96803f393e744121d22acf))

## [0.1.3](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.1.2...v0.1.3) (2025-08-04)


### Bug Fixes

* access agents from options.context instead of load a new aigne instance ([#6](https://github.com/AIGNE-io/aigne-doc-smith/issues/6)) ([0e7ce1d](https://github.com/AIGNE-io/aigne-doc-smith/commit/0e7ce1d3889aab435b029a511cb7ebdbb213ab8a))

## [0.1.2](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.1.1...v0.1.2) (2025-08-01)


### Bug Fixes

* use gemini pro model ([755e1fb](https://github.com/AIGNE-io/aigne-doc-smith/commit/755e1fba377f999106a7d39c734a6f72f047379e))

## [0.1.1](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.1.0...v0.1.1) (2025-07-31)


### Bug Fixes

* agent add alias ([7e25014](https://github.com/AIGNE-io/aigne-doc-smith/commit/7e250147309849fe0f4cc554077134d2e443d344))
* docs mcp add doc search ([de96e0e](https://github.com/AIGNE-io/aigne-doc-smith/commit/de96e0e08455831dc6918d5fbc59d38b6a921373))
* polish code ([8cb0a5c](https://github.com/AIGNE-io/aigne-doc-smith/commit/8cb0a5ce67cf009c672b2fb1aa9b89ef6d965a86))

## [0.1.0](https://github.com/AIGNE-io/aigne-doc-smith/compare/v0.0.2...v0.1.0) (2025-07-31)


### Features

* add entry agents for mcp server and cli ([fa85d65](https://github.com/AIGNE-io/aigne-doc-smith/commit/fa85d651e8dc723e2b97150fc2258b115c6c5bb0))


### Bug Fixes

* polish command param ([#3](https://github.com/AIGNE-io/aigne-doc-smith/issues/3)) ([003f6b8](https://github.com/AIGNE-io/aigne-doc-smith/commit/003f6b8ae2c9e1af55ba1841458fa8567a0eb2f0))
* polish docs mcp agent ([8654cd4](https://github.com/AIGNE-io/aigne-doc-smith/commit/8654cd4ea38034f3af0244f56b27acf66ba704e1))

## 0.0.2 (2025-07-30)


### Features

* add auto create board ([3ff06ad](https://github.com/AIGNE-io/aigne-doc-smith/commit/3ff06ad0241e208b09bcf828c52c2c5051c67ef8))
* add docs-mcp ([a7508a1](https://github.com/AIGNE-io/aigne-doc-smith/commit/a7508a13abb2222968b1bc9c14948427af509f97))
* add input generator agent ([20c01bb](https://github.com/AIGNE-io/aigne-doc-smith/commit/20c01bbca6d6f9414695071fc907bd7cf43d7f62))
* add publish docs ([41bb126](https://github.com/AIGNE-io/aigne-doc-smith/commit/41bb126caeb1c3c242c7a2be27abb114aeab9953))
* add support docs labels ([4522c07](https://github.com/AIGNE-io/aigne-doc-smith/commit/4522c07b1ceb05664a1f5b5fb4df06feee536eba))
* detail add review ([8f1aa4f](https://github.com/AIGNE-io/aigne-doc-smith/commit/8f1aa4f22e2d2e590d7aa37288c2e1ee7ea48f07))
* init commit ([dafc40e](https://github.com/AIGNE-io/aigne-doc-smith/commit/dafc40e94f3c407e50b2c46ecb46237f23a15cf7))
* structure plan add review ([b56e83e](https://github.com/AIGNE-io/aigne-doc-smith/commit/b56e83e558f509302b422205f30e9b2adb42d452))


### Bug Fixes

* polish agent name ([25875a0](https://github.com/AIGNE-io/aigne-doc-smith/commit/25875a0688ebbca71f6c25bf4bd5246361f3dd2d))
* polish agent param and description ([290eb24](https://github.com/AIGNE-io/aigne-doc-smith/commit/290eb240ce986b0f1f406bf42824ce1235df11e5))
* polish code ([34f9a24](https://github.com/AIGNE-io/aigne-doc-smith/commit/34f9a24fc3748b4177cad2b5330fe6b3ccd99175))
* polish code ([0343486](https://github.com/AIGNE-io/aigne-doc-smith/commit/0343486aa086bbe2ced8de849de6a4a42567719c))
* polish code ([7b7dfb9](https://github.com/AIGNE-io/aigne-doc-smith/commit/7b7dfb925b3aa55956ef7a99ededc749fb6a42d7))
* polish code ([4fa4694](https://github.com/AIGNE-io/aigne-doc-smith/commit/4fa4694dbbd5880d501883a7cf3c0d3494509fb4))
* polish code ([74fee51](https://github.com/AIGNE-io/aigne-doc-smith/commit/74fee51ad6337af8811a35f2a4334b67ec109439))
* polish code ([7fa1675](https://github.com/AIGNE-io/aigne-doc-smith/commit/7fa1675b2cab6144d1fb9d4388130209c6cfa0bc))
* polish docs review ([70374ab](https://github.com/AIGNE-io/aigne-doc-smith/commit/70374abed74946eafa7b0f87331c2e496fa61592))
* polish input generator agent ([ae908bb](https://github.com/AIGNE-io/aigne-doc-smith/commit/ae908bbc0cb98b9b196e8b08f23149e5693e0abe))
* polish structure plan ([3a0a196](https://github.com/AIGNE-io/aigne-doc-smith/commit/3a0a196a97196ba445c4709d3466ff355917ac53))
* save docs remove useless docs ([bec5ba3](https://github.com/AIGNE-io/aigne-doc-smith/commit/bec5ba3afd462c990a0aa813bbe38ce9a61363ee))


### Miscellaneous Chores

* release 0.0.2 ([73bf26a](https://github.com/AIGNE-io/aigne-doc-smith/commit/73bf26a5c55fa4726d866cff64bd48d1ca37a3b3))
