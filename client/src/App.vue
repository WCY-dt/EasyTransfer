<script setup lang="ts">
import HeaderModal from '@/components/HeaderModal.vue'
import OperationModal from '@/components/OperationModal.vue'
import SendModal from '@/components/SendModal.vue'
import ReceiveModal from '@/components/ReceiveModal.vue'
import FooterModal from '@/components/FooterModal.vue'
</script>

<template>
  <HeaderModal />
  <div id="app-content">
    <div class="app-cluster">
      <OperationModal />
      <SendModal />
      <ReceiveModal />
    </div>
  </div>
  <FooterModal />
</template>

<style scoped lang="scss">
#app-content {
  display: flex;
  align-items: start;
  justify-content: center;

  width: 100%;
  min-height: 40vh;

  z-index: 0;
}

.app-cluster {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 2rem;

  width: min(96vw, 120rem);
  margin: 2rem 2vw;

  & > * {
    width: calc((min(96vw, 120rem) - 4rem) / 3);
  }
}

@media (max-width: 1440px) {
  .app-cluster {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

    & > * {
      width: calc((min(96vw, 120rem) - 2rem) / 2);
    }
  }
}

@media (max-width: 768px) {
  .app-cluster {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;

    gap: 4rem;

    & > * {
      width: 96vw;
    }
  }
}
</style>
