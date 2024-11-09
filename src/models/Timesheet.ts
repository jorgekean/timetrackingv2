export interface TimesheetData {
  id?: string
  client: { client: string; taskCode: string; projectCode: string } | undefined
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
