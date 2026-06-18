# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-06-16

### Added

- Classic 2048 game MVP with tile animations
- Vue 3 + TypeScript + Vite rewrite with preset system (`GamePreset`, `createPreset`)
- Board sizes 3×3–6×6 with per-size win targets
- Pure game engine (`lib/game2048.ts`) separated from UI
- Composable-based architecture (`useGameController`, `useBoardGameLoop`, chip model)
- Eight UI color schemes (classic, ocean, forest, sunset + dark variants)
- Settings modal: board size, theme, language
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
