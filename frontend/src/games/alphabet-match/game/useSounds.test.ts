import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSounds } from './useSounds'

const mockSpeak = vi.fn()
const mockCancel = vi.fn()

beforeEach(() => {
  mockSpeak.mockClear()
  mockCancel.mockClear()

  // Mock SpeechSynthesisUtterance
  global.SpeechSynthesisUtterance = class {
    text: string = ''
    lang: string = ''

    constructor(text: string) {
      this.text = text
    }
  } as any

  vi.stubGlobal('speechSynthesis', {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: () => [{ lang: 'pt-BR', name: 'Portuguese Brazil' }],
    addEventListener: () => {},
  })
})

describe('useSounds — speakAnimalName', () => {
  it('cancela fala anterior e fala só o label quando letter não é fornecida', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalName('Abelha') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Abelha')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('fala a frase de sucesso quando letter é fornecida', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalName('Elefante', 'E') })

    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Isso mesmo! Elefante, com a letra E!')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakAnimalName('Abelha') })
    }).not.toThrow()
  })
})

describe('useSounds — speakAnimalError', () => {
  it('fala a frase de erro com artigo masculino', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalError('Cachorro', 'M') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Esse é o Cachorro!')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('fala a frase de erro com artigo feminino', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalError('Onça', 'F') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Essa é a Onça!')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakAnimalError('Onça', 'F') })
    }).not.toThrow()
  })
})

describe('useSounds — speakRoundIntro', () => {
  it('fala a frase de introdução com a letra da rodada', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakRoundIntro('B') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Qual animal começa com a letra B?')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakRoundIntro('A') })
    }).not.toThrow()
  })
})

describe('useSounds — speakLetter', () => {
  it('fala apenas o nome da letra', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakLetter('C') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Letra C')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakLetter('A') })
    }).not.toThrow()
  })
})
