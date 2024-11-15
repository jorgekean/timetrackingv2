import React, { useState } from 'react'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { FaCheck, FaTrash } from 'react-icons/fa';
import { useGlobalContext } from '../../context/GlobalContext';
import toast from 'react-hot-toast';
import DexieUtils from '../../utils/dexie-utils';
import { TimesheetData } from '../../models/Timesheet';
import { ErrorModel } from '../../models/ErrorModel';

const TimesheetMoreActions = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { timesheets, modalState, setTimesheets, setModalState } = useGlobalContext();

    const db = DexieUtils<TimesheetData>({
        tableName: "timesheet",
    })
    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    })

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelectAll = () => {
        console.log("Select All clicked");
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


    return (
        <div className="flex items-center justify-between">
            <div className="relative flex items-center">
                {/* Button to trigger dropdown */}
                <button
                    type="button"
                    className="text-cyan-700"
                    onClick={toggleDropdown}>
                    <BsThreeDotsVertical size={20} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded shadow-md z-50">
                        <ul className="py-1">
                            <li
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={handleSelectAll}>
                                <FaCheck className="mr-2 text-green-500" />
                                Select Items
                            </li>
                            <li
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={handleClearAll}>
                                <FaTrash className="mr-2 text-red-500" />
                                Clear All Timesheets
                            </li>
                        </ul>
                    </div>
                )}
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