<script setup>
import UploadText from './UploadText.vue'
import UploadFile from './UploadFile.vue'
import UploadPhoto from './UploadPhoto.vue'
</script>

<template>
  <div id="upload" class="upload">
    <UploadFile />
    <UploadPhoto />
    <UploadText />
  </div>
</template>

<style scoped lang="scss">
.upload {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 1rem;
  width: 100%;

  &>* {
    width: 100%;
    padding: 0.5rem;
    border-width: 2px;
    border-color: var(--primary-color);
    border-radius: 0.25rem;
    transition: all 0.3s ease-in-out;
  }
}

@media (max-width: 768px) {
  .upload {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;

    &>* {
      width: 100%;
    }
  }
}
</style>
