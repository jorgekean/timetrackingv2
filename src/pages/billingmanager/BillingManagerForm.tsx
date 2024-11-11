import React, { useEffect, useState } from 'react';
import { FaSave } from 'react-icons/fa';
import FuseInput from '../../components/shared/forms/FuseInput';
import { useGlobalContext } from '../../context/GlobalContext';
import { TimesheetData } from '../../models/Timesheet';
import DexieUtils from '../../utils/dexie-utils';
import { BillingManagerModel } from '../../models/BillingManager';
import { BillingManagerService } from './BillingManagerService';
import { ErrorModel } from '../../models/ErrorModel';
import toast from 'react-hot-toast';

interface BillingManagerFormProps { }

// interface FormData {
//     client: string | null;
//     taskDescription: string;
//     durationStr: string;
// }

const BillingManagerForm: React.FC<BillingManagerFormProps> = () => {
    const initialData = {
        client: "",
        taskCode: "",
        projectCode: "",
        actualHours: 0,
        allocatedHours: 0,
        billingType: undefined,
    }

    const billingManagerService = BillingManagerService()

    const { editingBillingManager, setEditingBillingManager } =
        useGlobalContext()

    const [formData, setFormData] = useState<BillingManagerModel>(initialData)

    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    })

    // Effect to populate form data when editing
    useEffect(() => {
        if (editingBillingManager) {
            setFormData(editingBillingManager)
        } else {
            setFormData(initialData)
        }
    }, [editingBillingManager])

    const db = DexieUtils<BillingManagerModel>({
        tableName: "billingManager",
    })

    const timesheetsDB = DexieUtils<TimesheetData>({
        tableName: "timesheet",
    })

    // Function to add a new billing record
    const addBilling = async () => {
        try {
            const newBilling: BillingManagerModel = formData
            const existingBillingData = await db.getAll()

            // Check if client name already exists
            const clientExists = existingBillingData.some(
                (billing) => billing.client === newBilling.client
            )

            if (clientExists) {
                // Display error message if project name already exists
                toast.error("Project Name already exists!", { position: "top-right" })
                return
            }

            const id = await db.add(newBilling)
            toast.success("Billing added successfully!", { position: "top-right" })

            //   toggleTimesheetChanged()

            // Reset form data
            setFormData(initialData)
        } catch (error: any) {
            toast.error("Error adding billing entry!", { position: "top-right" })
            console.error("Failed to add billing:", error)
            errorDB.add({
                message: error.message,
                stack: error.stack || String(error), // Use stack or stringify error
                timestamp: new Date(),
            })
        }
    }

    // Function to update an existing billing record
    const updateBilling = async () => {
        try {
            const editBilling: BillingManagerModel = formData
            const existingBillingData = await db.getAll()

            // Check if client name already exists (excluding current billing ID)
            const clientExists = existingBillingData.some(
                (billing) =>
                    billing.client === editBilling.client && billing.id !== editBilling.id
            )

            if (clientExists) {
                toast.error("Project Name already exists!", { position: "top-right" })
                return
            }

            // Get the previous billing information before updating
            const previousBilling = existingBillingData.find(
                (billing) => billing.id === editBilling.id
            )

            if (!previousBilling) {
                toast.error("Original billing entry not found!", {
                    position: "top-right",
                })
                return
            }

            // Update the billing entry
            const id = await db.update(editBilling)
            toast.success("Billing updated successfully!", { position: "top-right" })

            // Update all related timesheets using the previous billing information
            const timesheets = await timesheetsDB.getAll()
            const updatedTimesheets = timesheets.map((timesheet) => {
                // Check if the timesheet matches the previous billing details
                if (
                    timesheet.client?.client === previousBilling.client &&
                    timesheet.client?.projectCode === previousBilling.projectCode &&
                    timesheet.client?.value === previousBilling.taskCode
                ) {
                    // Update the timesheet fields to reflect the new billing information
                    return {
                        ...timesheet,
                        client: {
                            client: editBilling.client,
                            projectCode: editBilling.projectCode,
                            value: editBilling.taskCode,
                        },
                        projectCode: editBilling.projectCode,
                        value: editBilling.taskCode,
                    }
                }
                return timesheet
            })
            // Save updated timesheets
            await Promise.all(
                updatedTimesheets.map((updatedTimesheet: any) =>
                    timesheetsDB.update(updatedTimesheet)
                )
            )

            // Trigger any state changes related to timesheets
            // toggleTimesheetChanged()

            // Reset form data and clear editing state
            setFormData(initialData)
            setEditingBillingManager(undefined)
        } catch (error: any) {
            toast.error("Error updating billing entry!", { position: "top-right" })
            console.error("Failed to update billing:", error)

            errorDB.add({
                message: error.message,
                stack: error.stack || String(error), // Use stack or stringify error
                timestamp: new Date(),
            })
        }
    }

    // Handle form input changes
    function handleInputChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = event.target
        setFormData((prevState) => ({ ...prevState, [name]: value }))
    }

    // Handle form submission
    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
        event
    ) => {
        event.preventDefault()

        // Check if editing mode is active, otherwise add new billing
        if (editingBillingManager) {
            await updateBilling()
        } else {
            await addBilling()
        }

        // upadate state
        billingManagerService.refreshBillingsState()
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
            <div className="flex space-x-2 mb-2">
                {/* Task Description */}
                <div className="flex flex-col flex-1">
                    <FuseInput
                        name="client"
                        value={formData.client!}
                        onChange={handleInputChange}
                        placeholder="Project Name"
                        type="text"
                    />
                </div>

                {/* Client Selection with Combobox */}
                <div className="flex flex-col flex-1 max-w-64">
                    <FuseInput
                        name="projectCode"
                        value={formData.projectCode}
                        onChange={handleInputChange}
                        placeholder="Project Code"
                        type="text"
                    />
                </div>

                {/* Duration Input */}
                <div className="flex flex-col flex-1 max-w-32">
                    <FuseInput
                        name="taskCode"
                        value={formData.taskCode}
                        onChange={handleInputChange}
                        placeholder="Task Code"
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

export default BillingManagerForm;
