<script setup>
import HeaderCluster from './components/HeaderCluster.vue';
import OperationCluster from '@/components/OperationCluster.vue'
import SendCluster from '@/components/SendCluster.vue'
import ReceiveCluster from '@/components/ReceiveCluster.vue'
import FooterCluster from './components/FooterCluster.vue';
</script>

<template>
  <HeaderCluster />
  <div id="app-content">
    <div class="app-cluster">
      <OperationCluster />
      <SendCluster />
      <ReceiveCluster />
    </div>
  </div>
  <FooterCluster />
</template>

<style scoped lang="scss">
#app-content {
  display: flex;
  align-items: start;
  justify-content: center;

  width: 100%;
  min-height: 40vh;
}

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
