import { fireEvent, render, screen } from '@testing-library/react'
import { ToastHost } from '../components/ToastHost'

const tx = {
  deadlock: 'Deadlock',
  readyOffline: 'Ready offline',
  updateAvailable: 'Update available',
  installHint: 'Install hint',
  installFullscreen: 'Install fullscreen',
  reload: 'Reload',
  installAction: 'Install',
}

describe('ToastHost', () => {
  it('renders null without toast', () => {
    const view = render(
      <ToastHost toast={null} tx={tx} onReload={vi.fn()} onInstall={vi.fn()} onDismissInstall={vi.fn()} />,
    )
    expect(view.container.firstChild).toBeNull()
  })

  it('renders update toast and reload action', () => {
    const onReload = vi.fn()
    render(
      <ToastHost
        toast={{ id: 1, type: 'updateAvailable' }}
        tx={tx}
        onReload={onReload}
        onInstall={vi.fn()}
        onDismissInstall={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))
    expect(onReload).toHaveBeenCalled()
  })

  it('renders install toast actions', () => {
    const onInstall = vi.fn()
    const onDismissInstall = vi.fn()
    render(
      <ToastHost
        toast={{ id: 1, type: 'installHint' }}
        tx={tx}
        onReload={vi.fn()}
        onInstall={onInstall}
        onDismissInstall={onDismissInstall}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Install' }))
    fireEvent.click(screen.getByRole('button', { name: '✕' }))
    expect(onInstall).toHaveBeenCalled()
    expect(onDismissInstall).toHaveBeenCalled()
  })

  it('renders default branch messages', () => {
    const { rerender } = render(
      <ToastHost
        toast={{ id: 1, type: 'deadlock' }}
        tx={tx}
        onReload={vi.fn()}
        onInstall={vi.fn()}
        onDismissInstall={vi.fn()}
      />,
    )
    expect(screen.getByText('Deadlock')).toBeTruthy()

    rerender(
      <ToastHost
        toast={{ id: 2, type: 'offlineReady' }}
        tx={tx}
        onReload={vi.fn()}
        onInstall={vi.fn()}
        onDismissInstall={vi.fn()}
      />,
    )
    expect(screen.getByText('Ready offline')).toBeTruthy()

    rerender(
      <ToastHost
        toast={{ id: 3, type: 'fullscreenHint' }}
        tx={tx}
        onReload={vi.fn()}
        onInstall={vi.fn()}
        onDismissInstall={vi.fn()}
      />,
    )
    expect(screen.getByText('Install fullscreen')).toBeTruthy()

    rerender(
      <ToastHost
        toast={{ id: 4, type: 'invalidTarget' }}
        tx={tx}
        onReload={vi.fn()}
        onInstall={vi.fn()}
        onDismissInstall={vi.fn()}
      />,
    )
    expect(screen.getByText('Deadlock')).toBeTruthy()
  })
})
