<template>
  <div class="game-controls">
    <button
        type="button"
        class="button button-settings"
        @click="$emit('open-settings')"
    >
      <svg class="icon-gear" viewBox="0 0 24 24" aria-hidden="true">
        <path
            fill="currentColor"
            d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"
        />
      </svg>
      <span class="button-label">{{ strings.settings }}</span>
    </button>
    <button
        v-if="!gameStarted"
        type="button"
        class="button button-primary"
        @click="$emit('start')"
    >
      {{ strings.newGame }}
    </button>
    <button
        v-else
        type="button"
        class="button button-primary"
        @click="$emit('end')"
    >
      {{ strings.end }}
    </button>
  </div>
</template>

<script setup>
import {useStrings} from '../composables/useStrings.js'

const strings = useStrings()

defineProps({
  gameStarted: {type: Boolean, required: true},
})

defineEmits(['open-settings', 'start', 'end'])
</script>

<style scoped>
.game-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 3%;
  width: 100%;
  height: var(--controls-height);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35em;
  background-color: var(--color-board);
  border: none;
  border-radius: 5% / 9%;
  height: 75%;
  color: var(--color-on-dark);
  outline: none;
  font-weight: bold;
  overflow: hidden;
  cursor: pointer;
  animation: appearing 0.5s;
  font-size: var(--button-font-size);
}

.button-settings {
  width: 42%;
  background-color: var(--color-panel);
  color: var(--color-text);
}

.button-primary {
  width: 42%;
}

.icon-gear {
  width: 1.1em;
  height: 1.1em;
  flex-shrink: 0;
}

.button-label {
  white-space: nowrap;
}

@keyframes appearing {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
