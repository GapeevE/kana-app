export type Quality = 0 | 2 | 3 | 4 | 5

export interface CardState {
  easeFactor: number
  interval: number
  repetitions: number
  dueDate: string
}
