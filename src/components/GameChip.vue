<template>
  <div
      ref="chipEl"
      class="chip"
      :data-value="chip.value"
      :style="fontSizeStyle"
  >{{ chip.value }}
  </div>
</template>

<script setup lang="ts">
import {computed, watch, nextTick, ref, onMounted} from 'vue'
import {useTileTheme} from '../composables/useTileTheme'
import type {BoardChip} from '../types/game'

const tileTheme = useTileTheme()

const props = withDefaults(defineProps<{
  chip: BoardChip
  sizePx: number
  animationTimeMs?: number
  moveDurationMs?: number
  moveEasing?: string
}>(), {
  animationTimeMs: 150,
  moveEasing: 'ease-out',
})

const fontSizeStyle = computed(() => {
  const {fontSize} = tileTheme.getChipStyle(props.chip.value, props.sizePx)
  return {fontSize}
})

const chipEl = ref<HTMLElement | null>(null)

watch(() => props.chip.value, () => {
  nextTick(() => {
    const el = chipEl.value
    if (el) {
      const d = props.animationTimeMs + 'ms'
      el.style.animation = 'chip-value-changed ' + d
      el.style.transition = 'background-color ' + d
    }
  })
})

function runMoveAnimation(el: HTMLElement) {
  const moveMs = props.moveDurationMs ?? props.animationTimeMs
  const p = props.chip.prevRelPos
  if (!p) return
  const startTransform = 'translate(' + p.left + 'px,' + p.top + 'px) translateZ(0)'
  const endTransform = 'translate(0, 0) translateZ(0)'
  const transitionValue =
      'transform ' + moveMs + 'ms ' + (props.moveEasing || 'ease-out')

  el.style.transition = 'none'
  el.style.transform = startTransform
  void el.offsetHeight
  el.style.transition = transitionValue
  el.style.transform = endTransform
}

function runAppearAnimation(el: HTMLElement) {
  el.style.animation = 'chip-appear ' + props.animationTimeMs + 'ms'
}

onMounted(() => {
  nextTick(() => {
    const el = chipEl.value
    if (!el) return
    if (props.chip.prevRelPos) {
      runMoveAnimation(el)
    } else {
      runAppearAnimation(el)
    }
  })
})
</script>

<style scoped>
.chip {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  text-align: justify;
  font-weight: bold;
  z-index: 1;
  border-radius: 7%;
  transform: translateZ(0);
}

@keyframes chip-value-changed {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes chip-appear {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
