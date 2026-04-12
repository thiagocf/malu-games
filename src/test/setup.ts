import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

const mockOscillator = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  type: 'sine' as OscillatorType,
  frequency: {
    setValueAtTime: vi.fn(),
  },
}

const mockGainNode = {
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
}

const mockContext = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGainNode),
  destination: {},
  currentTime: 0,
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn(() => mockContext),
})

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: vi.fn(() => mockContext),
})
