<script setup>
import UploadText from './UploadText.vue'
import UploadFile from './UploadFile.vue'
import UploadPhoto from './UploadPhoto.vue'
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
