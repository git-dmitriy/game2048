# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- iOS Web Audio: activate `AudioContext` and preload sound buffers inside user gestures before playback
- PWA: check for service worker updates on focus, visibility, and bfcache restore (Android installed apps)
- Sound asset URLs respect Vite `base` for GitHub Pages project-site deployment
- Sound player retries activation when no audio buffers could be loaded

### Changed

- GitHub Pages build uses `GITHUB_PAGES=true` (`base: /game2048/`) with automated deploy workflow
- Add `npm run build:gh-pages` and `npm run preview:gh-pages` scripts

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
