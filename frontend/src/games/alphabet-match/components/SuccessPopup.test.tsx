import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SuccessPopup } from './SuccessPopup'
import type { Animal } from '../game/types'

const animal: Animal = {
  id: 'elefante',
  label: 'Elefante',
  imagePath: '/fake/elefante.jpeg',
  firstLetter: 'E',
  gender: 'M',
}

describe('SuccessPopup', () => {
  it('renderiza a imagem do animal correto', () => {
    render(<SuccessPopup animal={animal} letter="E" messageIndex={0} onNext={() => {}} />)
    expect(screen.getByAltText('Elefante')).toBeInTheDocument()
  })

  it('exibe a letra destacada no texto', () => {
    // Fixture usa "Elefante" + letter="E" intencionalmente: ambos os spans ficam com "E",
    // permitindo assertar que tanto a primeira letra do nome quanto a letra da rodada são destacadas.
    render(<SuccessPopup animal={animal} letter="E" messageIndex={0} onNext={() => {}} />)
    const spans = screen.getAllByText('E', { selector: 'span' })
    expect(spans.length).toBe(2)
  })

  it('renderiza a frase de sucesso escolhida', () => {
    render(<SuccessPopup animal={animal} letter="E" messageIndex={1} onNext={() => {}} />)
    expect(screen.getByText(/Muito bem!/i)).toBeInTheDocument()
    expect(screen.getByText(/começa com/i)).toBeInTheDocument()
  })

  it('chama onNext ao clicar no botão Próximo', () => {
    const onNext = vi.fn()
    render(<SuccessPopup animal={animal} letter="E" messageIndex={0} onNext={onNext} />)
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('impede drag nativo na imagem', () => {
    render(<SuccessPopup animal={animal} letter="E" messageIndex={0} onNext={() => {}} />)
    expect(screen.getByAltText('Elefante')).toHaveAttribute('draggable', 'false')
  })
})
