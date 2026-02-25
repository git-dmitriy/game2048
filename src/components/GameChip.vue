<template>
  <div ref="chipEl" class="chip" :style="style">{{ chip.value }}</div>
</template>

<script setup>
import { computed, watch, nextTick, ref, onMounted } from 'vue'

const fontSizeCoefs = [1, 1, 0.8, 0.65, 0.5, 0.4, 0.35, 0.32]
const backColors = []
backColors[2] = '#87E293'
backColors[4] = '#87E273'
backColors[8] = '#eecf40'
backColors[16] = '#ffaa4f'
backColors[64] = '#9ebbee'
backColors[32] = '#6bcae2'
backColors[128] = 'white'

const colors = []
colors[2] = 'white'
colors[4] = 'white'
colors[8] = 'white'
colors[16] = 'white'
colors[32] = 'white'
colors[64] = 'white'
colors[128] = '#2c3e50'

const props = defineProps({
  chip: { type: Object, required: true },
  sizePx: { type: Number, required: true },
  animationTimeMs: { type: Number, default: 150 },
  /** Длительность анимации движения плитки (мс) */
  moveDurationMs: { type: Number, default: undefined },
  /** Easing для анимации движения (CSS easing) */
  moveEasing: { type: String, default: 'ease-out' }
})

const fontSizePx = computed(() => {
  const n = Math.floor(Math.log(props.chip.value) / Math.log(10))
  const b = Math.floor(props.sizePx / 1.5)
  return b * (n < 8 ? fontSizeCoefs[n] : fontSizeCoefs[7])
})

const backColor = computed(() => backColors[props.chip.value] || backColors[128])
const color = computed(() => colors[props.chip.value] || colors[128])

const boxShadow = computed(() => {
  if (props.chip.value < 256) {
    const s = props.sizePx * 0.1 + 'px '
    return '0 ' + s + s + '0 black'
  }
  return '0 0 20px ' + (2 + Math.min(10, (Math.log(props.chip.value) / Math.log(2) - 7))) + 'px white'
})

const style = computed(() => ({
  fontSize: fontSizePx.value + 'px',
  backgroundColor: backColor.value,
  color: color.value,
  boxShadow: boxShadow.value
}))

const chipEl = ref(null)

watch(() => props.chip.value, () => {
  nextTick(() => {
    const el = chipEl.value
    if (el) {
      const d = props.animationTimeMs + 'ms'
      el.style.animation = 'chip-value-changed ' + d
      el.style.webkitAnimation = 'chip-value-changed ' + d
      el.style.transition = 'background-color ' + d
      el.style.webkitTransition = 'background-color ' + d
    }
  })
})

function runMoveAnimation(el) {
  const moveMs = props.moveDurationMs ?? props.animationTimeMs
  const p = props.chip.prevRelPos
  const startTransform = 'translate(' + p.left + 'px,' + p.top + 'px) translateZ(0)'
  const endTransform = 'translate(0, 0) translateZ(0)'
  const transitionValue = 'transform ' + moveMs + 'ms ' + (props.moveEasing || 'ease-out')

  el.style.transition = 'none'
  el.style.webkitTransition = 'none'
  el.style.transform = startTransform
  el.style.webkitTransform = startTransform
  void el.offsetHeight
  el.style.transition = transitionValue
  el.style.webkitTransition = transitionValue
  el.style.transform = endTransform
  el.style.webkitTransform = endTransform
}

function runAppearAnimation(el) {
  el.style.animation = 'chip-appear ' + props.animationTimeMs + 'ms'
  el.style.webkitAnimation = 'chip-appear ' + props.animationTimeMs + 'ms'
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
  background-color: honeydew;
  z-index: 1;
  border-radius: 7%;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

@keyframes chip-value-changed {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes chip-appear {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
</style>
