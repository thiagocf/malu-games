import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoundScreen } from './RoundScreen'
import styles from './RoundScreen.module.css'
import type { Animal, Round } from '../game/types'

const makeAnimal = (id: string, label: string): Animal => ({
  id,
  label,
  imagePath: `/fake/${id}.jpeg`,
  firstLetter: label.charAt(0),
  gender: 'M',
})

const correctAnimal = makeAnimal('abelha', 'Abelha')
const distractors = [
  makeAnimal('baleia', 'Baleia'),
  makeAnimal('cachorro', 'Cachorro'),
  makeAnimal('dinossauro', 'Dinossauro'),
]

const round: Round = {
  letter: 'A',
  correctAnimal,
  options: [correctAnimal, ...distractors],
  attempts: 0,
  completed: false,
}

const defaultProps = {
  round,
  selectedAnimalId: null,
  blockedIds: [] as string[],
  onPreview: () => {},
  onConfirm: () => {},
  onLetterTap: () => {},
}

describe('RoundScreen', () => {
  it('renderiza todas as opções com imagens acessíveis', () => {
    render(<RoundScreen {...defaultProps} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(screen.getByAltText('Abelha')).toBeInTheDocument()
    expect(screen.getByAltText('Baleia')).toBeInTheDocument()
  })

  it('impede drag nativo nas imagens', () => {
    render(<RoundScreen {...defaultProps} />)
    for (const img of screen.getAllByRole('img')) {
      expect(img).toHaveAttribute('draggable', 'false')
    }
  })

  it('chama onPreview com o id do animal ao clicar uma opção', () => {
    const onPreview = vi.fn()
    render(<RoundScreen {...defaultProps} onPreview={onPreview} />)
    fireEvent.click(screen.getByAltText('Abelha').closest('button')!)
    expect(onPreview).toHaveBeenCalledWith('abelha')
  })

  it('não exibe botão de confirmar quando nenhum animal está selecionado', () => {
    render(<RoundScreen {...defaultProps} selectedAnimalId={null} />)
    expect(screen.queryByRole('button', { name: /é esse/i })).toBeNull()
  })

  it('exibe botão de confirmar quando um animal está selecionado', () => {
    render(<RoundScreen {...defaultProps} selectedAnimalId="abelha" />)
    expect(screen.getByRole('button', { name: /é esse/i })).toBeInTheDocument()
  })

  it('chama onConfirm ao clicar no botão de confirmar', () => {
    const onConfirm = vi.fn()
    render(<RoundScreen {...defaultProps} selectedAnimalId="abelha" onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: /é esse/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('aplica classe selected na carta selecionada', () => {
    render(<RoundScreen {...defaultProps} selectedAnimalId="abelha" />)
    const selectedButton = screen.getByAltText('Abelha').closest('button')!
    expect(selectedButton.className).toContain(styles.selected)
  })

  it('não aplica classe selected em cartas não selecionadas', () => {
    render(<RoundScreen {...defaultProps} selectedAnimalId="abelha" />)
    const otherButton = screen.getByAltText('Baleia').closest('button')!
    expect(otherButton.className).not.toContain(styles.selected)
  })

  it('desabilita e aplica classe blocked nas opções bloqueadas', () => {
    render(<RoundScreen {...defaultProps} blockedIds={['baleia']} />)
    const blockedButton = screen.getByAltText('Baleia').closest('button')!
    expect(blockedButton).toBeDisabled()
    expect(blockedButton.className).toContain(styles.blocked)
  })

  it('não desabilita opções não bloqueadas', () => {
    render(<RoundScreen {...defaultProps} blockedIds={['baleia']} />)
    const freeButton = screen.getByAltText('Abelha').closest('button')!
    expect(freeButton).not.toBeDisabled()
  })

  it('chama onLetterTap ao clicar no card da letra', () => {
    const onLetterTap = vi.fn()
    render(<RoundScreen {...defaultProps} onLetterTap={onLetterTap} />)
    fireEvent.click(screen.getByRole('button', { name: /letra a/i }))
    expect(onLetterTap).toHaveBeenCalledTimes(1)
  })
})
