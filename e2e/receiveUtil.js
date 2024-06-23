class ReceiveUtil {
  constructor() {
    this.addDownloadFileItem = null;
    this.updateFileProgress = null;
    this.updateFileUrl = null;
    this.updateFileSuccess = null;

    this.currentFileType = '';
    this.currentFileName = '';
    this.currentFileSize = 0;
    this.currentFileProgress = 0;
    this.currentFileUrl = '';
    
    this.fileTypeQueue = [];
    this.fileNameQueue = [];
    this.fileSizeQueue = [];

    this.receiveChannel = null;

    this.currentReceivingFileNo = -1;

    this.receivedData = [];
  }

  receiveFiles(connectCore, addDownloadFileItem, updateFileProgress, updateFileUrl, updateFileSuccess) {
    connectCore.peerConnection.ondatachannel = (event) => {
      this.addDownloadFileItem = addDownloadFileItem
      this.updateFileProgress = updateFileProgress
      this.updateFileUrl = updateFileUrl
      this.updateFileSuccess = updateFileSuccess

      this.initReceiveBuffer()
      this.establishReceiveChannel(event.channel)
    }
  }

  establishReceiveChannel(channel) {
    this.receiveChannel = channel

    this.receiveChannel.onopen = () => {
      console.log(`[INFO] Receive channel opened`)
    }

    this.receiveChannel.onerror = error => {
      console.error(`[ERR] Receive channel error: ${error}`)
    }

    this.receiveChannel.onclose = () => {
      console.log(`[INFO] Receive channel closed`)
    }

    this.receiveChannel.onmessage = async (event) => {
      await this.handleReceiveChannelMsg(event)
    }
  }

  async handleReceiveChannelMsg(event) {
    if (typeof event.data === 'string') {
      await this.handleFileMeta(event.data)
    } else {
      await this.handleFileContent(event.data)
    }
  }

  async handleFileMeta(data) {
    if (parseInt(data)) {
      console.log(`[INFO] Received size: ${data}`)
      this.fileSizeQueue.push(parseInt(data))
    } else {
      if (data === 'TRANSFER_TYPE_FILE'
        || data === 'TRANSFER_TYPE_TEXT'
        || data === 'TRANSFER_TYPE_PHOTO'
      ) {
        console.log(`[INFO] Received type: ${data}`)
        this.fileTypeQueue.push(data)
      } else {
        console.log(`[INFO] Received name: ${data}`)
        this.fileNameQueue.push(data)
      }
    }

    if (this.fileNameQueue.length === this.fileSizeQueue.length
      && this.fileNameQueue.length === this.fileTypeQueue.length
    ) {
      console.log(`[INFO] ===New to receive ${this.fileTypeQueue[this.fileTypeQueue.length - 1]} | ${this.fileNameQueue[this.fileNameQueue.length - 1]} | ${this.fileSizeQueue[this.fileSizeQueue.length - 1]}===`)

      this.addDownloadFileItem(
        "javascript:void(0)",
        this.fileNameQueue[this.fileNameQueue.length - 1],
        this.fileSizeQueue[this.fileSizeQueue.length - 1],
        0,
        this.fileTypeQueue[this.fileTypeQueue.length - 1]
      )

      if (this.fileTypeQueue[this.fileTypeQueue.length - 1] === 'TRANSFER_TYPE_TEXT') {
        this.fileTypeQueue.shift()
        this.fileNameQueue.shift()
        this.fileSizeQueue.shift()
        this.currentReceivingFileNo++

        this.updateFileSuccess(this.currentReceivingFileNo, true)
      }
    }
  }

  async handleFileContent(data) {
    if (!this.currentFileName && this.fileNameQueue.length > 0) {
      this.currentFileType = this.fileTypeQueue.shift()
      this.currentFileName = this.fileNameQueue.shift()
      this.currentFileSize = this.fileSizeQueue.shift()
      this.currentReceivingFileNo++
      
      console.log(`[INFO] ===Receiving file ${this.currentFileType} | ${this.currentFileName} | ${this.currentFileSize}===`)
    }

    // receive file
    this.receivedData.push(data)
    this.currentFileProgress += data.byteLength
    this.updateFileProgress(this.currentReceivingFileNo, this.currentFileProgress)

    // check if file is fully received
    if (this.currentFileProgress === this.currentFileSize) {
      this.currentFileUrl = URL.createObjectURL(new Blob(this.receivedData))
      this.updateFileUrl(this.currentReceivingFileNo, this.currentFileUrl)
      this.updateFileSuccess(this.currentReceivingFileNo, true)

      console.log(`[INFO] File ${this.currentFileName} received successfully`)

      this.initReceiveBuffer()
    }
  }

  initReceiveBuffer() {
    this.receivedData = []
    
    this.currentFileType = ''
    this.currentFileName = ''
    this.currentFileSize = 0
    this.currentFileProgress = 0
    this.currentFileUrl = ''
  }
}

export default ReceiveUtil;