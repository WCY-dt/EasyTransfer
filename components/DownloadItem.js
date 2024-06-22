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
      default: "file"
    },
    success: {
      type: Boolean,
      default: false
    }
  },

  watch: {
    success(newValue) {
      if (newValue) {
        this.$refs.downloadLink.click();
      }
    }
  },

  template: /*html*/`
    <a ref="downloadLink" :href="url" class="downloadFileItem" :download="name" :class="{ success: success, loading: !success }">
      <div id="downloadDisplay">
        <p id="downloadName">{{ name }}</p>
        <progress id="downloadProgress" :value="progress" :max="size">
        </progress>
      </div>
    </a>
  `
}
