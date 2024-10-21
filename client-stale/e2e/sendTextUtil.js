class SendTextUtil {
  constructor() {
    this.sendCore = null;
  }

  async sendText(text, sendCore) { // Send the file meta and content
    console.log(`[INFO] ===Sending text===`)

    this.sendCore = sendCore

    await this.sendTextContent(text)
  }

  async sendTextContent(text) { // Send the type, name, and size of the file
    if (!this.checkSendAvailability(text)) return

    await this.sendCore.sendData('CONTENT_META' + 'TRANSFER_TYPE_TEXT')
    await this.sendCore.sendData('CONTENT_META' + text)
    await this.sendCore.sendData('CONTENT_META' + text.length)

    console.log(`[INFO] Sent content: ${'TRANSFER_TYPE_TEXT'} | ${text} | ${text.length}`)
  }

  checkSendAvailability(text) { // Check if the text is empty or the data channel is open
    if (text === '') {
      console.error('[ERR] Text is empty')
      return false
    }

    if (this.sendCore.getChannelState() !== 'open') {
      console.error('[ERR] Data channel is not open')
      return false
    }

    return true
  }
}

export default SendTextUtil