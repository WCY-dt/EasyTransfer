import { TRANSFER_CONFIG } from '@/config/transferConfig'
import { FileChunkManager } from '@/utils/fileChunk'
import type { FileReceiveState, RetryData } from '@/types/fileTransfer'

export class RetryManager {
  private timeoutCheckInterval: number | null = null
  private activeFiles: Map<string, FileReceiveState>
  private sendRetryRequest: (retryData: RetryData) => void

  constructor(
    activeFiles: Map<string, FileReceiveState>,
    sendRetryRequest: (retryData: RetryData) => void,
  ) {
    this.activeFiles = activeFiles
    this.sendRetryRequest = sendRetryRequest
  }

  /**
   * Start timeout check
   */
  startTimeoutCheck(): void {
    if (this.timeoutCheckInterval) {
      return // Already started
    }

    this.timeoutCheckInterval = window.setInterval(() => {
      this.checkForTimeoutsAndRetry()
    }, TRANSFER_CONFIG.timeoutCheckInterval)
  }

  /**
   * Stop timeout check
   */
  stopTimeoutCheck(): void {
    if (this.timeoutCheckInterval) {
      window.clearInterval(this.timeoutCheckInterval)
      this.timeoutCheckInterval = null
    }
  }

  /**
   * Check for timeouts and request retry
   */
  private checkForTimeoutsAndRetry(): void {
    const now = Date.now()

    for (const fileState of this.activeFiles.values()) {
      if (fileState.isComplete || fileState.type === 'TRANSFER_TYPE_TEXT') {
        continue
      }

      // Check if timeout and still have retry attempts
      if (
        now - fileState.lastActivity > TRANSFER_CONFIG.timeoutMs &&
        fileState.retryCount < TRANSFER_CONFIG.maxRetries
      ) {
        this.requestMissingChunks(fileState)
      }
    }
  }

  /**
   * Request missing chunks
   */
  requestMissingChunks(fileState: FileReceiveState): void {
    const missingChunks = FileChunkManager.findMissingChunks(
      fileState.receivedChunks,
      fileState.expectedChunks,
    )

    if (missingChunks.length === 0) {
      return // No missing chunks
    }

    fileState.missingChunks = new Set(missingChunks)
    fileState.retryCount++
    fileState.lastActivity = Date.now()

    console.log(
      `[INFO] Requesting retry for file ${fileState.name}, missing ${missingChunks.length} chunks, attempt ${fileState.retryCount}/${TRANSFER_CONFIG.maxRetries}`,
    )

    const retryData: RetryData = {
      fileId: fileState.id,
      fileName: fileState.name,
      missingChunks,
    }

    this.sendRetryRequest(retryData)
  }

  /**
   * Check if file needs retry
   */
  checkFileNeedsRetry(fileState: FileReceiveState): boolean {
    if (fileState.isComplete || fileState.type === 'TRANSFER_TYPE_TEXT') {
      return false
    }

    // Check if all chunks are received
    const allChunksReceived = FileChunkManager.checkChunksComplete(
      fileState.receivedChunks,
      fileState.expectedChunks,
    )

    // If size matches but chunks are missing, need retry
    if (fileState.progress === fileState.size && !allChunksReceived) {
      return true
    }

    return false
  }

  /**
   * Reset file retry state
   */
  resetFileRetryState(fileState: FileReceiveState): void {
    fileState.retryCount = 0
    fileState.missingChunks.clear()
    fileState.lastActivity = Date.now()
  }

  /**
   * Check if the file has exceeded the maximum retry attempts
   */
  isMaxRetriesExceeded(fileState: FileReceiveState): boolean {
    return fileState.retryCount >= TRANSFER_CONFIG.maxRetries
  }

  /**
   * Update file activity time
   */
  updateFileActivity(fileState: FileReceiveState): void {
    fileState.lastActivity = Date.now()
  }

  /**
   * Destroy the retry manager
   */
  destroy(): void {
    this.stopTimeoutCheck()
  }
}
