export type Team = 'red' | 'blue'

export const MIN_TARGET = 3
export const MAX_SCORE = 99

export interface Score {
  red: number
  blue: number
}

export const clampTarget = (value: number): number =>
  Math.max(MIN_TARGET, Math.min(MAX_SCORE, Number.isFinite(value) ? Math.trunc(value) : MIN_TARGET))

export const hasLeadByTwo = (score: number, other: number): boolean => score - other >= 2

export const checkWinner = (score: number, other: number, target: number): boolean =>
  score >= target && hasLeadByTwo(score, other)

export const getWinner = (scores: Score, target: number): Team | null => {
  if (checkWinner(scores.red, scores.blue, target)) return 'red'
  if (checkWinner(scores.blue, scores.red, target)) return 'blue'
  return null
}

export const canWinNextPoint = (score: number, other: number, target: number): boolean =>
  score < MAX_SCORE && checkWinner(score + 1, other, target)

export const isDeadlock = (scores: Score): boolean => scores.red === MAX_SCORE && scores.blue === MAX_SCORE

export const atCap = (teamScore: number): boolean => teamScore >= MAX_SCORE

export const addPoint = (scores: Score, team: Team): Score => {
  if (team === 'red') return { red: Math.min(MAX_SCORE, scores.red + 1), blue: scores.blue }
  return { red: scores.red, blue: Math.min(MAX_SCORE, scores.blue + 1) }
}
