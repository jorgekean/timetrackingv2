import { ITimezone } from "react-timezone-select"

export interface SettingModel {
  id?: string
  type: "timezone" | "copytimesheet" | "decimalmark" | "worklocation"
  value: string | boolean | number | undefined | Date | ITimezone
}
