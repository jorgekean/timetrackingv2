import React, { useEffect } from "react"
import { ChevronDown, ToggleLeft, ToggleRight } from "react-feather" // Imported icons from react-feather

import { useOracleUploadContext, Week } from "./OracleUploadContext"
import { OracleUploadService } from "./OracleUploadService"
import toast from "react-hot-toast"
import DexieUtils from "../../utils/dexie-utils"
import { ErrorModel } from "../../models/ErrorModel"
import { useGlobalContext } from "../../context/GlobalContext"
import FuseCombobox from "../../components/shared/forms/FuseCombobox"
import { TimesheetService } from "../timesheet/TimesheetService"
import { Switch } from "@headlessui/react"



interface FilterComponentProps { }

const OracleUploadFilters: React.FC<FilterComponentProps> = () => {
    const errorDB = DexieUtils<ErrorModel>({ tableName: "fuse-logs" })

    const oracleuploadService = OracleUploadService()
    const timesheetService = TimesheetService()

    const { setToUpload, selectedWeek, selectedDays, setSelectedWeek, setSelectedDays } = useOracleUploadContext()
    const { modalState, setModalState } = useGlobalContext()

    const generateWeeks = (): Week[] => {
        const weeks: Week[] = []
        try {
            const startDate = new Date()
            startDate.setMonth(startDate.getMonth() - 2)
            startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7))
            const endDate = new Date()
            endDate.setMonth(endDate.getMonth() + 2)
            endDate.setDate(endDate.getDate() - ((endDate.getDay() + 6) % 7) + 6)

            for (let date = new Date(endDate); date >= startDate; date.setDate(date.getDate() - 7)) {
                const startOfWeek = new Date(date)
                const endOfWeek = new Date(date)
                endOfWeek.setDate(endOfWeek.getDate() + 6)
                weeks.push({
                    label: oracleuploadService.formatLabel(startOfWeek, endOfWeek),
                    value: `${oracleuploadService.formatDate(startOfWeek)}|${oracleuploadService.formatDate(endOfWeek)}`,
                })
            }
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to generate weeks")
            errorDB.add({
                message: error.message,
                stack: error.stack || String(error),
                timestamp: new Date(),
            })
        }
        return weeks
    }

    const weeks = generateWeeks()

    useEffect(() => {
        const currentWeek = weeks.find((week) => {
            const [start, end] = week.value.split("|")
            const today = oracleuploadService.formatDate(new Date())
            return today >= start && today <= end
        })
        setSelectedWeek(currentWeek!)
    }, [])

    useEffect(() => {
        // Split the selectedWeek into startDate and endDate
        // alert(selectedWeek)
        const [start, end] = selectedWeek?.value.split("|") || []
        const startDate = start ? new Date(start) : null
        const endDate = end ? new Date(end) : null
        console.log(startDate, endDate)
        // load timesheet data to upload
        const fetchData = async () => {
            try {
                const timesheetsToUpload = await timesheetService.getTimesheetsToUpload(
                    startDate!,
                    endDate!
                )
                console.log(timesheetsToUpload, selectedDays, "timesheetsToUpload")
                // Filter based on selected days and exclude rows with total 0 hours
                // Filter timesheets based on selectedDays and exclude rows with a total of 0 hours
                const filteredTimesheets = timesheetsToUpload.filter((timesheet) => {
                    const selectedDayHours = Array.from(selectedDays).map(
                        (day) => timesheet[`${day.slice(0, 3).toLowerCase()}Hours`]
                    )
                    const totalHours = selectedDayHours.reduce(
                        (sum, hours) => sum + Number(hours || 0),
                        0
                    )

                    return totalHours > 0
                })

                setToUpload(filteredTimesheets)
            } catch (error: any) {
                console.error(error)
                toast.error("Failed to fetch timesheets to upload")

                errorDB.add({
                    message: error.message,
                    stack: error.stack || String(error), // Use stack or stringify error
                    timestamp: new Date(),
                })
            }
        }
        fetchData()
    }, [selectedDays, selectedWeek])

    const handleDayFilterChange = (day: string) => {
        // Debugging: Log the current value of selectedDays and the clicked day
        console.log("Current selectedDays:", selectedDays);
        console.log("Clicked day:", day);

        // Toggle the day in selectedDays
        const newSelectedDays = selectedDays.includes(day)
            ? selectedDays.filter((selectedDay) => selectedDay !== day)
            : [...selectedDays, day];

        setSelectedDays(newSelectedDays);
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center mb-3 space-y-2 md:space-y-0 md:space-x-4 max-w-full">
            {/* Wider container for the FuseCombobox */}
            <div className="w-full md:w-1/3"> {/* Adjust width as needed */}
                <FuseCombobox
                    items={weeks}
                    selectedItem={selectedWeek}
                    onItemSelect={(value) => setSelectedWeek(value)}
                    placeholder="Select Week to Upload"
                    labelKey="label"
                    valueKey="value"
                />
            </div>

            {/* Toggle icons for day filtering */}
            <div className="flex flex-wrap gap-1 md:w-2/3"> {/* Adjust width as needed */}
                {[
                    { value: "Sunday", label: "Sun" },
                    { value: "Monday", label: "Mon" },
                    { value: "Tuesday", label: "Tue" },
                    { value: "Wednesday", label: "Wed" },
                    { value: "Thursday", label: "Thu" },
                    { value: "Friday", label: "Fri" },
                    { value: "Saturday", label: "Sat" },
                ].map((day) => (
                    <div className="ml-5">
                        <Switch
                            checked={selectedDays.includes(day.value)}
                            onChange={() => handleDayFilterChange(day.value)}
                            className={`${selectedDays.includes(day.value) ? 'bg-cyan-500' : 'bg-gray-300'
                                } relative inline-flex items-center h-6 rounded-full w-12 transition-colors duration-200 ease-in-out`}
                        >
                            <span
                                className={`${selectedDays.includes(day.value) ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                            />
                        </Switch>

                        <span className="text-cyan-600 font-medium ml-1">{day.label}</span>
                    </div>
                ))}
            </div>
        </div>

    )
}

export default OracleUploadFilters
