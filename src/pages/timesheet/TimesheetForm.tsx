import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import { FaSave } from 'react-icons/fa';
import { FaArrowDown, FaCaretDown, FaXmark } from 'react-icons/fa6';
import FuseTextArea from '../../components/shared/forms/FuseTextArea';
import FuseCombobox from '../../components/shared/forms/FuseCombobox';
import FuseInput from '../../components/shared/forms/FuseInput';
import { useGlobalContext } from '../../context/GlobalContext';
import { TimesheetData } from '../../models/Timesheet';
import DexieUtils from '../../utils/dexie-utils';
import { BillingManagerModel } from '../../models/BillingManager';
import { ErrorModel } from '../../models/ErrorModel';
import { TimesheetService } from './TimesheetService';
import toast from 'react-hot-toast';
import TimeInputComponent from './TimeInputComponent';

interface TimesheetFormProps { }

interface FormData {
    client: string | null;
    taskDescription: string;
    durationStr: string;
}

const clients = [{ label: 'Client A', value: '01' }, { label: 'Client B', value: '012' }, { label: 'Client C', value: '013' }];

const TimesheetForm: React.FC<TimesheetFormProps> = () => {
    const {
        timesheetDate,
        timesheets,
        editingTimesheet,
        setTimesheets,
        setEditingTimesheet,
        runningTimesheet,
        setRunningTimesheet,
        timesheetWorkLocation,

    } = useGlobalContext()

    const initialFormData = {
        client: null,
        taskDescription: "",
        durationStr: "00:00:00",
        duration: undefined,
        timesheetDate: timesheetDate,
        running: true,
        createdDate: new Date(),
        workLocation: "",
    }

    const [formData, setFormData] = useState<TimesheetData>(initialFormData)

    const [projectOptions, setProjectOptions] = useState<BillingManagerModel[]>([])
    const [clientText, setClientText] = useState("")

    // const handleQueryChange = (query: string) => {
    //     setClientText(query);
    //     // console.log("Current query:", query);  // Or handle it any way you want
    // };

    const db = DexieUtils<TimesheetData>({
        tableName: "timesheet",
    })
    const billingManagerDB = DexieUtils<BillingManagerModel>({
        tableName: "billingManager",
    })
    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    })

    const timesheetService = TimesheetService()

    // useEffect(() => {}, [])

    const handleNewBillingSave = async (query: string) => {
        var newBilling = {
            client: query,
            taskCode: "",
            projectCode: "",
        }
        const id = await billingManagerDB.add(newBilling)
        toast.success(
            "New Billing saved! Go to Billing Manager page to update the project and task code.",
            { position: "top-right", duration: 5000 }
        )

        await populateBillingOptions()
    }

    const populateBillingOptions = async () => {
        // Fetch and populate options
        const billings = (await billingManagerDB.getAll()).filter(x => !x.isArchived)
        setProjectOptions(billings)
    }

    useEffect(() => {
        setFormData((prevState) => ({
            ...prevState,
            ["timesheetDate"]: timesheetDate,
            running:
                timesheetDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0), // set true if current date, else false
        }))
    }, [timesheetDate])

    useEffect(() => {
        try {
            const fetchData = async () => {
                // Fetch and populate options
                await populateBillingOptions()

                // Populate form data if editing
                if (editingTimesheet) {

                    const editingTimesheetDisplay = {
                        ...editingTimesheet!,
                        duration: editingTimesheet?.duration,
                        durationStr: timesheetService.formatDuration(
                            editingTimesheet?.duration!
                        ),
                    }

                    setFormData(editingTimesheetDisplay)
                } else {
                    setFormData(initialFormData)
                }
            }
            fetchData()
        } catch (error: any) {
            console.error("Error fetching data:", error)

            errorDB.add({
                message: error.message,
                stack: error.stack || String(error), // Use stack or stringify error
                timestamp: new Date(),
            })
        }
    }, [editingTimesheet])

    const processPrevRunningTimesheet = async () => {
        const prevRunningTS = timesheets.find(x => x.running);
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
            await timesheetService.updateTimesheet({ ...prevRunningTS, duration: prevRunningDuration, running: false })
            setTimesheets(await timesheetService.getTimesheetsOfTheDay())
        }
    }

    const addTimesheet = async () => {
        const newTimesheet: TimesheetData = formData

        try {
            // add billing if selected not exist
            if (!formData.client) {
                var newBilling = {
                    client: clientText,
                    taskCode: "",
                    projectCode: "",
                }
                const id = await billingManagerDB.add(newBilling)
                toast.success(
                    "Selected billing does not exist. Go to Billing Manager page to update the chargecode.",
                    { position: "top-right", duration: 5000 }
                )

                const newlySavedBilling = await billingManagerDB.get(id)
                newTimesheet.client = newlySavedBilling!
            }

            newTimesheet.createdDate = new Date()

            // set timesheet work location
            newTimesheet.workLocation = timesheetWorkLocation

            if (editingTimesheet) {
                // Update existing timesheet
                newTimesheet.id = editingTimesheet.id
                newTimesheet.clientStr = newTimesheet.clientStr ?? clientText
                await timesheetService.updateTimesheet(newTimesheet!)

            } else {

                processPrevRunningTimesheet()

                localStorage.setItem("fuse-startTime", JSON.stringify(new Date()))

                // Add new timesheet
                newTimesheet.duration = !newTimesheet.duration
                    ? 0
                    : newTimesheet.duration
                // newTimesheet.clientStr = newTimesheet.clientStr ?? clientText
                // newTimesheet.duration = 2000
                const id = await db.add(newTimesheet)

                // // set running timesheet state
                // if (newTimesheet.running) {
                //     const activeTimesheet = await db.get(id)
                //     setRunningTimesheet(activeTimesheet)
                // }
            }

            // Refresh timesheets for the day
            setTimesheets(await timesheetService.getTimesheetsOfTheDay())
            // setEditingTimesheet(undefined)

            setFormData({
                ...initialFormData,
                running:
                    timesheetDate.setHours(0, 0, 0, 0) ===
                    new Date().setHours(0, 0, 0, 0),
            })
        } catch (error: any) {
            toast.error("Error adding timesheet entry!", { position: "top-right" })
            console.error("Failed to add timesheet:", error)

            errorDB.add({
                message: error.message,
                stack: error.stack || String(error), // Use stack or stringify error
                timestamp: new Date(),
            })
        }
    }

    function handleInputChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = event.target
        console.log(name, value)
        setFormData((prevState) => ({ ...prevState, [name]: value }))
    }

    function handleClientTypeaheadChange(value: any) {
        const selectedClient = value.selected[0]
        setFormData((prevState) => ({
            ...prevState,
            client: selectedClient,
            clientStr: selectedClient?.client,
        }))
    }

    const convertToSeconds = (time: string): number => {
        const [hours, minutes, seconds] = time.split(":").map(Number)
        return hours * 3600 + minutes * 60 + seconds
    }

    const handleDurationChange = (value: string) => {
        setFormData({
            ...formData,
            durationStr: value,
            duration: convertToSeconds(value),
        })
    }

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
        event
    ) => {
        event.preventDefault()

        if (timesheetService.isValidTimeFormat(formData.durationStr!)) {
            await addTimesheet()
        } else {
            // show toast message
            toast.error("Invalid time format. Please use HH:mm:ss format.", {
                position: "top-right",
            })
        }

    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
            <div className="flex space-x-2 mb-2">
                {/* Task Description */}
                <div className="flex flex-col flex-1">
                    <FuseTextArea
                        name="taskDescription"
                        value={formData.taskDescription}
                        onChange={handleInputChange}
                        placeholder="What are you working on?"
                    />
                </div>

                {/* Client Selection with Combobox */}
                <div className="flex flex-col flex-1 max-w-64">
                    <FuseCombobox
                        // name="client"
                        items={projectOptions}
                        selectedItem={formData.client}
                        onItemSelect={(value) => setFormData({ ...formData, client: value })}
                        placeholder='Select a Project'
                        labelKey={"client"}
                        valueKey={"id"}
                        // onQueryChange={handleQueryChange}
                        onSaveQuery={handleNewBillingSave}
                    >
                    </FuseCombobox>
                </div>

                {/* Duration Input */}
                <div className="flex flex-col flex-1 max-w-32">
                    {/* <TimeInputComponent
                        placeholder='00:00:00'
                        value={formData.durationStr!}
                        onChange={handleInputChange}
                    /> */}
                    <FuseInput
                        name="durationStr"
                        value={formData.durationStr!}
                        onChange={handleInputChange}
                        placeholder="00:00:00"
                        type="text"
                    />
                </div>

                <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <span>Save</span>
                    <FaSave size={16} />
                </button>
            </div>
        </form>
    );
};

export default TimesheetForm;
