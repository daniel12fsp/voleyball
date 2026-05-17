import { addPoint, atCap, canWinNextPoint, checkWinner, clampTarget, getWinner, isDeadlock } from '../app/engine'

describe('engine rules', () => {
  it('clamps target', () => {
    expect(clampTarget(2)).toBe(3)
    expect(clampTarget(50)).toBe(50)
    expect(clampTarget(200)).toBe(99)
    expect(clampTarget(Number.NaN)).toBe(3)
  })

  it('checks winner by target and lead', () => {
    expect(checkWinner(12, 10, 12)).toBe(true)
    expect(checkWinner(12, 11, 12)).toBe(false)
    expect(checkWinner(11, 8, 12)).toBe(false)
  })

  it('returns winner team or null', () => {
    expect(getWinner({ red: 12, blue: 9 }, 12)).toBe('red')
    expect(getWinner({ red: 11, blue: 13 }, 12)).toBe('blue')
    expect(getWinner({ red: 12, blue: 11 }, 12)).toBeNull()
  })

  it('set point only when legal next point win', () => {
    expect(canWinNextPoint(11, 10, 12)).toBe(true)
    expect(canWinNextPoint(11, 11, 12)).toBe(false)
    expect(canWinNextPoint(99, 97, 12)).toBe(false)
  })

  it('detects deadlock and score caps', () => {
    expect(isDeadlock({ red: 99, blue: 99 })).toBe(true)
    expect(isDeadlock({ red: 99, blue: 98 })).toBe(false)
    expect(atCap(99)).toBe(true)
    expect(atCap(98)).toBe(false)
  })

  it('adds points with max score cap', () => {
    expect(addPoint({ red: 0, blue: 0 }, 'red')).toEqual({ red: 1, blue: 0 })
    expect(addPoint({ red: 99, blue: 5 }, 'red')).toEqual({ red: 99, blue: 5 })
    expect(addPoint({ red: 5, blue: 99 }, 'blue')).toEqual({ red: 5, blue: 99 })
  })
})
