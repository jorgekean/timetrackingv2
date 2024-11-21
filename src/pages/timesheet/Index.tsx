// import React, { useState } from "react"
// import { Card, Col, Container, Row } from "react-bootstrap"
// import TimesheetTable from "../components/timesheets/TimesheetTable"
// import TimesheetForm from "../components/timesheets/TimesheetForm"
// import Calendar from "../components/timesheets/Calendar"
// import { useGlobalContext } from "../contexts/GlobalContext"
// import { Clock, Watch } from "react-feather"
// import { TimesheetService } from "../components/timesheets/TimesheetService"

import React, { useEffect, useState } from "react"
import TimesheetForm from "./TimesheetForm"
import TimeTrackingTable from "./TimeTrackingTable"
import Calendar from "./Calendar";
import TimesheetContextProvider from "./TimesheetContext";
import { useGlobalContext } from "../../context/GlobalContext";
import { TimesheetService } from "./TimesheetService";


const Timesheet = () => {
    const { timesheetDate, modalState, setModalState, setTimesheetDate } = useGlobalContext()
    const timesheetService = TimesheetService()

    const checkForNewDay = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastPromptDate = localStorage.getItem("prompt-brand-new-day");
        const isNewDay = !lastPromptDate || new Date(lastPromptDate).getTime() !== today.getTime();

        if (isNewDay) {
            setModalState({
                title: "Brand New Day",
                showModal: true,
                body: <div>Ready to jump to today?</div>,
                footer: (
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={async () => {
                                setModalState({ ...modalState, showModal: false });

                                // make sure to stop all running tasks
                                await timesheetService.stopAllRunningTasks();
                            }}
                            className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            No
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                setTimesheetDate(today);
                                localStorage.setItem("prompt-brand-new-day", today.toISOString());

                                // make sure to stop all running tasks
                                await timesheetService.stopAllRunningTasks();

                                setModalState({ ...modalState, showModal: false });
                            }}
                            className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Yes
                        </button>
                    </div>
                ),
            });
        }
    };

    useEffect(() => {
        checkForNewDay()

        // Add focus event listener to trigger the check on window focus
        const handleFocus = () => {
            checkForNewDay();
        };

        window.addEventListener("focus", handleFocus);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [timesheetDate])

    return (
        <React.Fragment>
            <TimesheetContextProvider>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-20">
                    <Calendar />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-24 z-10">
                    <TimesheetForm />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <TimeTrackingTable />
                </div>
            </TimesheetContextProvider>
        </React.Fragment>
    )
}

export default Timesheet
