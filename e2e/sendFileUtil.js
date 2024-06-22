class SendFileUtil {
  constructor() {
    this.sendCore = null;

    this.currentFileType = '';
    this.currentFileName = 'Drop file here or click to upload';
    this.currentFileSize = 0;

    this.chunkSize = 16384;
    this.fileReader = null;
    this.offset = 0;
  }

  async sendFiles(files, sendCore) { // Send the file meta and content
    console.log(`[INFO] ===Sending ${files.length} files===`)

    this.sendCore = sendCore

    const fileNum = files.length

    if (fileNum === 0) {
      console.error(`[ERR] No file selected`)
      return
    }

    for (let i = 0; i < fileNum; i++) {
      await this.sendFileMeta(files[i])
    }

    for (let i = 0; i < fileNum; i++) {
      await this.sendFileContent(files[i])
    }
  }

  async sendFileMeta(file) { // Send the type, name, and size of the file
    if (!this.checkSendAvailability(file.size)) return

    await this.sendCore.sendData('file')
    await this.sendCore.sendData(file.name)
    await this.sendCore.sendData(file.size)

    console.log(`[INFO] Sent meta: ${'file'} | ${file.name} | ${file.size}`)
  }

  async sendFileContent(file) { // Send the content of the file
    if (!this.checkSendAvailability(file.size)) return

    this.currentFileType = 'file'
    this.currentFileName = file.name
    this.currentFileSize = file.size

    console.log(`[INFO] Sending file ${this.currentFileType} | ${this.currentFileName} | ${this.currentFileSize}`)

    await this.addFileReader()
    this.offset = 0

    const readAndSendSlice = (o) => {
      return new Promise((resolve, reject) => {
        if (o >= this.currentFileSize) {
          resolve()
          return
        }

        this.fileReader.onload = async (e) => {
          await this.sendCore.sendData(e.target.result)
          this.offset += e.target.result.byteLength
          fileProgress.value = this.offset
          if (this.offset < this.currentFileSize) {
            resolve(readAndSendSlice(this.offset))
          } else {
            resolve()
          }
        }

        const slice = file.slice(o, o + this.chunkSize)
        this.fileReader.readAsArrayBuffer(slice)
      })
    }

    await readAndSendSlice(0)
  }

  async addFileReader() {
    this.fileReader = new FileReader()

    this.fileReader.addEventListener('error', (error) => {
      console.error(`[ERR] Error reading file: ${error}`)
    })

    this.fileReader.addEventListener('abort', (event) => {
      console.log(`[INFO] File reading aborted: ${event}`)
    })
  }

  checkSendAvailability(size) { // Check if the file is empty or the data channel is open
    if (size === 0) {
      console.error(`[ERR] File is empty`)
      return false
    }

    if (this.sendCore.getChannelState() !== 'open') {
      console.error('[ERR] Data channel is not open')
      return false
    }

    return true
  }
}

export default SendFileUtil