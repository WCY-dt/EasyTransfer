<script setup lang="ts">
import UploadText from '@/components/UploadText.vue'
import UploadFile from '@/components/UploadFile.vue'
import UploadPhoto from '@/components/UploadPhoto.vue'
</script>

<template>
  <div id="upload" class="upload-cluster">
    <UploadFile />
    <UploadPhoto />
    <UploadText />
  </div>
</template>

<style scoped lang="scss">
.upload-cluster {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.5rem;

  width: 100%;

  z-index: 400;

  & > * {
    width: 100%;

    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);

    transition: all 0.1s ease-in-out;
  }
}

@media (max-width: 768px) {
  .upload-cluster {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;

    & > * {
      width: 100%;
    }
  }
}
</style>
