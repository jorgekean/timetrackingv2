import { BillingManagerModel } from "./BillingManager"

export interface TimesheetData {
  id?: string
  client: BillingManagerModel | null
  taskDescription: string
  timesheetDate: Date
  duration?: number
  running: boolean
  createdDate: Date
  workLocation: string

  clientStr?: string
  pausedTime?: Date | undefined
  accumulatedPauseTime?: number
  durationStr?: string
}
