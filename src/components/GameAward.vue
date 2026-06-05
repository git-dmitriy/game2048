<template>
  <div
      class="award"
      :class="{ 'award-obtained': award.obtained, 'award-not-obtained': !award.obtained }"
  >
    <Icon :icon="thumbUpIcon" class="like" aria-hidden="true"/>
    {{ award.aim }}
  </div>
</template>

<script setup>
import {Icon} from '@iconify/vue'
import {thumbUpIcon} from '../icons.js'

defineProps({
  award: {type: Object, required: true},
})
</script>

<style scoped>
.award {
  border-radius: 15% / 50%;
  text-align: center;
  font-size: var(--award-font-size);
  width: var(--award-width);
}

.like {
  width: 25%;
  height: var(--award-like-height);
  top: 2px;
  position: relative;
}

.award-not-obtained {
  color: var(--color-award-muted);
  background-color: var(--color-award-inactive-bg);
}

.award-not-obtained .like {
  color: var(--color-award-muted);
}

.award-obtained {
  color: var(--color-on-dark);
  text-shadow: 0 0 4px var(--color-award-orange);
  background: linear-gradient(
      to top right,
      var(--color-award-gold),
      var(--color-award-yellow)
  );
  box-shadow: 0 2px 4px 0 var(--color-shadow);
  filter: drop-shadow(-1px -1px 0 var(--color-award-orange));
}

.award-obtained .like {
  color: var(--color-on-dark);
}
</style>
