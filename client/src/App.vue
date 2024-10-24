<script setup>
import Operation from '@/components/Operation.vue'
import Send from '@/components/Send.vue'
import Receive from '@/components/Receive.vue'
</script>

<template>
  <div class="app-cluster">
    <Operation />
    <Send />
    <Receive />
  </div>
</template>

<style scoped lang="scss">
.app-cluster {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 2rem;

  width: min(96vw, 120rem);
  margin: 2rem 2vw;

  &>* {
    width: calc((min(96vw, 120rem) - 4rem) / 3);
  }
}

@media (max-width: 1440px) {
  .app-cluster {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

    &>* {
      width: calc((min(96vw, 120rem) - 2rem) / 2);
    }
  }
}

@media (max-width: 768px) {
  .app-cluster {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;

    gap: 4rem;

    &>* {
      width: 96vw;
    }
  }
}
</style>
