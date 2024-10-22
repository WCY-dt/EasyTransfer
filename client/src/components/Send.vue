<script setup>
import SendText from './SendText.vue'
import SendFile from './SendFile.vue'
import SendPhoto from './SendPhoto.vue'
</script>

<template>
  <div id="upload" class="upload">
    <SendFile />
    <SendPhoto />
    <SendText />
  </div>
</template>

<style scoped lang="scss">
.upload {
  display: grid;
  grid-template-columns: 5fr 4fr;
  grid-template-rows: 1fr auto;
  gap: 1rem;
  width: 100%;

  &>* {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    border-width: 2px;
    border-color: var(--primary-color);
    border-radius: 0.25rem;
    color: var(--primary-color);
    background-color: var(--primary-light-color);
    transition: all 0.3s ease-in-out;

    &.disabled {
      border-color: var(--secondary-color);
      background-color: var(--secondary-light-color);
      color: var(--secondary-color);
      cursor: not-allowed;
    }
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
