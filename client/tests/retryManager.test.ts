import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RetryManager } from '../src/utils/retryManager'
import { TRANSFER_CONFIG } from '@/config/transferConfig'
import type { FileReceiveState, RetryData } from '@/types/fileTransfer'

describe('RetryManager', () => {
  let activeFiles: Map<string, FileReceiveState>
  let sendRetryRequestMock: ReturnType<typeof vi.fn>
  let retryManager: RetryManager

  beforeEach(() => {
    activeFiles = new Map()
    sendRetryRequestMock = vi.fn()
    retryManager = new RetryManager(activeFiles, sendRetryRequestMock)
    vi.useFakeTimers()
  })

  afterEach(() => {
    retryManager.destroy()
    vi.useRealTimers()
  })

  describe('startTimeoutCheck', () => {
    it('should start timeout check interval', () => {
      retryManager.startTimeoutCheck()

      expect(vi.getTimerCount()).toBeGreaterThan(0)
    })

    it('should not start multiple intervals', () => {
      retryManager.startTimeoutCheck()
      const initialCount = vi.getTimerCount()

      retryManager.startTimeoutCheck()

      expect(vi.getTimerCount()).toBe(initialCount)
    })

    it('should check for timeouts at configured intervals', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 500,
        url: '',
        receivedChunks: new Array(5),
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now() - TRANSFER_CONFIG.timeoutMs - 1000,
      }
      activeFiles.set('test1', fileState)

      retryManager.startTimeoutCheck()
      vi.advanceTimersByTime(TRANSFER_CONFIG.timeoutCheckInterval)

      expect(sendRetryRequestMock).toHaveBeenCalled()
    })
  })

  describe('stopTimeoutCheck', () => {
    it('should stop timeout check interval', () => {
      retryManager.startTimeoutCheck()
      const initialCount = vi.getTimerCount()

      retryManager.stopTimeoutCheck()

      expect(vi.getTimerCount()).toBeLessThan(initialCount)
    })

    it('should not error when stopping without starting', () => {
      expect(() => retryManager.stopTimeoutCheck()).not.toThrow()
    })
  })

  describe('requestMissingChunks', () => {
    it('should request missing chunks for incomplete file', () => {
      const chunks = new Array(10)
      chunks[0] = new ArrayBuffer(100)
      chunks[1] = new ArrayBuffer(100)
      // chunks[2] missing
      chunks[3] = new ArrayBuffer(100)
      // chunks[4-9] missing

      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 300,
        url: '',
        receivedChunks: chunks,
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      retryManager.requestMissingChunks(fileState)

      expect(sendRetryRequestMock).toHaveBeenCalledTimes(1)
      const calledWith = sendRetryRequestMock.mock.calls[0][0] as RetryData
      expect(calledWith.fileId).toBe('test1')
      expect(calledWith.fileName).toBe('test.txt')
      expect(calledWith.missingChunks).toEqual([2, 4, 5, 6, 7, 8, 9])
    })

    it('should increment retry count', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: new Array(10),
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      const initialRetryCount = fileState.retryCount
      retryManager.requestMissingChunks(fileState)

      expect(fileState.retryCount).toBe(initialRetryCount + 1)
    })

    it('should update last activity time', () => {
      const oldTime = Date.now() - 5000
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: new Array(10),
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: oldTime,
      }

      retryManager.requestMissingChunks(fileState)

      expect(fileState.lastActivity).toBeGreaterThan(oldTime)
    })

    it('should not request when no chunks are missing', () => {
      const chunks = new Array(5)
      for (let i = 0; i < 5; i++) {
        chunks[i] = new ArrayBuffer(100)
      }

      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 500,
        progress: 500,
        url: '',
        receivedChunks: chunks,
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 5,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      retryManager.requestMissingChunks(fileState)

      expect(sendRetryRequestMock).not.toHaveBeenCalled()
    })

    it('should update missing chunks set', () => {
      const chunks = new Array(5)
      chunks[0] = new ArrayBuffer(100)
      // chunks[1-4] missing

      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 500,
        progress: 100,
        url: '',
        receivedChunks: chunks,
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 5,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      retryManager.requestMissingChunks(fileState)

      expect(fileState.missingChunks.size).toBe(4)
      expect(fileState.missingChunks.has(1)).toBe(true)
      expect(fileState.missingChunks.has(2)).toBe(true)
      expect(fileState.missingChunks.has(3)).toBe(true)
      expect(fileState.missingChunks.has(4)).toBe(true)
    })
  })

  describe('checkFileNeedsRetry', () => {
    it('should return false for complete files', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 1000,
        url: '',
        receivedChunks: [],
        isComplete: true,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      const needsRetry = retryManager.checkFileNeedsRetry(fileState)

      expect(needsRetry).toBe(false)
    })

    it('should return false for text transfers', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_TEXT',
        name: 'text',
        size: 100,
        progress: 100,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 1,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      const needsRetry = retryManager.checkFileNeedsRetry(fileState)

      expect(needsRetry).toBe(false)
    })

    it('should return true when progress matches size but chunks are missing', () => {
      const chunks = new Array(10)
      chunks[0] = new ArrayBuffer(100)
      // Other chunks missing

      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 1000,
        url: '',
        receivedChunks: chunks,
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      const needsRetry = retryManager.checkFileNeedsRetry(fileState)

      expect(needsRetry).toBe(true)
    })

    it('should return false when all chunks are received', () => {
      const chunks = new Array(5)
      for (let i = 0; i < 5; i++) {
        chunks[i] = new ArrayBuffer(100)
      }

      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 500,
        progress: 500,
        url: '',
        receivedChunks: chunks,
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 5,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      const needsRetry = retryManager.checkFileNeedsRetry(fileState)

      expect(needsRetry).toBe(false)
    })
  })

  describe('resetFileRetryState', () => {
    it('should reset retry count to zero', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set([1, 2, 3]),
        retryCount: 5,
        lastActivity: Date.now() - 10000,
      }

      retryManager.resetFileRetryState(fileState)

      expect(fileState.retryCount).toBe(0)
    })

    it('should clear missing chunks set', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set([1, 2, 3, 4, 5]),
        retryCount: 5,
        lastActivity: Date.now() - 10000,
      }

      retryManager.resetFileRetryState(fileState)

      expect(fileState.missingChunks.size).toBe(0)
    })

    it('should update last activity time', () => {
      const oldTime = Date.now() - 10000
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 3,
        lastActivity: oldTime,
      }

      retryManager.resetFileRetryState(fileState)

      expect(fileState.lastActivity).toBeGreaterThan(oldTime)
    })
  })

  describe('isMaxRetriesExceeded', () => {
    it('should return true when retry count exceeds maximum', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: TRANSFER_CONFIG.maxRetries,
        lastActivity: Date.now(),
      }

      const isExceeded = retryManager.isMaxRetriesExceeded(fileState)

      expect(isExceeded).toBe(true)
    })

    it('should return true when retry count is greater than maximum', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: TRANSFER_CONFIG.maxRetries + 1,
        lastActivity: Date.now(),
      }

      const isExceeded = retryManager.isMaxRetriesExceeded(fileState)

      expect(isExceeded).toBe(true)
    })

    it('should return false when retry count is below maximum', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: TRANSFER_CONFIG.maxRetries - 1,
        lastActivity: Date.now(),
      }

      const isExceeded = retryManager.isMaxRetriesExceeded(fileState)

      expect(isExceeded).toBe(false)
    })

    it('should return false when retry count is zero', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now(),
      }

      const isExceeded = retryManager.isMaxRetriesExceeded(fileState)

      expect(isExceeded).toBe(false)
    })
  })

  describe('updateFileActivity', () => {
    it('should update last activity time', () => {
      const oldTime = Date.now() - 5000
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: oldTime,
      }

      retryManager.updateFileActivity(fileState)

      expect(fileState.lastActivity).toBeGreaterThan(oldTime)
    })

    it('should update to current time', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 0,
        url: '',
        receivedChunks: [],
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: 0,
      }

      const before = Date.now()
      retryManager.updateFileActivity(fileState)
      const after = Date.now()

      expect(fileState.lastActivity).toBeGreaterThanOrEqual(before)
      expect(fileState.lastActivity).toBeLessThanOrEqual(after)
    })
  })

  describe('destroy', () => {
    it('should stop timeout check', () => {
      retryManager.startTimeoutCheck()
      const initialCount = vi.getTimerCount()

      retryManager.destroy()

      expect(vi.getTimerCount()).toBeLessThan(initialCount)
    })

    it('should not error when called multiple times', () => {
      expect(() => {
        retryManager.destroy()
        retryManager.destroy()
      }).not.toThrow()
    })
  })

  describe('integration scenarios', () => {
    it('should trigger retry for timed out file', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 500,
        url: '',
        receivedChunks: new Array(10),
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now() - TRANSFER_CONFIG.timeoutMs - 1000,
      }
      activeFiles.set('test1', fileState)

      retryManager.startTimeoutCheck()
      vi.advanceTimersByTime(TRANSFER_CONFIG.timeoutCheckInterval)

      expect(sendRetryRequestMock).toHaveBeenCalled()
      expect(fileState.retryCount).toBe(1)
    })

    it('should not retry complete files', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 1000,
        url: '',
        receivedChunks: [],
        isComplete: true,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: 0,
        lastActivity: Date.now() - TRANSFER_CONFIG.timeoutMs - 1000,
      }
      activeFiles.set('test1', fileState)

      retryManager.startTimeoutCheck()
      vi.advanceTimersByTime(TRANSFER_CONFIG.timeoutCheckInterval)

      expect(sendRetryRequestMock).not.toHaveBeenCalled()
    })

    it('should not retry when max retries exceeded', () => {
      const fileState: FileReceiveState = {
        id: 'test1',
        type: 'TRANSFER_TYPE_FILE',
        name: 'test.txt',
        size: 1000,
        progress: 500,
        url: '',
        receivedChunks: new Array(10),
        isComplete: false,
        arrayIndex: 0,
        expectedChunks: 10,
        missingChunks: new Set(),
        retryCount: TRANSFER_CONFIG.maxRetries,
        lastActivity: Date.now() - TRANSFER_CONFIG.timeoutMs - 1000,
      }
      activeFiles.set('test1', fileState)

      retryManager.startTimeoutCheck()
      vi.advanceTimersByTime(TRANSFER_CONFIG.timeoutCheckInterval)

      expect(sendRetryRequestMock).not.toHaveBeenCalled()
    })
  })
})
