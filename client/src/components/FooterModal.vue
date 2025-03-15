<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiInformation, mdiCommentQuote, mdiGithub } from '@mdi/js'
</script>

<template>
  <footer>
    <p>© 2024 EasyTransfer. All rights reserved.</p>
    <p>
      <a href="https://github.com/WCY-dt/EasyTransfer/blob/main/README.md">
        <SvgIcon type="mdi" :path="mdiInformation" size="1.2rem" />About
      </a>
      |
      <a href="https://github.com/WCY-dt/EasyTransfer/issues/new/choose">
        <SvgIcon type="mdi" :path="mdiCommentQuote" size="1.2rem" />Feedback
      </a>
      |
      <a href="https://github.com/WCY-dt/EasyTransfer">
        <SvgIcon type="mdi" :path="mdiGithub" size="1.2rem" />GitHub
      </a>
    </p>
  </footer>
</template>

<style scoped lang="scss">
footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  padding: 1rem;

  p {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    margin: 0;
    padding: 0;

    font-size: 1.2rem;
    line-height: 1.2rem;
    text-align: center;

    color: var(--secondary-color);

    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.1rem;

      color: var(--primary-color);

      text-decoration: none;

      transition: all 0.1s ease-in-out;

      @media (hover: hover) {
        &:hover {
          color: var(--primary-dark-color);

          text-decoration: underline;
        }
      }
    }
  }
}
</style>
