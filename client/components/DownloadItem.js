export default {
  props: {
    url: {
      type: String,
      default: "javascript:void(0)"
    },
    name: {
      type: String,
      default: "No file to download"
    },
    size: {
      type: Number,
      default: 1
    },
    progress: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      default: "TRANSFER_TYPE_FILE"
    },
    success: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      copied: false
    }
  },

  methods: {
    onTextClick() {
      navigator.clipboard.writeText(this.name)
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 1000);
    }
  },

  template: /*html*/`
    <a v-if="type==='TRANSFER_TYPE_FILE' || type==='TRANSFER_TYPE_PHOTO'" ref="downloadLink" :href="url" class="downloadFileItem file" :download="name" :class="{ success: success, loading: !success }">
      <div id="downloadDisplay">
        <p id="downloadName">{{ name }}</p>
        <progress id="downloadProgress" :value="progress" :max="size"></progress>
        <img v-if="type==='TRANSFER_TYPE_PHOTO' && success"
          id="downloadContent"
          :src="url"
          alt="Photo"
        />
      </div>
    </a>
    <div v-if="type==='TRANSFER_TYPE_TEXT'" class="downloadFileItem text" :class="{ success: success, loading: !success }" @click="onTextClick">
      <div id="downloadDisplay">
        <p id="downloadContent">{{ name }}</p>
        <div class="cover">
          <span class="mdi mdi-check-bold" v-if="copied"></span>
          <span class="mdi mdi-content-copy" v-else></span>
        </div>
      </div>
    </div>
  `
}
