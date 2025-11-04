<script setup lang="ts">
import { ref } from 'vue'
import SettingsModal from '@/components/SettingsModal.vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiCog, mdiGithub } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showSettings = ref<boolean>(false)
const toggleSettings = (): void => {
  showSettings.value = !showSettings.value
}

const version = 'v' + (process.package_version as string)
</script>

<template>
  <header>
    <div class="header-cluster">
      <div class="logo-cluster">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M21.4 7.5C22.2 8.3 22.2 9.6 21.4 10.3L18.6 13.1L10.8 5.3L13.6 2.5C14.4 1.7 15.7 1.7 16.4 2.5L18.2 4.3L21.2 1.3L22.6 2.7L19.6 5.7L21.4 7.5M15.6 13.3L14.2 11.9L11.4 14.7L9.3 12.6L12.1 9.8L10.7 8.4L7.9 11.2L6.4 9.8L3.6 12.6C2.8 13.4 2.8 14.7 3.6 15.4L5.4 17.2L1.4 21.2L2.8 22.6L6.8 18.6L8.6 20.4C9.4 21.2 10.7 21.2 11.4 20.4L14.2 17.6L12.8 16.2L15.6 13.3Z"
          />
        </svg>
        <div class="logo-text">
          <h1>{{ t('header.title') }}</h1>
          <span>{{ version }}</span>
          <p>{{ t('header.tagline') }}</p>
        </div>
      </div>
      <div class="link-cluster">
        <button class="link-item shadow" @click="toggleSettings">
          <SvgIcon type="mdi" :path="mdiCog" size="1.5rem" /><span
            class="text"
            >{{ t('header.settings') }}</span
          >
        </button>
        <a
          href="https://github.com/WCY-dt/EasyTransfer"
          class="link-item shadow github"
        >
          <SvgIcon type="mdi" :path="mdiGithub" size="1.5rem" /><span
            class="text"
            >{{ t('header.starOnGitHub') }}</span
          >
        </a>
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

  transition: all 0.3s ease-in-out;

  .header-cluster {
    width: calc(min(100%, 125rem));
    padding: 1rem 1rem;

    display: flex;
    justify-content: space-between;
    align-items: center;

    transition: all 0.3s ease-in-out;
  }

  .logo-cluster {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    transition: all 0.3s ease-in-out;

    svg {
      fill: var(--light-color);
      width: 3rem;
      height: 3rem;

      transition: all 0.3s ease-in-out;
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

        transition: all 0.3s ease-in-out;
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

    transition: all 0.3s ease-in-out;

    @media (max-width: 425px) {
      gap: 0.4rem;
    }
  }

  .link-item {
    border: none;
    outline: none;
    background: none;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    padding: 0.5rem 1rem;

    color: var(--primary-color);
    background-color: var(--primary-light-color);

    border-radius: var(--border-radius);

    text-decoration: none;
    line-height: 1rem;

    cursor: pointer;

    transition:
      padding 0.3s ease-in-out,
      color 0.1s ease-in-out,
      background-color 0.1s ease-in-out;

    &.github {
      color: var(--dark-color);
      background-color: var(--gold-color);
    }

    .mdi {
      font-size: 1.5rem;
      line-height: 1.5rem;
    }

    .text {
      font-family: var(--normal-font-family);
      font-size: 1rem;
    }

    @media (hover: hover) {
      &:hover {
        color: var(--primary-light-color);
        background-color: var(--primary-semi-dark-color);

        &.github {
          color: var(--dark-color);
          background-color: var(--gold-light-color);
        }
      }
    }

    @media (max-width: 768px) {
      padding: 0.5rem;

      .text {
        display: none;
      }
    }
  }

  &.blur.shadow {
    --blur-effect: blur(10px);

    background-color: var(--light-blur-color);

    .header-cluster {
      padding: 0.5rem 1rem;

      .logo-cluster {
        gap: 0.3rem;

        svg {
          fill: var(--primary-color);
          width: 2.5rem;
          height: 2.5rem;
        }

        .logo-text {
          * {
            color: var(--primary-color);
          }

          h1 {
            font-size: 1.5rem;
            line-height: 1.5rem;
          }

          span {
            font-size: 0.8rem;
          }

          p {
            font-size: 0.8rem;
          }
        }
      }
    }

    .link-cluster {
      gap: 0.6rem;

      @media (max-width: 425px) {
        gap: 0.3rem;
      }
    }

    .link-item {
      padding: 0.3rem 0.8rem;

      @media (max-width: 768px) {
        padding: 0.3rem;
      }
    }
  }
}
</style>
