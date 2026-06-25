# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- PWA: combined update policy — silent apply on cold start, banner during play, force apply after 60 min in background; detect waiting workers via `updatefound`

### [1.1.1](https://github.com/git-dmitriy/game2048/compare/v1.1.0...v1.1.1) (2026-06-19)


### Added

* **ui:** show app version in copyright footer ([a0b5898](https://github.com/git-dmitriy/game2048/commit/a0b5898fcf294016062fdfe8069d6fe4c21f5eb3))


### Fixed

* **audio:** retry activation on empty buffers; add build:gh-pages script ([d443c53](https://github.com/git-dmitriy/game2048/commit/d443c5301f62149c7ca4bc475dbe4e523e0a6705))
* **pwa:** iOS sound on user gesture, SW update checks, and GitHub Pages base ([c169a10](https://github.com/git-dmitriy/game2048/commit/c169a10852bc7a0563ce9756dcd4355c71e81dc1))

## [1.1.0](https://github.com/git-dmitriy/game2048/compare/v1.0.0...v1.1.0) (2026-06-18)


### Changed

* **legal:** add third-party notices and improve license attribution ([8583713](https://github.com/git-dmitriy/game2048/commit/8583713ddcb58919f7563f03a26a3c98dca4021e))
* **score:** replace GSAP with rAF counter and remove third-party notices ([9c05efd](https://github.com/git-dmitriy/game2048/commit/9c05efd594ceb2e27b115f52c1dff6a4803d5c2b))

## [1.0.0] - 2026-06-18

### Added

- Classic 2048 game MVP with tile animations
- Vue 3 + TypeScript + Vite rewrite with preset system (`GamePreset`, `createPreset`)
- Board sizes 3×3–6×6 with per-size win targets
- Pure game engine (`lib/game2048.ts`) separated from UI
- Composable-based architecture (`useGameController`, `useBoardGameLoop`, chip model)
- Eight UI color schemes (classic, ocean, forest, sunset + dark variants)
- Settings modal: board size, theme, language, sound on/off
- Internationalization (RU, EN, DE, IT, ES) via vue-i18n
- Progressive Web App: install prompt, offline cache, update prompt
- localStorage persistence: high scores, awards, settings, and active game session
- Session restore after page reload
- GSAP score animation and fly award animation
- White-label slots and preset-driven component overrides
- MIT license and copyright footer
- Sound effects (move, merge, spawn, win, game over) with settings toggle
- Procedural WAV asset generation (`scripts/generate-sounds.mjs`) and Web Audio playback
- PWA install hint (`PwaInstallPrompt`)

### Fixed

- Settings save button behavior
- PWA infinite reload loop when applying service worker update
- Animation and layout styles

### Changed

- Migrated from JavaScript to TypeScript with strict mode
- Decomposed monolithic components into focused composables
- Centralized configuration in `activePreset` with preset-driven persistence
- README translated to English with full architecture documentation
