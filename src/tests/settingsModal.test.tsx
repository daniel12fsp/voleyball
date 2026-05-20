import { fireEvent, render, screen } from '@testing-library/react'
import { SettingsModal } from '../components/SettingsModal'
import { initialState } from '../app/state'

const tx = {
  settings: 'Settings',
  targetPoints: 'Target points',
  language: 'Language',
  fullscreen: 'Fullscreen',
  reset: 'Reset',
  resetConfirm: 'Are you sure?',
  confirm: 'Yes',
  cancel: 'Cancel',
  installAction: 'Install',
}

describe('SettingsModal', () => {
  it('returns null when closed', () => {
    const dispatch = vi.fn()
    const view = render(
      <SettingsModal state={initialState('pt')} dispatch={dispatch} tx={tx} onToggleFullscreen={vi.fn()} onInstall={vi.fn()} />,
    )
    expect(view.container.firstChild).toBeNull()
  })

  it('dispatches actions and handles reset confirmation flow', () => {
    const dispatch = vi.fn()
    const onToggleFullscreen = vi.fn()
    const open = { ...initialState('pt'), settingsOpen: true, target: 12, lang: 'pt' as const }

    const { rerender } = render(
      <SettingsModal state={open} dispatch={dispatch} tx={tx} onToggleFullscreen={onToggleFullscreen} onInstall={vi.fn()} />,
    )

    const section = screen.getByText('Settings').closest('section')!
    fireEvent.pointerDown(section)
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'CLOSE_SETTINGS' })

    fireEvent.pointerDown(section.parentElement!)
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_SETTINGS' })

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '15' } })
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TARGET', value: 15 })

    fireEvent.click(screen.getByRole('button', { name: 'PT' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_LANG', value: 'en' })

    fireEvent.click(screen.getByRole('button', { name: 'OFF' }))
    expect(onToggleFullscreen).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN_RESET_CONFIRM' })

    rerender(
      <SettingsModal
        state={{ ...open, resetConfirmOpen: true }}
        dispatch={dispatch}
        tx={tx}
        onToggleFullscreen={onToggleFullscreen}
        onInstall={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_SET' })

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'DISMISS_RESET_CONFIRM' })

    fireEvent.click(screen.getByRole('button', { name: '✕' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_SETTINGS' })
  })
})
