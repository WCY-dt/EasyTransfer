<script setup lang="ts"></script>

<template>
  <footer>
    <p>© 2024 EasyTransfer. All rights reserved.</p>
    <p>
      View on
      <a href="https://github.com/WCY-dt/EasyTransfer"
        ><span class="mdi mdi-github"></span>GitHub</a
      >
    </p>
  </footer>
</template>

<style scoped lang="scss">
footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 1rem;

  p {
    margin: 0;
    padding: 0;

    font-size: 1.2rem;
    text-align: center;

    color: var(--secondary-color);

    a {
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
