import React from "react"
import { useGlobalContext } from "../../context/GlobalContext";
import { TimesheetData } from "../../models/Timesheet"
import DexieUtils from "../../utils/dexie-utils"
import { v4 as uuidv4 } from "uuid"

export const TimesheetService = () => {
    const {
        timesheetDate,
        timesheets,
        setTimesheets,
        runningTimesheet,
        setRunningTimesheet,
    } = useGlobalContext()

    const db = DexieUtils<TimesheetData>({
        tableName: "timesheet",
    })

    const updateTimesheet = async (ts: TimesheetData) => {
        await db.update(ts)

        setTimesheets(await getTimesheetsOfTheDay())
    }
    const getTimesheetsOfTheDay = async () => {
        const selectedTimesheetDate = timesheetDate.setHours(0, 0, 0, 0)
        const currentDate = new Date().setHours(0, 0, 0, 0)
        const timesheetsOfToday = (await db.getAll())
            .map((timesheet) => {
                // Update the running property to false if the date is in the past
                if (
                    timesheet.running &&
                    timesheet.timesheetDate.setHours(0, 0, 0, 0) < currentDate
                ) {
                    timesheet.running = false
                    db.update(timesheet)
                }
                return timesheet
            })
            .filter(
                (f) => f.timesheetDate.setHours(0, 0, 0, 0) === selectedTimesheetDate
            )
            .sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime())

        return timesheetsOfToday
    }

    const getTimesheetsToUpload = async (from: Date, to: Date) => {
        const fromDate = new Date(from).setHours(0, 0, 0, 0)
        const toDate = new Date(to).setHours(23, 59, 59, 999) // End of the 'to' date

        const timesheetsInRange = (await db.getAll()).filter((f) => {
            const timesheetDate = new Date(f.timesheetDate).getTime()
            return timesheetDate >= fromDate && timesheetDate <= toDate
        })

        const dayMapping = [
            "sunHours",
            "monHours",
            "tueHours",
            "wedHours",
            "thuHours",
            "friHours",
            "satHours",
        ]

        const toUpload = timesheetsInRange.reduce((acc: any[], ts) => {
            if (!ts.client) return acc

            const dayIndex = new Date(ts.timesheetDate).getDay() // 0: Sunday, 6: Saturday
            const hours = convertBillingHours(ts.duration ?? 0) // Use conversion function

            let entry = acc.find(
                (item) =>
                    item.projectCode === ts.client!.projectCode &&
                    item.taskCode === ts.client!.taskCode &&
                    item.workLoc === ts.workLocation
            )

            if (!entry) {
                entry = {
                    id: uuidv4(),
                    client: ts.client.client,
                    projectCode: ts.client.projectCode,
                    taskCode: ts.client.taskCode,
                    taskDescription: ts.taskDescription,
                    sunHours: 0,
                    monHours: 0,
                    tueHours: 0,
                    wedHours: 0,
                    thuHours: 0,
                    friHours: 0,
                    satHours: 0,
                    workLoc: ts.workLocation,
                }
                acc.push(entry)
            }

            entry[dayMapping[dayIndex]] += hours

            return acc
        }, [])

        return toUpload
    }

    const setRunningToFalse = async (id: string) => {
        const timesheetsOfToday = await getTimesheetsOfTheDay()
        setTimesheets(timesheetsOfToday)

        timesheets.forEach(async (ts) => {
            if (ts.running && ts.id !== id) {
                ts.running = false
                // ts.pausedTime = new Date()
                await db.update(ts)
            }
        })

        // setTimesheets(timesheets)

        const timesheetsOfTodayRefresh = await getTimesheetsOfTheDay()
        setTimesheets(timesheetsOfTodayRefresh)
    }

    const getPrevRunningTimer = async (
        id: string
    ): Promise<TimesheetData | null> => {
        const timesheetsOfToday = await getTimesheetsOfTheDay()
        setTimesheets(timesheetsOfToday)

        let result = null
        timesheets.forEach(async (ts) => {
            if (ts.running && ts.id !== id) {
                result = ts
                return
            }
        })

        return result
    }

    const formatDuration = (duration: number): string => {
        const hours = Math.floor(duration / 3600)
        const minutes = Math.floor((duration % 3600) / 60)
        const seconds = Math.floor((duration % 60) / 1)

        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // utilitites
    function convertBillingHours(duration: number) {
        try {
            const totalHours = Math.floor(duration / 3600) // Total hours from the duration
            const totalSeconds = duration % 3600 // Remaining seconds after extracting hours

            let remainderInMinutes = 0

            // 1 min - 6 mins and 59 secs
            if (totalSeconds >= 60 && totalSeconds <= 419) {
                remainderInMinutes = 0.1
            }
            // 7 mins - 12 mins and 59 secs
            else if (totalSeconds >= 420 && totalSeconds <= 779) {
                remainderInMinutes = 0.2
            }
            // 13 mins - 18 mins and 59 secs
            else if (totalSeconds >= 780 && totalSeconds <= 1139) {
                remainderInMinutes = 0.3
            }
            // 19 mins - 24 mins and 59 secs
            else if (totalSeconds >= 1140 && totalSeconds <= 1499) {
                remainderInMinutes = 0.4
            }
            // 25 mins - 30 mins and 59 secs
            else if (totalSeconds >= 1500 && totalSeconds <= 1859) {
                remainderInMinutes = 0.5
            }
            // 31 mins - 36 mins and 59 secs
            else if (totalSeconds >= 1860 && totalSeconds <= 2219) {
                remainderInMinutes = 0.6
            }
            // 37 mins - 42 mins and 59 secs
            else if (totalSeconds >= 2220 && totalSeconds <= 2579) {
                remainderInMinutes = 0.7
            }
            // 43 mins - 48 mins and 59 secs
            else if (totalSeconds >= 2580 && totalSeconds <= 2939) {
                remainderInMinutes = 0.8
            }
            // 49 mins - 54 mins and 59 secs
            else if (totalSeconds >= 2940 && totalSeconds <= 3299) {
                remainderInMinutes = 0.9
            }
            // 55 mins - 59 mins and 59 secs
            else if (totalSeconds >= 3300 && totalSeconds <= 3599) {
                remainderInMinutes = 1
            }

            return totalHours + remainderInMinutes
        } catch (e) {
            console.log("Error in convertBillingHours", e)
            return 0
        }
    }

    const isValidTimeFormat = (value: string) => {
        // Matches HH:mm:ss format where HH is 00-23, mm and ss are 00-59
        const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/
        return timeRegex.test(value)
    }

    const timeToSeconds = (time: string) => {
        const [hh, mm, ss] = time.split(":").map(Number)
        return hh * 3600 + mm * 60 + ss
    }

    const secondsToTime = (seconds: number) => {
        const hh = String(Math.floor(seconds / 3600)).padStart(2, "0")
        const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
        const ss = String(seconds % 60).padStart(2, "0")
        return `${hh}:${mm}:${ss}`
    }

    const parseShorthandTime = (input: string): string => {
        // Allow inputs like "1h", "2m", etc.
        const shorthandRegex = /^(\d+)([hHmM])$/
        const match = input.match(shorthandRegex)

        if (match) {
            const number = parseInt(match[1])
            const unit = match[2].toLowerCase()

            let totalSeconds = 0
            if (unit === "h") {
                totalSeconds = number * 3600 // Convert hours to seconds
            } else if (unit === "m") {
                totalSeconds = number * 60 // Convert minutes to seconds
            }
            return secondsToTime(totalSeconds)
        }

        return input // If not shorthand, return the original input
    }

    const processPrevRunningTimesheet = async () => {
        const timesheetsInDB = await getTimesheetsOfTheDay()
        const prevRunningTS = timesheetsInDB.find(x => x.running);
        let prevRunningDuration = 0;
        if (prevRunningTS) {
            prevRunningDuration = prevRunningTS.duration!// prev running duration when click on other timer
        }

        // calculate duration of prev running timesheet, based on fuse-startTime before it resets     
        const currentTime = new Date()
        const prevStartTime = localStorage.getItem("fuse-startTime") ? new Date(JSON.parse(localStorage.getItem("fuse-startTime")!)) : null
        if (currentTime instanceof Date && prevStartTime instanceof Date) {
            const elapsedTime = currentTime.getTime() - prevStartTime.getTime()

            prevRunningDuration = prevRunningDuration! + Math.floor(elapsedTime / 1000)
        }
        // update prev running timesheet if any - set running false and refresh state    
        if (prevRunningTS) {
            await updateTimesheet({ ...prevRunningTS, duration: prevRunningDuration, running: false })
            // setTimesheets(await getTimesheetsOfTheDay())
        }
    }

    return {
        getTimesheetsOfTheDay: getTimesheetsOfTheDay,
        setRunningToFalse,
        getPrevRunningTimer,
        formatDuration,
        updateTimesheet,
        getTimesheetsToUpload,
        isValidTimeFormat,
        timeToSeconds,
        secondsToTime,
        parseShorthandTime,
        processPrevRunningTimesheet
    }
}
