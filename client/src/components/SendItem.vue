<script setup>
import { ref } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: 'javascript:void(0)',
  },
  name: {
    type: String,
    default: 'No file to upload',
  },
  size: {
    type: Number,
    default: 1,
  },
  progress: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    default: 'TRANSFER_TYPE_FILE',
  },
  success: {
    type: Boolean,
    default: false,
  },
})

const copied = ref(false)

function onTextClick() {
  navigator.clipboard.writeText(props.name)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1000)
}
</script>

<template>
  <a v-if="
    props.type === 'TRANSFER_TYPE_FILE' ||
    props.type === 'TRANSFER_TYPE_PHOTO'
  " ref="uploadLink" :href="props.url" class="upload-item file" :download="props.name"
    :class="{ success: props.success, loading: !props.success }">
    <span v-if="props.type === 'TRANSFER_TYPE_FILE'" class="mdi mdi-file-document"></span>
    <span v-else-if="props.type === 'TRANSFER_TYPE_PHOTO'" class="mdi mdi-image"></span>
    <div class="upload-item-detail">
      <p class="upload-item-name">{{ props.name }}</p>
      <progress class="upload-item-progress" :value="props.progress" :max="props.size"></progress>
      <img v-if="props.type === 'TRANSFER_TYPE_PHOTO' && props.success" class="upload-item-content" :src="props.url"
        alt="Photo" />
    </div>
  </a>
  <div v-if="props.type === 'TRANSFER_TYPE_TEXT'" class="upload-item text"
    :class="{ success: props.success, loading: !props.success }" @click="onTextClick">
    <span class="mdi mdi-message-text"></span>
    <div class="upload-item-detail">
      <p class="upload-item-content">{{ props.name }}</p>
      <div class="copy-cover">
        <span class="mdi mdi-check-bold" v-if="copied"></span>
        <span class="mdi mdi-content-copy" v-else></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.upload-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  width: 100%;
  padding: 0.5rem 1rem;
  border: 2px solid;
  border-radius: 0.25rem;

  text-decoration: none;

  cursor: pointer;

  transition: all 0.1s ease-in-out;

  .mdi {
    align-self: flex-start;
    font-size: 2.5rem;
  }

  .upload-item-detail {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    margin: 0 auto;
    width: 100%;

    p {
      margin: 0;

      transition: all 0.1s ease-in-out;

      &.upload-item-name {
        font-size: 1.5rem;
        font-weight: 700;
      }

      &.upload-item-content {
        font-size: 1.2rem;
        font-weight: 500;
      }
    }

    .upload-item-progress {
      width: 100%;
      height: 0.5rem;
      border: none;
      border-radius: 0.25rem;
    }

    img {
      width: 100%;
      height: auto;
      border-radius: 0.25rem;
    }
  }

  &.success {
    border-color: var(--success-color);

    background-color: var(--success-light-color);
    color: var(--success-color);

    @media (hover: hover) {
      &.file:hover {
        background-color: var(--success-color);
        color: var(--light-color);

        .upload-item-detail .upload-item-progress::-webkit-progress-value {
          background-color: var(--light-color);
        }
      }
    }

    .upload-item-detail {
      .upload-item-progress {
        &::-webkit-progress-value {
          background-color: var(--success-color);

          transition: all 0.1s ease-in-out;
        }
      }
    }

    &.text {
      position: relative;

      .copy-cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        opacity: 0;
        display: grid;
        place-content: center;

        font-size: 1.5rem;

        background-color: transparent;
        color: var(--success-color);

        transition: all 0.1s ease-in-out;

        .mdi {
          height: 100%;

          &::before {
            display: grid;
            place-content: center;

            height: 100%;
          }
        }
      }

      @media (hover: hover) {
        &:hover {
          .upload-item-content {
            opacity: 0.2;
          }

          .copy-cover {
            opacity: 1;
          }
        }
      }
    }
  }

  &.loading {
    border-color: var(--primary-color);

    background-color: var(--primary-light-color);
    color: var(--primary-color);

    cursor: not-allowed;

    .upload-item-detail {
      .upload-item-progress {
        &::-webkit-progress-value {
          background-color: var(--primary-color);

          transition: all 0.1s ease-in-out;
        }

        &::-webkit-progress-bar {
          background-color: var(--light-color);
        }
      }
    }
  }
}
</style>
