import React, { useState } from 'react'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { FaCheck, FaCopy, FaTimes, FaTrash } from 'react-icons/fa';
import { useGlobalContext } from '../../context/GlobalContext';
import toast from 'react-hot-toast';
import DexieUtils from '../../utils/dexie-utils';
import { TimesheetData } from '../../models/Timesheet';
import { ErrorModel } from '../../models/ErrorModel';
import { Tooltip } from 'react-tooltip';
import { useTimesheetContext } from './TimesheetContext';
import { TimesheetService } from './TimesheetService';
import { set } from 'lodash';

const TimesheetMoreActions = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { timesheets, modalState, timesheetDate, setTimesheets, setModalState } = useGlobalContext();
    const { showSelectOptions, selectedRows, copiedRows, setShowSelectOptions, setCopiedRows, setSelectedRows } = useTimesheetContext();

    const db = DexieUtils<TimesheetData>({
        tableName: "timesheet",
    })
    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    })

    const timesheetService = TimesheetService();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = () => {
        setShowSelectOptions(!showSelectOptions)
        setIsOpen(false);
    };

    const handleClearAll = () => {
        try {
            setModalState({
                title: "Clear",
                showModal: true,
                body: <div>Are you sure you want to delete all timesheets for this day?</div>,
                footer: (
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => {
                                setModalState({ ...modalState, showModal: false });
                            }}
                            className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            No
                        </button>
                        <button
                            onClick={async () => {

                                timesheets.forEach(async (ts) => {
                                    await db.deleteEntity(ts.id!)
                                })

                                setTimesheets([])

                                toast.success("Timesheet deleted successfully", {
                                    position: "top-right",
                                });

                                setModalState({ ...modalState, showModal: false });
                            }}
                            className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Yes
                        </button>
                    </div>
                ),
            });
        } catch (error: any) {
            toast.error("Error deleting timesheet entry!", { position: "top-right" });

            errorDB.add({
                message: error.message,
                stack: error.stack || String(error),
                timestamp: new Date(),
            });
        }

        setIsOpen(false);
    };

    const handleClose = () => {
        setIsOpen(false); // Close the dropdown
    };

    const handleDeleteSelected = async () => {

        selectedRows.forEach(async (ts) => {
            await db.deleteEntity(ts.id!)
        })
        const newTimesheets = await timesheetService.getTimesheetsOfTheDay();
        setTimesheets(newTimesheets)

        toast.success("Timesheet deleted successfully", { position: "top-right" });
        setShowSelectOptions(false);

    };

    const handleCopySelected = () => {

        setCopiedRows(selectedRows);

        setShowSelectOptions(false);
        setSelectedRows([]);
    };

    const handlePasteSelected = async () => {
        copiedRows.forEach(async (ts: TimesheetData) => {
            const newTimesheet = { ...ts, id: undefined, duration: 0, running: false, createdDate: new Date(), timesheetDate: timesheetDate }
            await db.add(newTimesheet)
        })

        toast.success("Timesheet copied successfully", { position: "top-right" });
        setShowSelectOptions(false);
        setCopiedRows([]);

        // refresh
        const newTimesheets = await timesheetService.getTimesheetsOfTheDay();
        setTimesheets(newTimesheets)
    }


    return (
        <div className="flex items-center justify-between">
            <div className="relative flex items-center">
                {/* Button to trigger dropdown */}
                <button
                    type="button"
                    className="text-cyan-700"
                    onClick={toggleDropdown}
                    data-tooltip-id="more-options"
                    data-tooltip-content="More Options">
                    <BsThreeDotsVertical size={20} />
                </button>
                <Tooltip id="more-options" place="right" />

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded shadow-md z-50">
                        <ul className="py-1">
                            <li
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={handleSelect}>
                                <FaCheck className="mr-2 text-green-500" />
                                {showSelectOptions ? "Hide items selection" : "Select Items"}
                            </li>
                            <li
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={handleClearAll}>
                                <FaTrash className="mr-2 text-red-500" />
                                Clear All Timesheets
                            </li>
                            <li
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer border-t border-gray-200"
                                onClick={handleClose}>
                                <FaTimes className="mr-2 text-gray-500" />
                                Close
                            </li>
                        </ul>
                    </div>
                )}

                {selectedRows.length > 0 && (<div className="ml-2 flex space-x-2">
                    <button
                        type="button"
                        className="flex items-center px-4 py-2 bg-orange-600 text-white font-medium rounded shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 transition-colors"
                        onClick={handleDeleteSelected}>
                        <FaTrash className="mr-2" />
                        Delete Selected
                    </button>
                    <button
                        type="button"
                        className="flex items-center px-4 py-2 bg-cyan-600 text-white font-medium rounded shadow hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 transition-colors"
                        onClick={handleCopySelected}>
                        <FaCopy className="mr-2" />
                        Copy Selected
                    </button>
                </div>)}
                {copiedRows.length > 0 && (<div className="ml-2 flex space-x-2">
                    <button
                        type="button"
                        className="flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
                        onClick={() => setCopiedRows([])}>
                        <FaTimes className="mr-2" />
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="flex items-center px-4 py-2 bg-cyan-600 text-white font-medium rounded shadow hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 transition-colors"
                        onClick={handlePasteSelected}>
                        <FaCopy className="mr-2" />
                        Paste Selected
                    </button>
                </div>)}

            </div>
            <div className='flex space-x-6'>
                <div className="text-orange-500 dark:text-orange-300  font-bold">
                    Misc Time:
                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                        {/* Replace with actual misc time value */}
                        00:30:00
                    </span>
                </div>
                <div className="text-orange-500 dark:text-orange-300 font-bold">
                    Total Hours:
                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                        {/* Replace with actual total hours value */}
                        08:15:00
                    </span>
                </div>
            </div>
        </div>
    )
}

export default TimesheetMoreActions