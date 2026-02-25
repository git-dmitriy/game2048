# 2048 Game (Vue 3)

Версия игры 2048 на Vue 3 с разбиением на компоненты.

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173/

## Сборка

```bash
npm run build
npm run preview   # предпросмотр production-сборки
```

## Структура проекта

- **src/App.vue** — корневой компонент: счёт, кнопки, доска, награды
- **src/components/ScoreContainer.vue** — блок счёта и цели
- **src/components/GameControls.vue** — выбор размера и кнопки «New Game» / «End»
- **src/components/GameOverlay.vue** — оверлей «Game over»
- **src/components/GameBoard.vue** — игровое поле, клавиатура и свайпы
- **src/components/GameChip.vue** — плитка с числом
- **src/components/GameAward.vue** — бейдж награды
- **src/lib/game2048.js** — логика игры (без изменений)
- **src/lib/deferred.js** — отложенное выполнение для анимаций
- **src/lib/swipe.js** — обработка свайпов на мобильных

Функциональность сохранена: размеры 3–6, очки, лучший результат, награды, cookie, анимации (GSAP), клавиши и свайпы.
