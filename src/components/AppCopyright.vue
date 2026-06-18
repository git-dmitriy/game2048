<template>
  <footer class="app-copyright">
    <p class="app-copyright-text">
      © {{ year }} Dmitriy Shalberkin ·
      <a
          class="app-copyright-link"
          href="https://github.com/git-dmitriy/game2048/blob/master/LICENSE"
          target="_blank"
          rel="license noopener noreferrer"
      >MIT License</a>
    </p>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
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

.app-copyright-link {
  color: inherit;
  text-decoration: none;
}

.app-copyright-link:hover {
  text-decoration: underline;
}
</style>
