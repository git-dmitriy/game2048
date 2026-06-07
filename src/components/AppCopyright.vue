<template>
  <footer class="app-copyright">
    <p class="app-copyright-text">© {{ year }} Dmitriy Shalberkin · MIT License</p>
  </footer>
</template>

<script setup lang="ts">
const year = 2026
</script>

<style scoped>
.app-copyright {
  width: 100%;
  flex-shrink: 0;
  text-align: center;
}

.app-copyright-text {
  margin: 0;
  font-size: calc(var(--button-font-size, 0.85rem) * 0.55);
  line-height: 1.3;
  color: var(--color-text);
  opacity: 0.75;
}
</style>
