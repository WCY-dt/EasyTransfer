<script setup lang="ts">
import OperationId from '@/components/OperationId.vue'
import UploadModal from '@/components/UploadModal.vue'
</script>

<template>
  <div class="operation-cluster">
    <OperationId />
    <UploadModal />
  </div>
</template>

<style scoped lang="scss">
.operation-cluster {
  grid-column: 1 / 2;
  grid-row: 1 / 2;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;

  z-index: 300;
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
