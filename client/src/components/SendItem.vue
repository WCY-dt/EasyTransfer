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
  " ref="uploadLink" :href="props.url" class="uploadFileItem file" :upload="props.name"
    :class="{ success: props.success, loading: !props.success }">
    <span v-if="props.type === 'TRANSFER_TYPE_FILE'" class="mdi mdi-file-document"></span>
    <span v-else-if="props.type === 'TRANSFER_TYPE_PHOTO'" class="mdi mdi-image"></span>
    <div id="uploadDisplay">
      <p id="uploadName">{{ props.name }}</p>
      <progress id="uploadProgress" :value="props.progress" :max="props.size"></progress>
      <img v-if="props.type === 'TRANSFER_TYPE_PHOTO' && props.success" id="uploadContent" :src="props.url"
        alt="Photo" />
    </div>
  </a>
  <div v-if="props.type === 'TRANSFER_TYPE_TEXT'" class="uploadFileItem text"
    :class="{ success: props.success, loading: !props.success }" @click="onTextClick">
    <span class="mdi mdi-message-text"></span>
    <div id="uploadDisplay">
      <p id="uploadContent">{{ props.name }}</p>
      <div class="cover">
        <span class="mdi mdi-check-bold" v-if="copied"></span>
        <span class="mdi mdi-content-copy" v-else></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.uploadFileItem {
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid;
  border-radius: 0.25rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  .mdi {
    align-self: flex-start;
    font-size: 2.5rem;
  }

  #uploadDisplay {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0 auto;
    width: 100%;

    p {
      margin: 0;
      transition: all 0.2s ease-in-out;

      &#uploadName {
        font-size: 1.5rem;
        font-weight: 700;
      }

      &#uploadContent {
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

    @media (hover: hover) {
      &.file:hover {
        background-color: var(--success-color);
        color: var(--light-color);

        #uploadDisplay progress::-webkit-progress-value {
          background-color: var(--light-color);
        }
      }
    }

    #uploadDisplay {
      progress {
        &::-webkit-progress-value {
          background-color: var(--success-color);
          transition: all 0.2s ease-in-out;
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

        span {
          height: 100%;

          &::before {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      @media (hover: hover) {
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
  }

  &.loading {
    border-color: var(--primary-color);
    background-color: var(--primary-light-color);
    color: var(--primary-color);
    cursor: not-allowed;

    #uploadDisplay {
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
</style>
