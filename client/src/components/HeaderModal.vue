<script setup>
import { ref } from 'vue'
import SettingsModal from './SettingsModal.vue'

const showSettings = ref(false)
const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const version = 'v' + process.package_version
</script>

<template>
  <header>
    <div class="header-cluster">
      <div class="logo-cluster">
        <img src="/src/assets/favicon.svg" alt="EasyTransfer Logo" />
        <div class="logo-text">
          <h1>EasyTransfer</h1>
          <span>{{ version }}</span>
          <p>Share simply & stay anonymous.</p>
        </div>
      </div>
      <div class="link-cluster">
        <a class="link-item shadow" @click="toggleSettings"
          ><span class="mdi mdi-cog"></span
          ><span class="text">Settings</span></a
        >
        <a
          href="https://github.com/WCY-dt/EasyTransfer"
          class="link-item shadow"
          ><span class="mdi mdi-github"></span
          ><span class="text">GitHub</span></a
        >
      </div>
    </div>
  </header>
  <SettingsModal v-if="showSettings" @close="toggleSettings" />
</template>

<style scoped lang="scss">
header {
  display: grid;
  place-items: center;

  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  margin-bottom: 1rem;

  background-color: var(--primary-color);
  color: var(--light-color);

  font-family: var(--normal-font-family);

  .header-cluster {
    width: calc(min(100%, 125rem));
    padding: 1rem 1rem;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-cluster {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    img {
      width: 3rem;
      height: 3rem;
    }

    .logo-text {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      gap: 0.1rem 0.5rem;
      place-items: start start;

      * {
        margin: 0;
        padding: 0;

        line-height: 1rem;
      }

      h1 {
        grid-row: 1 / 2;
        grid-column: 1 / 2;

        font-size: 2rem;
        line-height: 2rem;
        font-weight: 900;
        font-family: var(--code-font-family);
      }

      span {
        grid-row: 1 / 2;
        grid-column: 2 / 3;

        font-weight: 100;
        font-size: 0.8rem;
      }

      p {
        grid-row: 2 / 3;
        grid-column: 1 / 3;

        letter-spacing: 0.08rem;
      }
    }
  }

  .link-cluster {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;

    @media (max-width: 425px) {
      gap: 0.4rem;
    }
  }

  .link-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    padding: 0.5rem 1rem;

    color: var(--light-color);
    background-color: var(--primary-dark-color);

    border-radius: var(--border-radius);

    text-decoration: none;
    line-height: 1rem;

    cursor: pointer;

    transition: all 0.1s ease-in-out;

    .mdi {
      font-size: 1.5rem;
      line-height: 1.5rem;
    }

    @media (hover: hover) {
      &:hover {
        color: var(--primary-light-color);
      }
    }

    @media (max-width: 768px) {
      padding: 0.5rem;

      .text {
        display: none;
      }
    }
  }
}
</style>
