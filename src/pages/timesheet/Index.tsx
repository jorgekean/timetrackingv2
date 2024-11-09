// import React, { useState } from "react"
// import { Card, Col, Container, Row } from "react-bootstrap"
// import TimesheetTable from "../components/timesheets/TimesheetTable"
// import TimesheetForm from "../components/timesheets/TimesheetForm"
// import Calendar from "../components/timesheets/Calendar"
// import { useGlobalContext } from "../contexts/GlobalContext"
// import { Clock, Watch } from "react-feather"
// import { TimesheetService } from "../components/timesheets/TimesheetService"

import React, { useState } from "react"
import TimesheetForm from "./TimesheetForm"
import TimeTrackingTable from "./TimeTrackingTable"

const Timesheet = () => {
    //   const { timesheetDate, setTimesheetDate, miscTime } = useGlobalContext()
    // const [timesheetDate, setTimesheetDate] = useState<Date | undefined>(
    //   undefined
    // )
    // const [timesheetChanged, setTimesheeChanged] = useState<boolean | undefined>(
    //   undefined
    // )
    //   const timesheetService = TimesheetService()

    //   const updateTimesheetDate = (newState: Date) => {
    //     setTimesheetDate(newState)
    //   }

    // const toggleTimesheetChanged = () => {
    //   setTimesheeChanged(!timesheetChanged)
    // }


    const [timeEntries, setTimeEntries] = useState([
        { id: 1, project: 'KPMG - Events', description: 'Task 1 testing developng config issue reslution an', duration: '2h 30m' },
        { id: 2, project: 'PNC - ESS', description: 'Task 2', duration: '1h 15m' },
        { id: 3, project: 'Test Tracker', description: 'Task 3', duration: '3h 45m' },
        { id: 4, project: 'KPMG - Events', description: 'Task 11', duration: '2h 30m' },
        { id: 5, project: 'PNC - Events', description: 'Task 2', duration: '1h 15m' },
        { id: 6, project: 'PNC - PCOMMS', description: 'Task 2', duration: '1h 15m' },
        { id: 7, project: 'PNC - PCOMMS', description: 'Task 2', duration: '1h 15m' },
        { id: 8, project: 'SCA - ESS', description: 'Task 2', duration: '1h 15m' },
        { id: 9, project: 'SCA - ESS', description: 'Task 2', duration: '1h 15m' },
        // { id: 10, project: 'Test Tracker', description: 'Task 3', duration: '3h 45m' },
        // { id: 3, project: 'Test Tracker', description: 'Task 3', duration: '3h 45m' },
        // { id: 4, project: 'KPMG - Events', description: 'Task 11', duration: '2h 30m' },
        // { id: 5, project: 'PNC - Events', description: 'Task 2', duration: '1h 15m' },
        // { id: 6, project: 'PNC - PCOMMS', description: 'Task 2', duration: '1h 15m' },
        // { id: 7, project: 'PNC - PCOMMS', description: 'Task 2', duration: '1h 15m' },
        // { id: 8, project: 'SCA - ESS', description: 'Task 2', duration: '1h 15m' },
        // { id: 9, project: 'SCA - ESS', description: 'Task 2', duration: '1h 15m' },
        // { id: 10, project: 'Test Tracker', description: 'Task 3', duration: '3h 45m' },


    ]);

    const handleEdit = (id: number) => {
        console.log('Edit entry with ID:', id);
        // Logic for editing an entry
    };

    const handleDelete = (id: number) => {
        setTimeEntries(timeEntries.filter(entry => entry.id !== id));
        console.log('Deleted entry with ID:', id);
    };

    return (
        <React.Fragment>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-10">
                <TimesheetForm />
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <TimeTrackingTable entries={timeEntries} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
        </React.Fragment>
    )
}

export default Timesheet
