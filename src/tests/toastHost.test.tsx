import { fireEvent, render, screen } from '@testing-library/react'
import { ToastHost } from '../components/ToastHost'

describe('ToastHost', () => {
  it('renders null without toast', () => {
    const view = render(
      <ToastHost toast={null} message="" onDismiss={vi.fn()} />,
    )
    expect(view.container.firstChild).toBeNull()
  })

  it('renders message', () => {
    render(
      <ToastHost toast={{ id: 1, type: 'deadlock' }} message="My toast" onDismiss={vi.fn()} />,
    )
    expect(screen.getByText('My toast')).toBeTruthy()
  })

  it('triggers onDismiss on dismiss button click', () => {
    const onDismiss = vi.fn()
    render(
      <ToastHost toast={{ id: 1, type: 'deadlock' }} message="Dismiss me" onDismiss={onDismiss} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('renders action buttons and triggers onClick', () => {
    const onAction = vi.fn()
    const onDismiss = vi.fn()
    render(
      <ToastHost
        toast={{ id: 1, type: 'updateAvailable' }}
        message="Update"
        actions={[{ label: 'Reload', onClick: onAction }]}
        onDismiss={onDismiss}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))
    expect(onAction).toHaveBeenCalledOnce()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('renders multiple action buttons', () => {
    render(
      <ToastHost
        toast={{ id: 1, type: 'installHint' }}
        message="Install"
        actions={[
          { label: 'Install', onClick: vi.fn() },
          { label: 'Later', onClick: vi.fn() },
        ]}
        onDismiss={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Install' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Later' })).toBeTruthy()
  })
})
