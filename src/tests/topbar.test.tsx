import { fireEvent, render, screen } from '@testing-library/react'

import { TopBar } from '../components/TopBar'

describe('TopBar', () => {
  it('renders target text and dispatches settings toggle', () => {
    const dispatch = vi.fn()
    render(<TopBar dispatch={dispatch} setToText="SET TO 12" settingsLabel="Settings" />)

    expect(screen.getByText('SET TO 12')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_SETTINGS' })
  })
})
