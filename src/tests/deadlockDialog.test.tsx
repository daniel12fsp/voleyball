import { fireEvent, render, screen } from '@testing-library/react'
import { DeadlockDialog } from '../components/DeadlockDialog'

describe('DeadlockDialog', () => {
  it('renders message and triggers new set callback', () => {
    const onNewSet = vi.fn()
    render(<DeadlockDialog message="No winner" newSetLabel="New set" onNewSet={onNewSet} />)

    expect(screen.getByText('No winner')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'New set' }))
    expect(onNewSet).toHaveBeenCalled()
  })
})
