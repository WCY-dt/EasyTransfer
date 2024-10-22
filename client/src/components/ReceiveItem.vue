<script setup>
import { ref } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: 'javascript:void(0)',
  },
  name: {
    type: String,
    default: 'No file to download',
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
  " ref="downloadLink" :href="props.url" class="downloadFileItem file" :download="props.name"
    :class="{ success: props.success, loading: !props.success }">
    <div id="downloadDisplay">
      <p id="downloadName">{{ props.name }}</p>
      <progress id="downloadProgress" :value="props.progress" :max="props.size"></progress>
      <img v-if="props.type === 'TRANSFER_TYPE_PHOTO' && props.success" id="downloadContent" :src="props.url"
        alt="Photo" />
    </div>
  </a>
  <div v-if="props.type === 'TRANSFER_TYPE_TEXT'" class="downloadFileItem text"
    :class="{ success: props.success, loading: !props.success }" @click="onTextClick">
    <div id="downloadDisplay">
      <p id="downloadContent">{{ props.name }}</p>
      <div class="cover">
        <span class="mdi mdi-check-bold" v-if="copied"></span>
        <span class="mdi mdi-content-copy" v-else></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.downloadFileItem {
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: 1px solid;
  border-radius: 0.25rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  #downloadDisplay {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0 auto;
    width: 100%;

    p {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      transition: all 0.2s ease-in-out;

      &#downloadName {
        font-size: 1.5rem;
        font-weight: 700;
      }

      &#downloadContent {
        font-size: 1.2rem;
        font-weight: 500;
      }
    }

    progress {
      width: 100%;
      height: 0.5rem;
      border: none;
      border-radius: 0.25rem;
    }
  }

  &.success {
    border-color: var(--success-color);
    background-color: var(--success-light-color);
    color: var(--success-color);

    &.file:hover {
      background-color: var(--success-color);
      color: var(--light-color);
    }

    #downloadDisplay {
      progress {
        &::-webkit-progress-value {
          background-color: var(--success-color);
          transition: all 0.2s ease-in-out;
        }

        &::-webkit-progress-value {
          background-color: var(--light-color);
        }
      }
    }

    &.text {
      position: relative;

      .cover {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: transparent;
        color: var(--success-color);
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.2s ease-in-out;
      }

      &:hover {
        p {
          opacity: 0.2;
        }

        .cover {
          opacity: 1;
        }
      }
    }
  }

  &.loading {
    border-color: var(--primary-color);
    background-color: var(--primary-light-color);
    color: var(--primary-color);
    cursor: not-allowed;

    #downloadDisplay {
      progress {
        &::-webkit-progress-value {
          background-color: var(--primary-color);
          transition: all 0.2s ease-in-out;
        }

        &::-webkit-progress-bar {
          background-color: var(--light-color);
        }
      }
    }
  }
}

@media (hover: none) {
  .downloadFileItem {
    &.success {
      &:hover {
        background-color: var(--success-light-color);
        color: var(--success-color);

        #downloadDisplay progress::-webkit-progress-value {
          background-color: var(--success-color);
        }
      }

      &.text:hover {
        p {
          opacity: 1;
        }

        .cover {
          opacity: 0;
        }
      }
    }
  }
}
</style>
