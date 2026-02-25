# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.4-test.0](https://github.com/thecointech/thecoin/compare/v0.5.3-test.1...v0.5.4-test.0) (2026-02-25)


### Bug Fixes

* apis/broker/ts/package.json to reduce vulnerabilities ([a278faa](https://github.com/thecointech/thecoin/commit/a278faaddd6c0d19b6c48c70973a70c60f9058f0))
* apis/nft/ts/package.json to reduce vulnerabilities ([0006e1d](https://github.com/thecointech/thecoin/commit/0006e1dd827a9708e1ad7278fc45e03ecaf69de5))
* apis/rates/ts/package.json to reduce vulnerabilities ([813d2da](https://github.com/thecointech/thecoin/commit/813d2dae268db6347a6661f94c63baee0b1a1bb4))
* apps/broker-service/package.json to reduce vulnerabilities ([965eb0d](https://github.com/thecointech/thecoin/commit/965eb0dbd7f001f774e70a493523541ab8749745))
* apps/broker-service/package.json to reduce vulnerabilities ([0bafcc4](https://github.com/thecointech/thecoin/commit/0bafcc44fd19529b2e0fd4f606cca7adcb504493))
* apps/nft-service/package.json to reduce vulnerabilities ([344e67f](https://github.com/thecointech/thecoin/commit/344e67f11c7a0dc5f077b92f5f487920ba3c2f87))
* apps/rates-service/package.json to reduce vulnerabilities ([fbd5ca1](https://github.com/thecointech/thecoin/commit/fbd5ca171eb4469ed823ac2019d82835caa4d395))
* do not increment version in branch creation ([65ab3e8](https://github.com/thecointech/thecoin/commit/65ab3e8f4b4b52e6f27bbdf224790e004660fb57))
* extract correct version from lerna output instead of CLI version ([ffc9d5c](https://github.com/thecointech/thecoin/commit/ffc9d5c984ae5c5aada6b15263b1f436281f828f))
* package.json to reduce vulnerabilities ([7a07910](https://github.com/thecointech/thecoin/commit/7a07910cdf6c6fbf9b60bdaf28b96a3b32d13d1c))
* potential fix for harvester scheduler not running on mac, do not do full replay in prodtest ([6d19c33](https://github.com/thecointech/thecoin/commit/6d19c33a4c343ed34597d8356e657b5c150eb0b8))


### Reverts

* Revert "chore(release): publish v0.5.3" ([69528b5](https://github.com/thecointech/thecoin/commit/69528b54d7e69bc85a1d65fcbd7ffaebff462d91))





## [0.5.3](https://github.com/thecointech/thecoin/compare/v0.5.3-test.1...v0.5.3) (2026-02-20)


### Bug Fixes

* apis/broker/ts/package.json to reduce vulnerabilities ([a278faa](https://github.com/thecointech/thecoin/commit/a278faaddd6c0d19b6c48c70973a70c60f9058f0))
* apis/nft/ts/package.json to reduce vulnerabilities ([0006e1d](https://github.com/thecointech/thecoin/commit/0006e1dd827a9708e1ad7278fc45e03ecaf69de5))
* apis/rates/ts/package.json to reduce vulnerabilities ([813d2da](https://github.com/thecointech/thecoin/commit/813d2dae268db6347a6661f94c63baee0b1a1bb4))
* apps/broker-service/package.json to reduce vulnerabilities ([965eb0d](https://github.com/thecointech/thecoin/commit/965eb0dbd7f001f774e70a493523541ab8749745))
* apps/broker-service/package.json to reduce vulnerabilities ([0bafcc4](https://github.com/thecointech/thecoin/commit/0bafcc44fd19529b2e0fd4f606cca7adcb504493))
* apps/nft-service/package.json to reduce vulnerabilities ([344e67f](https://github.com/thecointech/thecoin/commit/344e67f11c7a0dc5f077b92f5f487920ba3c2f87))
* apps/rates-service/package.json to reduce vulnerabilities ([fbd5ca1](https://github.com/thecointech/thecoin/commit/fbd5ca171eb4469ed823ac2019d82835caa4d395))
* package.json to reduce vulnerabilities ([7a07910](https://github.com/thecointech/thecoin/commit/7a07910cdf6c6fbf9b60bdaf28b96a3b32d13d1c))


### Reverts

* Revert "chore(release): publish v0.5.3" ([69528b5](https://github.com/thecointech/thecoin/commit/69528b54d7e69bc85a1d65fcbd7ffaebff462d91))





## [0.5.3-test.1](https://github.com/thecointech/thecoin/compare/v0.5.3-test.0...v0.5.3-test.1) (2026-01-30)


### Bug Fixes

* (Hopeful) release-branch remove persist-credentials to force usage of tokens to enable starting deploy-on-tag ([94729eb](https://github.com/thecointech/thecoin/commit/94729ebe3fed6c1eb13c968f84938d9ec59ae491))
* added RequestId logging & Async context logging ([e5a36a8](https://github.com/thecointech/thecoin/commit/e5a36a847b0e83f1a2e020caeed29c1172365e38))
* facepalms ([d031a6b](https://github.com/thecointech/thecoin/commit/d031a6b36792daae58bb55c9379058302a2c37f4))
* Harvester profile refresh & modal detection ([965f83d](https://github.com/thecointech/thecoin/commit/965f83d431a344c8252ecb5d7fdd1107306df1ba))
* move initialization to common location ([1c57253](https://github.com/thecointech/thecoin/commit/1c57253fc7726b044cb3c0ca2c84c246c6b76efe))





## [0.5.3-test.0](https://github.com/thecointech/thecoin/compare/v0.5.2...v0.5.3-test.0) (2026-01-24)


### Bug Fixes

* Add URL preservation when restoring/creating accounts, this allows the Harvester to pull accounts even if browser does not have local copy of account ([362cc1c](https://github.com/thecointech/thecoin/commit/362cc1cd0e608966bf07659075343f3c51818873))
* allow release branches in lerna config ([4cc2e56](https://github.com/thecointech/thecoin/commit/4cc2e562ef7b2a6021e152b0fc84ca321d0dbe56))
* deployment now -only- versions in release-branch, and updates common.public.env where necessary ([2beeb4e](https://github.com/thecointech/thecoin/commit/2beeb4ea047e9a68f6810116241bd624b0648ce8))
* ensure `from` parameter as-is, avoid abs path or transforms from URL ([203b1b5](https://github.com/thecointech/thecoin/commit/203b1b548a3657f3329604ed65349d8effa776bd))
* local release branch tracks remote ([732498f](https://github.com/thecointech/thecoin/commit/732498f38a3f242a33b01570871029e1ac701da0))
* remove [skip ci], use token properties instead to limit recursive workflow calls ([c3d546a](https://github.com/thecointech/thecoin/commit/c3d546a84f5f6d8f4153317ae6531b0765ace2ea))
* restore dropped CONFIG_NAME from Google services ([4ad802a](https://github.com/thecointech/thecoin/commit/4ad802a59152851c23531dcbcb24cc122d48af04))





## [0.5.2](https://github.com/thecointech/thecoin/compare/v0.5.2-test.0...v0.5.2) (2026-01-19)

**Note:** Version bump only for package @thecointech/the-coin





## [0.5.2-test.0](https://github.com/thecointech/thecoin/compare/v0.5.1...v0.5.2-test.0) (2026-01-19)


### Bug Fixes

* apis/broker/ts/package.json to reduce vulnerabilities ([284146b](https://github.com/thecointech/thecoin/commit/284146b0ab93985ab193c17934e170daa3e895ff))
* apis/nft/ts/package.json to reduce vulnerabilities ([e8c65bc](https://github.com/thecointech/thecoin/commit/e8c65bcc0abcb32717cf8e6e2d37ac280bce927d))
* apis/rates/ts/package.json to reduce vulnerabilities ([361ef63](https://github.com/thecointech/thecoin/commit/361ef636c21d38cdd41f55e16e3445164a24b89a))
* apps/broker-service/package.json to reduce vulnerabilities ([c8e7a88](https://github.com/thecointech/thecoin/commit/c8e7a884346c62f5f2d0961face1523bd273e81a))
* apps/broker-service/package.json to reduce vulnerabilities ([35e0f12](https://github.com/thecointech/thecoin/commit/35e0f12fc70a8e1d5230e232881c21cd5647222e))
* apps/broker-service/package.json to reduce vulnerabilities ([392fa91](https://github.com/thecointech/thecoin/commit/392fa91588fc529081e15e4d5a4200de6a174044))
* apps/broker-service/package.json to reduce vulnerabilities ([1870c98](https://github.com/thecointech/thecoin/commit/1870c980b989387d1a48ccb622250a9b93b1a7c4))
* apps/nft-service/package.json to reduce vulnerabilities ([657c760](https://github.com/thecointech/thecoin/commit/657c760a79b2f455f4c61d108f626fc2987bf905))
* apps/nft-service/package.json to reduce vulnerabilities ([4cffc64](https://github.com/thecointech/thecoin/commit/4cffc6479f025de2b96416a21f4f2bb7db1f0d2b))
* apps/nft-service/package.json to reduce vulnerabilities ([d4ac863](https://github.com/thecointech/thecoin/commit/d4ac86315a24c87a2234cc87b622b4e5302f3340))
* apps/nft-service/package.json to reduce vulnerabilities ([fd67e6e](https://github.com/thecointech/thecoin/commit/fd67e6ea0b07e70fd3373deb9af18d7e92a5470c))
* apps/nft-service/package.json to reduce vulnerabilities ([7e0f74f](https://github.com/thecointech/thecoin/commit/7e0f74fae57feb42f0cbd028f497e4fb7fe7ffea))
* apps/rates-service/package.json to reduce vulnerabilities ([3a717a4](https://github.com/thecointech/thecoin/commit/3a717a425cda9e1a9d6f30e916ac8a1ea490b121))
* apps/rates-service/package.json to reduce vulnerabilities ([a39f6f2](https://github.com/thecointech/thecoin/commit/a39f6f2d87d46cf2a6229660990b0d3f4db27368))
* apps/rates-service/package.json to reduce vulnerabilities ([0e5f4ed](https://github.com/thecointech/thecoin/commit/0e5f4edcc0764f06f7adf684beaebd5d51e7ecce))
* apps/site-app/package.json to reduce vulnerabilities ([87e5055](https://github.com/thecointech/thecoin/commit/87e50559daa4a591d1adbc9fbab63b10f4c7f61c))
* apps/site-app/package.json to reduce vulnerabilities ([5e7875e](https://github.com/thecointech/thecoin/commit/5e7875ea974ca0023bd49c55a3118166168ac891))
* libs/email/package.json to reduce vulnerabilities ([69dec81](https://github.com/thecointech/thecoin/commit/69dec81869ea35fac9b9d7dd049bbdd4cbab971e))
* libs/firestore/package.json to reduce vulnerabilities ([f39421c](https://github.com/thecointech/thecoin/commit/f39421c2e693db55eab7c475adb350e7170642cb))
* package.json to reduce vulnerabilities ([c30e61d](https://github.com/thecointech/thecoin/commit/c30e61dad5370deb94196c58926692a702e8e737))
* package.json to reduce vulnerabilities ([b556cca](https://github.com/thecointech/thecoin/commit/b556ccaa95432b6503196dfc47973c3fa64450b5))





## [0.5.1](https://github.com/thecointech/thecoin/compare/v0.5.1-test.1...v0.5.1) (2026-01-06)

**Note:** Version bump only for package @thecointech/the-coin





## [0.5.1-test.1](https://github.com/thecointech/thecoin/compare/v0.5.1-test.0...v0.5.1-test.1) (2025-12-16)

**Note:** Version bump only for package @thecointech/the-coin





## [0.5.1-test.0](https://github.com/thecointech/thecoin/compare/v0.5.0...v0.5.1-test.0) (2025-12-16)

**Note:** Version bump only for package @thecointech/the-coin





# [0.5.0](https://github.com/thecointech/thecoin/compare/v0.5.0-test.0...v0.5.0) (2025-11-26)

**Note:** Version bump only for package @thecointech/the-coin





# [0.5.0-test.0](https://github.com/thecointech/thecoin/compare/v0.4.0...v0.5.0-test.0) (2025-11-25)


### Bug Fixes

* apps/rates-service/package.json to reduce vulnerabilities ([6e77aa6](https://github.com/thecointech/thecoin/commit/6e77aa64d0f3271d28c7313569c6802ae17dcd32))
* libs/rbcapi/package.json to reduce vulnerabilities ([523b0a1](https://github.com/thecointech/thecoin/commit/523b0a198ff91e04abb46886a10b78da29b81f20))


### Features

* implement 2FA replay handling with section-based navigation and error recovery ([241dd84](https://github.com/thecointech/thecoin/commit/241dd846cb053fc9413e5fd1da56c41f4838a86b))





# [0.4.0](https://github.com/thecointech/thecoin/compare/v0.4.0-test.3...v0.4.0) (2025-10-24)

**Note:** Version bump only for package @thecointech/the-coin





# [0.4.0-test.3](https://github.com/thecointech/thecoin/compare/v0.4.0-test.2...v0.4.0-test.3) (2025-10-24)

**Note:** Version bump only for package @thecointech/the-coin





# [0.4.0-test.2](https://github.com/thecointech/thecoin/compare/v0.4.0-test.1...v0.4.0-test.2) (2025-10-22)

**Note:** Version bump only for package @thecointech/the-coin





# [0.4.0-test.1](https://github.com/thecointech/thecoin/compare/v0.4.0-test.0...v0.4.0-test.1) (2025-10-21)

**Note:** Version bump only for package @thecointech/the-coin





# [0.4.0-test.0](https://github.com/thecointech/thecoin/compare/v0.3.13-test.5...v0.4.0-test.0) (2025-10-20)


### Features

* add verbose logging toggle and consolidate scraper logging controls ([32a314a](https://github.com/thecointech/thecoin/commit/32a314a58b32c543d27d2c8ffc75923e4d4f0e71))





## [0.3.13-test.5](https://github.com/thecointech/thecoin/compare/v0.3.13-test.4...v0.3.13-test.5) (2025-09-15)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.13-test.4](https://github.com/thecointech/thecoin/compare/v0.3.13-test.3...v0.3.13-test.4) (2025-09-10)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.13-test.3](https://github.com/thecointech/thecoin/compare/v0.3.13-test.2...v0.3.13-test.3) (2025-09-09)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.13-test.2](https://github.com/thecointech/thecoin/compare/v0.3.13-test.1...v0.3.13-test.2) (2025-09-09)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.13-test.1](https://github.com/thecointech/thecoin/compare/v0.3.13-test.0...v0.3.13-test.1) (2025-09-09)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.13-test.0](https://github.com/thecointech/thecoin/compare/v0.3.12...v0.3.13-test.0) (2025-09-09)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.12](https://github.com/thecointech/thecoin/compare/v0.3.12-test.0...v0.3.12) (2025-07-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.12-test.0](https://github.com/thecointech/thecoin/compare/v0.3.11...v0.3.12-test.0) (2025-07-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.11](https://github.com/thecointech/thecoin/compare/v0.3.11-test.0...v0.3.11) (2025-07-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.11-test.0](https://github.com/thecointech/thecoin/compare/v0.3.10...v0.3.11-test.0) (2025-07-15)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.10](https://github.com/thecointech/thecoin/compare/v0.3.9...v0.3.10) (2025-05-13)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.9](https://github.com/thecointech/thecoin/compare/v0.3.9-test.0...v0.3.9) (2025-04-24)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.9-test.0](https://github.com/thecointech/thecoin/compare/v0.3.8...v0.3.9-test.0) (2025-04-24)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.8](https://github.com/thecointech/thecoin/compare/v0.3.7...v0.3.8) (2025-04-22)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.7](https://github.com/thecointech/thecoin/compare/v0.3.6...v0.3.7) (2025-04-22)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.6](https://github.com/thecointech/thecoin/compare/v0.3.5...v0.3.6) (2025-04-22)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.5](https://github.com/thecointech/thecoin/compare/v0.3.5-test.0...v0.3.5) (2025-04-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.5-test.0](https://github.com/thecointech/thecoin/compare/v0.3.4...v0.3.5-test.0) (2025-04-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.4](https://github.com/thecointech/thecoin/compare/v0.3.3...v0.3.4) (2025-04-18)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.3](https://github.com/thecointech/thecoin/compare/v0.3.3-test.1...v0.3.3) (2025-04-17)

**Note:** Version bump only for package @thecointech/the-coin







**Note:** Version bump only for package @thecointech/the-coin





## [0.3.3-test.1](https://github.com/thecointech/thecoin/compare/v0.3.3-test.0...v0.3.3-test.1) (2025-04-16)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.3-test.0](https://github.com/thecointech/thecoin/compare/v0.3.1...v0.3.3-test.0) (2025-04-16)

**Note:** Version bump only for package @thecointech/the-coin





## [0.3.1](https://github.com/thecointech/thecoin/compare/v0.2.150...v0.3.1) (2025-04-16)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150](https://github.com/thecointech/thecoin/compare/v0.2.150-test.21...v0.2.150) (2025-04-15)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.21](https://github.com/thecointech/thecoin/compare/v0.2.150-test.20...v0.2.150-test.21) (2025-04-15)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.20](https://github.com/thecointech/thecoin/compare/v0.2.150-test.19...v0.2.150-test.20) (2025-04-10)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.19](https://github.com/thecointech/thecoin/compare/v0.2.150-test.18...v0.2.150-test.19) (2025-04-10)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.18](https://github.com/thecointech/thecoin/compare/v0.2.150-test.17...v0.2.150-test.18) (2025-04-09)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.17](https://github.com/thecointech/thecoin/compare/v0.2.150-test.16...v0.2.150-test.17) (2025-04-09)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.16](https://github.com/thecointech/thecoin/compare/v0.2.150-test.15...v0.2.150-test.16) (2025-04-09)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.15](https://github.com/thecointech/thecoin/compare/v0.2.150-test.14...v0.2.150-test.15) (2025-04-08)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.14](https://github.com/thecointech/thecoin/compare/v0.2.150-test.13...v0.2.150-test.14) (2025-04-08)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.13](https://github.com/thecointech/thecoin/compare/v0.2.150-test.12...v0.2.150-test.13) (2025-04-07)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.12](https://github.com/thecointech/thecoin/compare/v0.2.150-test.11...v0.2.150-test.12) (2025-04-07)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.11](https://github.com/thecointech/thecoin/compare/v0.2.150-test.10...v0.2.150-test.11) (2025-04-07)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.10](https://github.com/thecointech/thecoin/compare/v0.2.150-test.9...v0.2.150-test.10) (2025-04-07)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.9](https://github.com/thecointech/thecoin/compare/v0.2.150-test.8...v0.2.150-test.9) (2025-04-07)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.8](https://github.com/thecointech/thecoin/compare/v0.2.150-test.7...v0.2.150-test.8) (2025-04-07)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.7](https://github.com/thecointech/thecoin/compare/v0.2.150-test.6...v0.2.150-test.7) (2025-04-07)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.6](https://github.com/thecointech/thecoin/compare/v0.2.150-test.5...v0.2.150-test.6) (2025-04-06)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.5](https://github.com/thecointech/thecoin/compare/v0.2.150-test.4...v0.2.150-test.5) (2025-04-06)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.4](https://github.com/thecointech/thecoin/compare/v0.2.150-test.3...v0.2.150-test.4) (2025-04-06)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.3](https://github.com/thecointech/thecoin/compare/v0.2.150-test.2...v0.2.150-test.3) (2025-04-05)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.2](https://github.com/thecointech/thecoin/compare/v0.2.150-test.1...v0.2.150-test.2) (2025-04-05)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.1](https://github.com/thecointech/thecoin/compare/v0.2.150-test.0...v0.2.150-test.1) (2025-04-05)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-test.0](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.8...v0.2.150-test.0) (2025-04-05)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.8](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.7...v0.2.150-beta.8) (2025-04-04)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.7](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.6...v0.2.150-beta.7) (2025-04-04)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.6](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.5...v0.2.150-beta.6) (2025-04-04)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.5](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.4...v0.2.150-beta.5) (2025-04-04)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.4](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.3...v0.2.150-beta.4) (2025-04-04)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.3](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.2...v0.2.150-beta.3) (2025-04-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.2](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.1...v0.2.150-beta.2) (2025-04-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.1](https://github.com/thecointech/thecoin/compare/v0.2.150-beta.0...v0.2.150-beta.1) (2025-04-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.150-beta.0](https://github.com/thecointech/thecoin/compare/v0.2.149...v0.2.150-beta.0) (2025-04-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.149](https://github.com/thecointech/thecoin/compare/v0.2.148...v0.2.149) (2025-04-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.148](https://github.com/thecointech/thecoin/compare/v0.2.147...v0.2.148) (2025-04-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.147](https://github.com/thecointech/thecoin/compare/v0.2.146...v0.2.147) (2025-04-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.146](https://github.com/thecointech/thecoin/compare/v0.2.145...v0.2.146) (2025-04-02)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.145](https://github.com/thecointech/thecoin/compare/v0.2.144...v0.2.145) (2025-04-02)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.144](https://github.com/thecointech/thecoin/compare/v0.2.143...v0.2.144) (2025-04-01)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.143](https://github.com/thecointech/thecoin/compare/v0.2.142...v0.2.143) (2025-03-27)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.142](https://github.com/thecointech/thecoin/compare/v0.2.141...v0.2.142) (2025-03-25)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.141](https://github.com/thecointech/thecoin/compare/v0.2.140...v0.2.141) (2025-03-24)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.140](https://github.com/thecointech/thecoin/compare/v0.2.139...v0.2.140) (2025-03-24)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.139](https://github.com/thecointech/thecoin/compare/v0.2.138...v0.2.139) (2025-03-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.138](https://github.com/thecointech/thecoin/compare/v0.2.137...v0.2.138) (2025-03-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.137](https://github.com/thecointech/thecoin/compare/v0.2.136...v0.2.137) (2025-03-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.136](https://github.com/thecointech/thecoin/compare/v0.2.135...v0.2.136) (2025-03-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.135](https://github.com/thecointech/thecoin/compare/v0.2.134...v0.2.135) (2024-10-23)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.134](https://github.com/thecointech/thecoin/compare/v0.2.133...v0.2.134) (2024-10-23)


### Bug Fixes

* apps/broker-service/package.json to reduce vulnerabilities ([5fa70f8](https://github.com/thecointech/thecoin/commit/5fa70f88f96b7ea0cf1d47bfc1a79aa6c084e52c))





## [0.2.133](https://github.com/thecointech/thecoin/compare/v0.2.132...v0.2.133) (2024-10-19)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.132](https://github.com/thecointech/thecoin/compare/v0.2.131...v0.2.132) (2024-10-10)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.131](https://github.com/thecointech/thecoin/compare/v0.2.130...v0.2.131) (2024-10-05)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.130](https://github.com/thecointech/thecoin/compare/v0.2.129...v0.2.130) (2024-08-02)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.129](https://github.com/thecointech/thecoin/compare/v0.2.128...v0.2.129) (2024-06-18)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.128](https://github.com/thecointech/thecoin/compare/v0.2.127...v0.2.128) (2024-06-06)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.127](https://github.com/thecointech/thecoin/compare/v0.2.126...v0.2.127) (2024-06-05)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.126](https://github.com/thecointech/thecoin/compare/v0.2.125...v0.2.126) (2024-05-10)


### Bug Fixes

* apps/broker-service/package.json to reduce vulnerabilities ([6a5116c](https://github.com/thecointech/thecoin/commit/6a5116c480cce507981b09c6f46833a7b4bb7460))
* apps/mobile/TheApp/TheApp.csproj to reduce vulnerabilities ([b5bbc06](https://github.com/thecointech/thecoin/commit/b5bbc060d39ec135e8112dbc9f0699c95e71608c))
* libs/shared/package.json to reduce vulnerabilities ([f6d3b8e](https://github.com/thecointech/thecoin/commit/f6d3b8ed88059de1a05529fbbab8c959f71f1a64))
* libs/signers/package.json to reduce vulnerabilities ([befca2d](https://github.com/thecointech/thecoin/commit/befca2db9365d5a5c9d2bf4dbbca1b53a2274ca9))
* libs/utils-ts/package.json to reduce vulnerabilities ([792b738](https://github.com/thecointech/thecoin/commit/792b738ce144aaea87b344bb858f8c5bf229af74))





## [0.2.125](https://github.com/thecointech/thecoin/compare/v0.2.124...v0.2.125) (2024-04-11)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.124](https://github.com/thecointech/thecoin/compare/v0.2.123...v0.2.124) (2024-04-08)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.123](https://github.com/thecointech/thecoin/compare/v0.2.122...v0.2.123) (2024-03-17)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.122](https://github.com/thecointech/thecoin/compare/v0.2.121...v0.2.122) (2024-03-14)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.121](https://github.com/thecointech/thecoin/compare/v0.2.120...v0.2.121) (2024-02-25)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.120](https://github.com/thecointech/thecoin/compare/v0.2.119...v0.2.120) (2024-02-24)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.119](https://github.com/thecointech/thecoin/compare/v0.2.118...v0.2.119) (2024-01-30)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.118](https://github.com/thecointech/thecoin/compare/v0.2.117...v0.2.118) (2024-01-23)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.117](https://github.com/thecointech/thecoin/compare/v0.2.116...v0.2.117) (2024-01-22)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.116](https://github.com/thecointech/thecoin/compare/v0.2.115...v0.2.116) (2023-11-20)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.115](https://github.com/thecointech/thecoin/compare/v0.2.114...v0.2.115) (2023-07-26)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.114](https://github.com/thecointech/thecoin/compare/v0.2.113...v0.2.114) (2023-07-26)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.113](https://github.com/thecointech/thecoin/compare/v0.2.112...v0.2.113) (2023-07-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.112](https://github.com/thecointech/thecoin/compare/v0.2.111...v0.2.112) (2023-07-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.111](https://github.com/thecointech/thecoin/compare/v0.2.110...v0.2.111) (2023-06-04)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.110](https://github.com/thecointech/thecoin/compare/v0.2.109...v0.2.110) (2023-06-02)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.109](https://github.com/thecointech/thecoin/compare/v0.2.108...v0.2.109) (2023-05-23)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.108](https://github.com/thecointech/thecoin/compare/v0.2.107...v0.2.108) (2023-05-22)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.107](https://github.com/thecointech/thecoin/compare/v0.2.106...v0.2.107) (2023-05-20)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.106](https://github.com/thecointech/thecoin/compare/v0.2.105...v0.2.106) (2023-05-20)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.105](https://github.com/thecointech/thecoin/compare/v0.2.104...v0.2.105) (2023-05-19)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.104](https://github.com/thecointech/thecoin/compare/v0.2.103...v0.2.104) (2023-05-15)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.103](https://github.com/thecointech/thecoin/compare/v0.2.102...v0.2.103) (2023-05-11)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.102](https://github.com/thecointech/thecoin/compare/v0.2.101...v0.2.102) (2023-05-11)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.101](https://github.com/thecointech/thecoin/compare/v0.2.100...v0.2.101) (2023-05-11)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.100](https://github.com/thecointech/thecoin/compare/v0.2.99...v0.2.100) (2023-05-11)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.99](https://github.com/thecointech/thecoin/compare/v0.2.98...v0.2.99) (2023-04-25)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.98](https://github.com/thecointech/thecoin/compare/v0.2.97...v0.2.98) (2023-04-23)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.97](https://github.com/thecointech/thecoin/compare/v0.2.96...v0.2.97) (2023-04-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.96](https://github.com/thecointech/thecoin/compare/v0.2.95...v0.2.96) (2023-04-21)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.95](https://github.com/thecointech/thecoin/compare/v0.2.94...v0.2.95) (2023-04-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.94](https://github.com/thecointech/thecoin/compare/v0.2.93...v0.2.94) (2023-04-03)


### Bug Fixes

* apps/broker-service/package.json to reduce vulnerabilities ([c92e8c9](https://github.com/thecointech/thecoin/commit/c92e8c95c5c853417bd339fe2918a70ffe553852))
* apps/nft-service/package.json to reduce vulnerabilities ([1cac384](https://github.com/thecointech/thecoin/commit/1cac384337b12aa0dc8ed4e81c782df0f4287dbb))
* apps/rates-service/package.json to reduce vulnerabilities ([d79310e](https://github.com/thecointech/thecoin/commit/d79310e901a26fced5ffe5836d5fa48f54bfccec))





## [0.2.93](https://github.com/thecointech/thecoin/compare/v0.2.92...v0.2.93) (2022-08-16)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.92](https://github.com/thecointech/thecoin/compare/v0.2.91...v0.2.92) (2022-08-16)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.91](https://github.com/thecointech/thecoin/compare/v0.2.90...v0.2.91) (2022-08-15)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.90](https://github.com/thecointech/thecoin/compare/v0.2.89...v0.2.90) (2022-08-12)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.89](https://github.com/thecointech/thecoin/compare/v0.2.88...v0.2.89) (2022-08-12)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.88](https://github.com/thecointech/thecoin/compare/v0.2.87...v0.2.88) (2022-08-10)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.87](https://github.com/thecointech/thecoin/compare/v0.2.86...v0.2.87) (2022-08-09)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.86](https://github.com/thecointech/thecoin/compare/v0.2.85...v0.2.86) (2022-08-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.85](https://github.com/thecointech/thecoin/compare/v0.2.84...v0.2.85) (2022-08-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.84](https://github.com/thecointech/thecoin/compare/v0.2.83...v0.2.84) (2022-08-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.83](https://github.com/thecointech/thecoin/compare/v0.2.82...v0.2.83) (2022-08-03)

**Note:** Version bump only for package @thecointech/the-coin





## [0.2.82](https://github.com/thecointech/thecoin/compare/v0.2.81...v0.2.82) (2022-08-02)


### Bug Fixes

* apps/mobile/TheApp/TheApp.csproj to reduce vulnerabilities ([81cb08d](https://github.com/thecointech/thecoin/commit/81cb08dd24bc1d71cae2c0228cdce19c10e769c8))
* apps/nft-service/package.json to reduce vulnerabilities ([e2e4a14](https://github.com/thecointech/thecoin/commit/e2e4a1417b698b2692bf60f445cb30aaa0b334f9))
* libs/rbcapi/package.json to reduce vulnerabilities ([751dabf](https://github.com/thecointech/thecoin/commit/751dabf9f670380dd08079f648fe9f99572314ca))
* libs/utils-cs/TheUtils.csproj to reduce vulnerabilities ([0a4b1a9](https://github.com/thecointech/thecoin/commit/0a4b1a90f6439eae0dd11266e58fd99723c93d65))
* package.json to reduce vulnerabilities ([31b3317](https://github.com/thecointech/thecoin/commit/31b3317f927266ee749918b9e1bceda594c81202))
* package.json to reduce vulnerabilities ([daabe74](https://github.com/thecointech/thecoin/commit/daabe74424a420e18f3a82b75796520110c83d76))





## [0.2.81](https://github.com/thecointech/thecoin/compare/v0.2.80...v0.2.81) (2022-05-05)

**Note:** Version bump only for package the-coin





## [0.2.80](https://github.com/thecointech/thecoin/compare/v0.2.79...v0.2.80) (2022-05-05)

**Note:** Version bump only for package the-coin





## [0.2.79](https://github.com/thecointech/thecoin/compare/v0.2.78...v0.2.79) (2022-05-04)

**Note:** Version bump only for package the-coin





## [0.2.78](https://github.com/thecointech/thecoin/compare/v0.2.77...v0.2.78) (2022-05-02)

**Note:** Version bump only for package the-coin





## [0.2.77](https://github.com/thecointech/thecoin/compare/v0.2.76...v0.2.77) (2022-04-27)

**Note:** Version bump only for package the-coin





## [0.2.76](https://github.com/thecointech/thecoin/compare/v0.2.75...v0.2.76) (2022-04-13)

**Note:** Version bump only for package the-coin





## [0.2.75](https://github.com/thecointech/thecoin/compare/v0.2.74...v0.2.75) (2022-04-13)

**Note:** Version bump only for package the-coin





## [0.2.74](https://github.com/thecointech/thecoin/compare/v0.2.73...v0.2.74) (2022-04-06)

**Note:** Version bump only for package the-coin





## [0.2.73](https://github.com/thecointech/thecoin/compare/v0.2.72...v0.2.73) (2022-04-01)

**Note:** Version bump only for package the-coin





## [0.2.72](https://github.com/thecointech/thecoin/compare/v0.2.71...v0.2.72) (2022-04-01)

**Note:** Version bump only for package the-coin





## [0.2.71](https://github.com/thecointech/thecoin/compare/v0.2.70...v0.2.71) (2022-03-26)

**Note:** Version bump only for package the-coin





## [0.2.70](https://github.com/thecointech/thecoin/compare/v0.2.69...v0.2.70) (2022-03-26)

**Note:** Version bump only for package the-coin





## [0.2.69](https://github.com/thecointech/thecoin/compare/v0.2.68...v0.2.69) (2022-03-07)

**Note:** Version bump only for package the-coin





## [0.2.68](https://github.com/thecointech/thecoin/compare/v0.2.67...v0.2.68) (2022-03-07)

**Note:** Version bump only for package the-coin





## [0.2.67](https://github.com/thecointech/thecoin/compare/v0.2.66...v0.2.67) (2022-02-23)

**Note:** Version bump only for package the-coin





## [0.2.66](https://github.com/thecointech/thecoin/compare/v0.2.65...v0.2.66) (2022-02-23)

**Note:** Version bump only for package the-coin





## [0.2.65](https://github.com/thecointech/thecoin/compare/v0.2.64...v0.2.65) (2022-02-23)

**Note:** Version bump only for package the-coin





## [0.2.64](https://github.com/thecointech/thecoin/compare/v0.2.63...v0.2.64) (2022-02-22)

**Note:** Version bump only for package the-coin





## [0.2.63](https://github.com/thecointech/thecoin/compare/v0.2.62...v0.2.63) (2022-02-20)

**Note:** Version bump only for package the-coin





## [0.2.62](https://github.com/thecointech/thecoin/compare/v0.2.61...v0.2.62) (2022-02-14)

**Note:** Version bump only for package the-coin





## [0.2.61](https://github.com/thecointech/thecoin/compare/v0.2.60...v0.2.61) (2022-02-14)

**Note:** Version bump only for package the-coin





## [0.2.60](https://github.com/thecointech/thecoin/compare/v0.2.59...v0.2.60) (2022-02-11)


### Bug Fixes

* apps/broker-service/package.json to reduce vulnerabilities ([e79d59b](https://github.com/thecointech/thecoin/commit/e79d59bcf6f0d28d1539a72fd2aa789ddb0462ab))
* apps/nft-service/package.json to reduce vulnerabilities ([6815994](https://github.com/thecointech/thecoin/commit/6815994c91dce1512f22281cc7177dcd0eeb6c7b))
* apps/rates-service/package.json to reduce vulnerabilities ([6cc3d37](https://github.com/thecointech/thecoin/commit/6cc3d377e5e2559bfdd37cafefb1f3d9f2ff2351))
* libs/rbcapi/package.json to reduce vulnerabilities ([201ed0f](https://github.com/thecointech/thecoin/commit/201ed0f313326a42a023b9a1a84e714f4754b0df))
* package.json to reduce vulnerabilities ([028aee5](https://github.com/thecointech/thecoin/commit/028aee5afcc3c7064574018fbe070bfb00aab035))





## [0.2.59](https://github.com/thecointech/thecoin/compare/v0.2.58...v0.2.59) (2022-01-23)


### Bug Fixes

* apps/nft-service/package.json to reduce vulnerabilities ([e1ea143](https://github.com/thecointech/thecoin/commit/e1ea14301105e6ae9f0c2c477281b817a3276e80))
* apps/rates-service/package.json to reduce vulnerabilities ([2298d45](https://github.com/thecointech/thecoin/commit/2298d45e609e2c791230a6cb1ad6c28ba1d7d717))
* libs/email/package.json to reduce vulnerabilities ([7c61597](https://github.com/thecointech/thecoin/commit/7c61597b8306db0bea6a98b16f24d3e6f216ef33))





## [0.2.58](https://github.com/thecointech/thecoin/compare/v0.2.57...v0.2.58) (2022-01-13)

**Note:** Version bump only for package the-coin





## [0.2.57](https://github.com/thecointech/thecoin/compare/v0.2.56...v0.2.57) (2021-12-23)

**Note:** Version bump only for package the-coin





## [0.2.56](https://github.com/thecointech/thecoin/compare/v0.2.55...v0.2.56) (2021-12-22)

**Note:** Version bump only for package the-coin





## [0.2.55](https://github.com/thecointech/thecoin/compare/v0.2.54...v0.2.55) (2021-12-11)

**Note:** Version bump only for package the-coin





## [0.2.54](https://github.com/thecointech/thecoin/compare/v0.2.53...v0.2.54) (2021-12-11)

**Note:** Version bump only for package the-coin





## [0.2.53](https://github.com/thecointech/thecoin/compare/v0.2.52...v0.2.53) (2021-11-18)

**Note:** Version bump only for package the-coin





## [0.2.52](https://github.com/thecointech/thecoin/compare/v0.2.51...v0.2.52) (2021-11-18)

**Note:** Version bump only for package the-coin





## [0.2.51](https://github.com/thecointech/thecoin/compare/v0.2.50...v0.2.51) (2021-11-15)

**Note:** Version bump only for package the-coin





## [0.2.50](https://github.com/thecointech/thecoin/compare/v0.2.49...v0.2.50) (2021-11-14)

**Note:** Version bump only for package the-coin





## [0.2.49](https://github.com/thecointech/thecoin/compare/v0.2.48...v0.2.49) (2021-11-14)

**Note:** Version bump only for package the-coin





## [0.2.48](https://github.com/thecointech/thecoin/compare/v0.2.47...v0.2.48) (2021-11-14)

**Note:** Version bump only for package the-coin





## [0.2.47](https://github.com/thecointech/thecoin/compare/v0.2.46...v0.2.47) (2021-11-14)

**Note:** Version bump only for package the-coin





## [0.2.46](https://github.com/thecointech/thecoin/compare/v0.2.45...v0.2.46) (2021-11-13)


### Reverts

* Revert "rename to core" ([12b26de](https://github.com/thecointech/thecoin/commit/12b26de33e580b077344a94b74f7587b0f9409eb))





## [0.2.45](https://github.com/thecointech/thecoin/compare/v0.2.43...v0.2.45) (2021-10-15)

**Note:** Version bump only for package the-coin





## [0.2.44](https://github.com/thecointech/thecoin/compare/v0.2.43...v0.2.44) (2021-10-15)

**Note:** Version bump only for package the-coin





## [0.2.43](https://github.com/thecointech/thecoin/compare/v0.2.42...v0.2.43) (2021-10-14)

**Note:** Version bump only for package the-coin





## [0.2.42](https://github.com/thecointech/thecoin/compare/v0.2.41...v0.2.42) (2021-10-12)


### Bug Fixes

* libs/contract/package.json to reduce vulnerabilities ([08df2da](https://github.com/thecointech/thecoin/commit/08df2da373e87726cee62b04b29d7dc300127995))
* libs/contract-nft/package.json to reduce vulnerabilities ([888f151](https://github.com/thecointech/thecoin/commit/888f151377d345a846bc84ba97db491fe26460e5))
* libs/signers/package.json to reduce vulnerabilities ([6a40c9b](https://github.com/thecointech/thecoin/commit/6a40c9b2bfa50660aca1322370bc3dd5013b9120))





## [0.2.41](https://github.com/thecointech/thecoin/compare/v0.2.40...v0.2.41) (2021-09-22)

**Note:** Version bump only for package the-coin





## [0.2.40](https://github.com/thecointech/thecoin/compare/v0.2.39...v0.2.40) (2021-09-20)



## [0.2.38](https://github.com/thecointech/thecoin/compare/v0.2.37...v0.2.38) (2021-09-18)



## [0.2.37](https://github.com/thecointech/thecoin/compare/v0.2.36...v0.2.37) (2021-09-17)

**Note:** Version bump only for package the-coin





## [0.2.39](https://github.com/thecointech/thecoin/compare/v0.2.36...v0.2.39) (2021-09-20)

**Note:** Version bump only for package the-coin





## [0.2.37](https://github.com/thecointech/thecoin/compare/v0.2.36...v0.2.37) (2021-09-20)

**Note:** Version bump only for package the-coin





## [0.2.36](https://github.com/thecointech/thecoin/compare/v0.2.35...v0.2.36) (2021-09-17)

**Note:** Version bump only for package the-coin





## [0.2.35](https://github.com/thecointech/thecoin/compare/v0.2.34...v0.2.35) (2021-09-17)

**Note:** Version bump only for package the-coin





## [0.2.34](https://github.com/thecointech/thecoin/compare/v0.2.33...v0.2.34) (2021-09-17)

**Note:** Version bump only for package the-coin





## [0.2.33](https://github.com/thecointech/thecoin/compare/v0.2.32...v0.2.33) (2021-09-16)

**Note:** Version bump only for package the-coin





## [0.2.32](https://github.com/thecointech/thecoin/compare/v0.2.31...v0.2.32) (2021-09-16)

**Note:** Version bump only for package the-coin





## [0.2.31](https://github.com/thecointech/thecoin/compare/v0.2.30...v0.2.31) (2021-09-15)

**Note:** Version bump only for package the-coin





## [0.2.30](https://github.com/thecointech/thecoin/compare/v0.2.29...v0.2.30) (2021-09-15)


### Bug Fixes

* package.json to reduce vulnerabilities ([e3d66e9](https://github.com/thecointech/thecoin/commit/e3d66e936e443bbdeb357390fc64015962d13830))





## [0.2.29](https://github.com/thecointech/thecoin/compare/v0.2.28...v0.2.29) (2021-09-10)

**Note:** Version bump only for package the-coin





## [0.2.28](https://github.com/thecointech/thecoin/compare/v0.2.27...v0.2.28) (2021-09-09)

**Note:** Version bump only for package the-coin





## [0.2.27](https://github.com/thecointech/thecoin/compare/v0.2.26...v0.2.27) (2021-09-09)

**Note:** Version bump only for package the-coin





## [0.2.26](https://github.com/thecointech/thecoin/compare/v0.2.25...v0.2.26) (2021-09-09)

**Note:** Version bump only for package the-coin





## [0.2.25](https://github.com/thecointech/thecoin/compare/v0.2.24...v0.2.25) (2021-09-06)

**Note:** Version bump only for package the-coin





## [0.2.24](https://github.com/thecointech/thecoin/compare/v0.2.23...v0.2.24) (2021-09-06)

**Note:** Version bump only for package the-coin





## [0.2.23](https://github.com/thecointech/thecoin/compare/v0.2.22...v0.2.23) (2021-09-06)

**Note:** Version bump only for package the-coin





## [0.2.22](https://github.com/thecointech/thecoin/compare/v0.2.21...v0.2.22) (2021-09-06)

**Note:** Version bump only for package the-coin





## [0.2.21](https://github.com/thecointech/thecoin/compare/v0.2.20...v0.2.21) (2021-08-21)

**Note:** Version bump only for package the-coin





## [0.2.20](https://github.com/thecointech/thecoin/compare/v0.2.19...v0.2.20) (2021-08-21)

**Note:** Version bump only for package the-coin





## [0.2.19](https://github.com/thecointech/thecoin/compare/v0.2.18...v0.2.19) (2021-08-21)

**Note:** Version bump only for package the-coin





## [0.2.18](https://github.com/thecointech/thecoin/compare/v0.2.17...v0.2.18) (2021-08-21)


### Bug Fixes

* apps/broker-service/package.json to reduce vulnerabilities ([0f7df28](https://github.com/thecointech/thecoin/commit/0f7df2851e0a2b1891e08e8d02037f2510dcce4c))
* libs/logging/package.json to reduce vulnerabilities ([2573157](https://github.com/thecointech/thecoin/commit/2573157cab17d50010378d9ce37a694917056bad))





## [0.2.17](https://github.com/thecointech/thecoin/compare/v0.2.16...v0.2.17) (2021-07-17)

**Note:** Version bump only for package the-coin





## [0.2.16](https://github.com/thecointech/thecoin/compare/v0.2.15...v0.2.16) (2021-07-16)

**Note:** Version bump only for package the-coin





## [0.2.15](https://github.com/thecointech/thecoin/compare/v0.2.14...v0.2.15) (2021-07-07)

**Note:** Version bump only for package the-coin





## [0.2.14](https://github.com/thecointech/thecoin/compare/v0.2.13...v0.2.14) (2021-07-07)


### Bug Fixes

* libs/email/package.json to reduce vulnerabilities ([d9b7683](https://github.com/thecointech/thecoin/commit/d9b7683179b8b4954eb82678d1d255fb03b7654b))
* libs/contract-nft/package.json to reduce vulnerabilities ([c16afd2](https://github.com/thecointech/thecoin/commit/c16afd284eef892192dfa5dfa4cddb877b72e698))
* package.json to reduce vulnerabilities ([dca9438](https://github.com/thecointech/thecoin/commit/dca94384aa4eaa7b3d5835344a661a8a64cc6726))





## [0.2.13](https://github.com/thecointech/thecoin/compare/v0.2.12...v0.2.13) (2021-06-18)

**Note:** Version bump only for package the-coin





## [0.2.12](https://github.com/thecointech/thecoin/compare/v0.2.11...v0.2.12) (2021-06-18)

**Note:** Version bump only for package the-coin





## [0.2.11](https://github.com/thecointech/thecoin/compare/v0.2.10...v0.2.11) (2021-06-17)

**Note:** Version bump only for package the-coin





## [0.2.10](https://github.com/thecointech/thecoin/compare/v0.2.9...v0.2.10) (2021-06-17)

**Note:** Version bump only for package the-coin





## [0.2.9](https://github.com/thecointech/thecoin/compare/v0.2.8...v0.2.9) (2021-06-17)

**Note:** Version bump only for package the-coin





## [0.2.8](https://github.com/thecointech/thecoin/compare/v0.2.7...v0.2.8) (2021-06-17)

**Note:** Version bump only for package the-coin





## [0.2.7](https://github.com/thecointech/thecoin/compare/v0.2.6...v0.2.7) (2021-06-17)

**Note:** Version bump only for package the-coin





## [0.2.6](https://github.com/thecointech/thecoin/compare/v0.2.1...v0.2.6) (2021-06-16)

**Note:** Version bump only for package the-coin





## [0.2.5](https://github.com/thecointech/thecoin/compare/v0.2.4...v0.2.5) (2021-06-03)

**Note:** Version bump only for package the-coin





## [0.2.4](https://github.com/thecointech/thecoin/compare/v0.2.3...v0.2.4) (2021-06-03)

**Note:** Version bump only for package the-coin





## [0.2.3](https://github.com/thecointech/thecoin/compare/v0.2.2...v0.2.3) (2021-06-03)

**Note:** Version bump only for package the-coin





## [0.2.2](https://github.com/thecointech/thecoin/compare/v0.1.29...v0.2.2) (2021-06-02)


### Reverts

* Revert "Revert "Merge branch 'dev' into cleaning/TransactionHistory/changeClassesToHooks"" ([0019176](https://github.com/thecointech/thecoin/commit/0019176275b50ead3caac643587a839aa6fd4683))
* Revert "Revert "Merge pull request #98 from thecointech/overall/runJestTests"" ([3274888](https://github.com/thecointech/thecoin/commit/3274888e3ae343686bf74ebe8e4e84f5e90a4e52)), closes [#98](https://github.com/thecointech/thecoin/issues/98)
* Revert "Update yarn.lock" ([c7f401f](https://github.com/thecointech/thecoin/commit/c7f401f4d7264cfe7a8028f2c8ebbc924764b7b1))
* Revert "Merge WindowDimension with ResponsiveTool" ([ef3548e](https://github.com/thecointech/thecoin/commit/ef3548e8920813fe344dd06c5ce1889e10e636f0))
* Revert "New structure and new header menu for landing" ([8cc45d2](https://github.com/thecointech/thecoin/commit/8cc45d213495dd8fa43ca5ed208dc838e81218e8))



## [0.1.9](https://github.com/thecointech/thecoin/compare/v0.1.28...v0.1.9) (2019-06-08)



## [0.1.8](https://github.com/thecointech/thecoin/compare/v0.1.7...v0.1.8) (2019-06-03)



## [0.1.7](https://github.com/thecointech/thecoin/compare/v0.1.6...v0.1.7) (2019-06-03)



## [0.1.6](https://github.com/thecointech/thecoin/compare/v0.1.27...v0.1.6) (2019-06-03)



## [0.1.5](https://github.com/thecointech/thecoin/compare/v0.1.4...v0.1.5) (2019-05-25)



## [0.1.4](https://github.com/thecointech/thecoin/compare/v0.1.24...v0.1.4) (2019-05-25)



## [0.1.3](https://github.com/thecointech/thecoin/compare/v0.1.2...v0.1.3) (2019-03-23)



## [0.1.2](https://github.com/thecointech/thecoin/compare/v0.1.1...v0.1.2) (2019-03-23)



## [0.1.1](https://github.com/thecointech/thecoin/compare/v0.1.11...v0.1.1) (2019-03-23)



## [0.1.11](https://github.com/thecointech/thecoin/compare/v0.1.13...v0.1.11) (2019-03-23)





## [0.2.1](https://github.com/thecointech/thecoin/compare/v0.2.0...v0.2.1) (2021-04-16)

**Note:** Version bump only for package the-coin





# [0.2.0](https://github.com/thecointech/thecoin/compare/v0.1.29...v0.2.0) (2021-04-15)


### Reverts

* Revert "Revert "Merge branch 'dev' into cleaning/TransactionHistory/changeClassesToHooks"" ([0019176](https://github.com/thecointech/thecoin/commit/0019176275b50ead3caac643587a839aa6fd4683))
* Revert "Revert "Merge pull request #98 from thecointech/overall/runJestTests"" ([3274888](https://github.com/thecointech/thecoin/commit/3274888e3ae343686bf74ebe8e4e84f5e90a4e52)), closes [#98](https://github.com/thecointech/thecoin/issues/98)
* Revert "Update yarn.lock" ([c7f401f](https://github.com/thecointech/thecoin/commit/c7f401f4d7264cfe7a8028f2c8ebbc924764b7b1))
* Revert "Merge WindowDimension with ResponsiveTool" ([ef3548e](https://github.com/thecointech/thecoin/commit/ef3548e8920813fe344dd06c5ce1889e10e636f0))
* Revert "New structure and new header menu for landing" ([8cc45d2](https://github.com/thecointech/thecoin/commit/8cc45d213495dd8fa43ca5ed208dc838e81218e8))



## [0.1.9](https://github.com/thecointech/thecoin/compare/v0.1.28...v0.1.9) (2019-06-08)



## [0.1.8](https://github.com/thecointech/thecoin/compare/v0.1.7...v0.1.8) (2019-06-03)



## [0.1.7](https://github.com/thecointech/thecoin/compare/v0.1.6...v0.1.7) (2019-06-03)



## [0.1.6](https://github.com/thecointech/thecoin/compare/v0.1.27...v0.1.6) (2019-06-03)



## [0.1.5](https://github.com/thecointech/thecoin/compare/v0.1.4...v0.1.5) (2019-05-25)



## [0.1.4](https://github.com/thecointech/thecoin/compare/v0.1.24...v0.1.4) (2019-05-25)



## [0.1.3](https://github.com/thecointech/thecoin/compare/v0.1.2...v0.1.3) (2019-03-23)



## [0.1.2](https://github.com/thecointech/thecoin/compare/v0.1.1...v0.1.2) (2019-03-23)



## [0.1.1](https://github.com/thecointech/thecoin/compare/v0.1.11...v0.1.1) (2019-03-23)



## [0.1.11](https://github.com/thecointech/thecoin/compare/v0.1.13...v0.1.11) (2019-03-23)
