<script setup>
import Id from './Id.vue'
import Upload from './Upload.vue'
</script>

<template>
  <div class="operation-cluster">
    <Id />
    <Upload />
  </div>
</template>

<style scoped lang="scss">
.operation-cluster {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rem;
}

@media (max-width: 1440px) {
  .operation-cluster {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }
}

@media (max-width: 768px) {
  .operation-cluster {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    gap: 2rem;
  }
}
</style>
