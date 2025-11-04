import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock Socket.io
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  disconnect: vi.fn(),
}

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}))

// Mock RTCPeerConnection
class MockRTCPeerConnection {
  localDescription: RTCSessionDescriptionInit | null = null
  remoteDescription: RTCSessionDescriptionInit | null = null
  onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null = null

  createOffer = vi.fn().mockResolvedValue({
    type: 'offer',
    sdp: 'mock-offer-sdp',
  })

  createAnswer = vi.fn().mockResolvedValue({
    type: 'answer',
    sdp: 'mock-answer-sdp',
  })

  setLocalDescription = vi
    .fn()
    .mockImplementation((desc: RTCSessionDescriptionInit) => {
      this.localDescription = desc
      return Promise.resolve()
    })

  setRemoteDescription = vi
    .fn()
    .mockImplementation((desc: RTCSessionDescriptionInit) => {
      this.remoteDescription = desc
      return Promise.resolve()
    })

  addIceCandidate = vi.fn().mockResolvedValue(undefined)

  close = vi.fn()

  createDataChannel = vi.fn((label: string) => ({
    label,
    readyState: 'connecting',
    bufferedAmountLowThreshold: 0,
    onopen: null,
    onerror: null,
    onclose: null,
    send: vi.fn(),
    close: vi.fn(),
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).RTCPeerConnection = MockRTCPeerConnection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).RTCSessionDescription = class RTCSessionDescription {
  type: string
  sdp: string
  constructor(init: RTCSessionDescriptionInit) {
    this.type = init.type!
    this.sdp = init.sdp!
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).RTCIceCandidate = class RTCIceCandidate {
  candidate: string
  constructor(init: RTCIceCandidateInit) {
    this.candidate = init.candidate!
  }
}

describe('WebRTC Connection Workflow', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let useConnectStore: any

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks()
    mockSocket.on.mockClear()
    mockSocket.emit.mockClear()

    // Create fresh pinia instance
    setActivePinia(createPinia())

    // Dynamically import the store after mocks are set up
    const module = await import('../src/stores/connect')
    useConnectStore = module.useConnectStore
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Connection Initialization', () => {
    it('should initialize peer connection with ICE servers', () => {
      const store = useConnectStore()
      store.initializeConnection()

      expect(store.peerConnection).not.toBeNull()
      expect(store.sendChannels.length).toBeGreaterThan(0)
    })

    it('should create socket connection to signal server', () => {
      const store = useConnectStore()

      // Clear previous calls
      vi.clearAllMocks()

      store.initializeConnection()

      // Check that a socket connection was attempted by verifying event handlers were set up
      expect(mockSocket.on).toHaveBeenCalled()
    })

    it('should register socket event handlers', () => {
      const store = useConnectStore()
      store.initializeConnection()

      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(
        'success',
        expect.any(Function),
      )
      expect(mockSocket.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function),
      )
      expect(mockSocket.on).toHaveBeenCalledWith('offer', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('answer', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(
        'candidate',
        expect.any(Function),
      )
    })

    it('should create multiple data channels based on max connection number', () => {
      const store = useConnectStore()
      store.initializeConnection()

      expect(store.peerConnection!.createDataChannel).toHaveBeenCalled()
      expect(store.sendChannels.length).toBeGreaterThan(0)
    })
  })

  describe('Client Registration', () => {
    it('should emit register event with max connection number', () => {
      const store = useConnectStore()
      store.initializeConnection()

      store.registerClient()

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'register',
        expect.any(Number),
      )
    })

    it('should update client ID when registration succeeds', () => {
      const store = useConnectStore()
      store.initializeConnection()

      // Simulate successful registration
      const successHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'success',
      )?.[1]

      expect(successHandler).toBeDefined()
      successHandler?.('TEST123')

      expect(store.clientId).toBe('TEST123')
      expect(store.registered).toBe(true)
    })

    it('should handle registration errors', () => {
      const store = useConnectStore()
      store.initializeConnection()

      const errorHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'error',
      )?.[1]

      expect(errorHandler).toBeDefined()

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      errorHandler?.('Connection failed')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Connection failed'),
      )
      expect(store.isConnecting).toBe(false)
      expect(store.isConnectSuccess).toBe(false)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Offer/Answer Exchange', () => {
    it('should create and send offer when connecting to target', async () => {
      const store = useConnectStore()
      store.initializeConnection()
      store.targetId = 'TARGET123'
      store.clientId = 'CLIENT456'

      // Clear mocks after initialization
      vi.clearAllMocks()

      await store.connectTarget()

      // Wait for promises to resolve
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(store.peerConnection!.createOffer).toHaveBeenCalled()
      expect(store.peerConnection!.setLocalDescription).toHaveBeenCalled()
    })

    it('should set isConnecting when creating offer', async () => {
      const store = useConnectStore()
      store.initializeConnection()
      store.targetId = 'TARGET123'

      await store.connectTarget()

      expect(store.isConnecting).toBe(true)
    })

    it('should handle incoming offer and create answer', async () => {
      const store = useConnectStore()
      store.initializeConnection()
      store.clientId = 'CLIENT456'

      const offerHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'offer',
      )?.[1]

      expect(offerHandler).toBeDefined()

      const mockOffer = {
        type: 'offer',
        sdp: 'mock-offer-sdp',
      }

      // Clear mocks before testing the handler
      vi.clearAllMocks()

      await offerHandler?.(mockOffer, 'TARGET123', 5)

      // Wait for all promises to resolve
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(store.targetId).toBe('TARGET123')
      expect(store.isConnecting).toBe(true)
      expect(store.peerConnection!.setRemoteDescription).toHaveBeenCalled()
      expect(store.peerConnection!.createAnswer).toHaveBeenCalled()
    })

    it('should handle incoming answer', async () => {
      const store = useConnectStore()
      store.initializeConnection()
      store.targetId = 'TARGET123'

      const answerHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'answer',
      )?.[1]

      expect(answerHandler).toBeDefined()

      const mockAnswer = {
        type: 'answer',
        sdp: 'mock-answer-sdp',
      }

      await answerHandler?.(mockAnswer, 'TARGET123')

      expect(store.peerConnection!.setRemoteDescription).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'answer' }),
      )
    })

    it('should reject answer from unexpected peer', async () => {
      const store = useConnectStore()
      store.initializeConnection()
      store.targetId = 'TARGET123'

      const answerHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'answer',
      )?.[1]

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const mockAnswer = {
        type: 'answer',
        sdp: 'mock-answer-sdp',
      }

      await answerHandler?.(mockAnswer, 'WRONG_ID')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('unexpected id'),
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('ICE Candidate Handling', () => {
    it('should send ICE candidates to peer', async () => {
      const store = useConnectStore()
      store.initializeConnection()
      store.targetId = 'TARGET123'
      store.clientId = 'CLIENT456'

      // The onicecandidate handler is set up during connectTarget
      await store.connectTarget()

      // Wait for setup
      await new Promise(resolve => setTimeout(resolve, 10))

      // Clear mocks after setup
      vi.clearAllMocks()

      // Trigger ICE candidate
      const mockCandidate = {
        candidate: 'mock-candidate',
        sdpMLineIndex: 0,
      }

      // The onicecandidate handler should now be set
      const onicecandidate = store.peerConnection!.onicecandidate
      expect(onicecandidate).toBeDefined()

      if (onicecandidate) {
        onicecandidate({
          candidate: mockCandidate,
        } as RTCPeerConnectionIceEvent)
      }

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'candidate',
        mockCandidate,
        'TARGET123',
      )
    })

    it('should queue ICE candidates received before remote description', () => {
      const store = useConnectStore()
      store.initializeConnection()

      const candidateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'candidate',
      )?.[1]

      expect(candidateHandler).toBeDefined()

      const mockCandidate = {
        candidate: 'mock-candidate',
        sdpMLineIndex: 0,
      }

      // Remote description not set yet
      store.peerConnection!.remoteDescription = null
      candidateHandler?.(mockCandidate)

      // Candidate should be queued, not added yet
      expect(store.peerConnection!.addIceCandidate).not.toHaveBeenCalled()
    })

    it('should add ICE candidates after remote description is set', () => {
      const store = useConnectStore()
      store.initializeConnection()

      const candidateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'candidate',
      )?.[1]

      const mockCandidate = {
        candidate: 'mock-candidate',
        sdpMLineIndex: 0,
      }

      // Set remote description first
      store.peerConnection!.remoteDescription = {
        type: 'offer',
        sdp: 'mock-sdp',
      }

      candidateHandler?.(mockCandidate)

      expect(store.peerConnection!.addIceCandidate).toHaveBeenCalledWith(
        expect.objectContaining({ candidate: 'mock-candidate' }),
      )
    })
  })

  describe('Data Channel State Management', () => {
    it('should return "open" when all channels are open', () => {
      const store = useConnectStore()
      store.initializeConnection()

      // Mock all channels as open
      store.sendChannels.forEach((channel: RTCDataChannel) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(channel as any).readyState = 'open'
      })

      expect(store.getSendChannelState()).toBe('open')
    })

    it('should return "pending" when any channel is not open', () => {
      const store = useConnectStore()
      store.initializeConnection()

      // Mock some channels as connecting
      store.sendChannels.forEach((channel: RTCDataChannel, index: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(channel as any).readyState = index === 0 ? 'connecting' : 'open'
      })

      expect(store.getSendChannelState()).toBe('pending')
    })

    it('should set isConnectSuccess when channel opens', () => {
      const store = useConnectStore()
      store.initializeConnection()

      const channel = store.sendChannels[0]

      // Simulate channel opening
      channel.onopen?.()

      expect(store.isConnecting).toBe(false)
      expect(store.isConnectSuccess).toBe(true)
    })

    it('should handle channel errors', () => {
      const store = useConnectStore()
      store.initializeConnection()

      const channel = store.sendChannels[0]
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      // Simulate channel error
      channel.onerror?.(new Error('Connection failed'))

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(store.isConnecting).toBe(false)
      expect(store.isConnectSuccess).toBe(false)

      consoleErrorSpy.mockRestore()
    })

    it('should handle channel closure', () => {
      const store = useConnectStore()
      store.initializeConnection()

      const channel = store.sendChannels[0]

      // Simulate channel close
      channel.onclose?.()

      expect(store.isConnecting).toBe(false)
      expect(store.isConnectSuccess).toBe(false)
    })
  })

  describe('Connection Lifecycle', () => {
    it('should initialize with correct default states', () => {
      const store = useConnectStore()

      expect(store.registered).toBe(false)
      expect(store.isConnectSuccess).toBe(false)
      expect(store.isConnecting).toBe(false)
      expect(store.clientId).toBe('LOADING')
      expect(store.targetId).toBe('')
    })

    it('should transition through connecting states', async () => {
      const store = useConnectStore()
      store.initializeConnection()
      store.targetId = 'TARGET123'

      expect(store.isConnecting).toBe(false)

      await store.connectTarget()

      expect(store.isConnecting).toBe(true)
    })

    it('should set buffered amount threshold for channels', () => {
      const store = useConnectStore()
      store.initializeConnection()

      store.sendChannels.forEach(channel => {
        expect(channel.bufferedAmountLowThreshold).toBeDefined()
        expect(channel.bufferedAmountLowThreshold).toBe(store.maxBufferedAmount)
      })
    })

    it('should handle disconnect event', () => {
      const store = useConnectStore()
      store.initializeConnection()
      store.registered = true

      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect',
      )?.[1]

      // Mock window.location.reload
      const reloadMock = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      })

      disconnectHandler?.()

      expect(store.registered).toBe(false)
      expect(reloadMock).toHaveBeenCalled()
    })
  })

  describe('Data Channel Configuration', () => {
    it('should create channels with ordered delivery', () => {
      const store = useConnectStore()
      store.initializeConnection()

      expect(store.peerConnection!.createDataChannel).toHaveBeenCalledWith(
        expect.stringContaining('fileTransfer'),
        expect.objectContaining({
          ordered: true,
        }),
      )
    })

    it('should configure max retransmits for channels', () => {
      const store = useConnectStore()
      store.initializeConnection()

      expect(store.peerConnection!.createDataChannel).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          maxRetransmits: expect.any(Number),
        }),
      )
    })

    it('should create uniquely labeled channels', () => {
      const store = useConnectStore()
      store.initializeConnection()

      const labels = store.sendChannels.map(
        (channel: RTCDataChannel) => channel.label,
      )
      const uniqueLabels = new Set(labels)

      expect(labels.length).toBe(uniqueLabels.size)
    })
  })
})
