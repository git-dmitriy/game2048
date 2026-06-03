<template>
  <div ref="bannerEl" class="collect-all-awards">
    <span>{{ strings.collectAllAwards }}</span>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useStrings} from '../composables/useStrings.js'

const strings = useStrings()
const bannerEl = ref(null)

function replay() {
  const el = bannerEl.value
  if (!el) return
  el.style.animation = ''
  requestAnimationFrame(() => {
    el.style.animation = 'collect-all-awards 10s'
  })
}

defineExpose({replay})
</script>

<style scoped>
.collect-all-awards {
  text-align: center;
  width: 100%;
  opacity: 0;
  margin-top: 4px;
}

.collect-all-awards span {
  border: 1px solid var(--color-text);
  border-radius: 7% / 50%;
  padding: 0 3px;
}

@keyframes collect-all-awards {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  60% {
    transform: translateY(20px);
    opacity: 0;
  }
  65% {
    opacity: 1;
    transform: translateY(0);
  }
  78% {
    transform: translateX(0);
    opacity: 1;
  }
  79% {
    transform: translateX(5px);
    opacity: 1;
  }
  80% {
    transform: translateX(-5px);
    opacity: 1;
  }
  81% {
    transform: translateX(5px);
    opacity: 1;
  }
  82% {
    transform: translateX(-5px);
    opacity: 1;
  }
  83% {
    transform: translateX(5px);
    opacity: 1;
  }
  84% {
    transform: translateX(-5px);
    opacity: 1;
  }
  85% {
    transform: translateX(5px);
    opacity: 1;
  }
  86% {
    transform: translateX(-5px);
    opacity: 1;
  }
  87% {
    transform: translateX(5px);
    opacity: 1;
  }
  88% {
    transform: translateX(-5px);
    opacity: 1;
  }
  89% {
    transform: translateX(0);
    opacity: 1;
  }
  99% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateY(20px);
    opacity: 0;
  }
}
</style>
