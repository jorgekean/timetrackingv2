import React, { useEffect, useState } from 'react';
import { useTable } from "react-table"
import { FaEdit, FaRegClock, FaTrash } from 'react-icons/fa';
import { useGlobalContext } from '../../context/GlobalContext';
import { TimesheetService } from './TimesheetService';
import DexieUtils from '../../utils/dexie-utils';
import { TimesheetData } from '../../models/Timesheet';
import { ErrorModel } from '../../models/ErrorModel';
import { MiscTimeData } from '../../models/MiscTime';
import { SettingsService } from '../settings/SettingsService';
import TimerComponent from './TimerComponent';
import toast from 'react-hot-toast';

interface TimeTrackingTableProps {
    // entries: TimesheetData[];
    // onEdit: (id: number) => void;
    // onDelete: (id: number) => void;
}

// // List of background colors for badges
// const badgeColors = [
//     // Dark shades
//     'bg-gray-800',
//     'bg-blue-800',
//     'bg-green-800',
//     'bg-indigo-800',
//     'bg-purple-800',
//     'bg-teal-800',
//     'bg-red-800',
//     'bg-yellow-800',
//     'bg-orange-800',
//     'bg-pink-800',
//     'bg-cyan-800',
//     'bg-emerald-800',
//     'bg-lime-800',
//     'bg-amber-800',
//     'bg-violet-800',

//     // Medium shades
//     'bg-gray-600',
//     'bg-blue-600',
//     'bg-green-600',
//     'bg-indigo-600',
//     'bg-purple-600',
//     'bg-teal-600',
//     'bg-red-600',
//     'bg-yellow-600',
//     'bg-orange-600',
//     'bg-pink-600',
//     'bg-cyan-600',
//     'bg-emerald-600',
//     'bg-lime-600',
//     'bg-amber-600',
//     'bg-violet-600',

//     // Light shades
//     'bg-gray-400',
//     'bg-blue-400',
//     'bg-green-400',
//     'bg-indigo-400',
//     'bg-purple-400',
//     'bg-teal-400',
//     'bg-red-400',
//     'bg-yellow-400',
//     'bg-orange-400',
//     'bg-pink-400',
//     'bg-cyan-400',
//     'bg-emerald-400',
//     'bg-lime-400',
//     'bg-amber-400',
//     'bg-violet-400',
// ];
// // Function to consistently map a project name to a color
// const getColorForProject = (projectName: string) => {
//     // Generate a hash value using the reduce method
//     const hash = projectName
//         .split('')
//         .reduce((acc, char) => acc + char.charCodeAt(0), 0);

//     // Use the hash value to select a color from the badgeColors array
//     const index = hash % badgeColors.length;
//     return badgeColors[index];
// };


const TimeTrackingTable: React.FC<TimeTrackingTableProps> = () => {

    const { timesheets, timesheetDate, modalState, setTimesheets, setEditingTimesheet, setModalState } = useGlobalContext()


    const db = DexieUtils<TimesheetData>({
        tableName: "timesheet",
    })
    const copiedTimesheetsDB = DexieUtils<TimesheetData>({
        tableName: "copiedTimesheet",
    })
    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    })
    const miscDB = DexieUtils<MiscTimeData>({
        tableName: "miscTime",
    })

    const timesheetService = TimesheetService()
    const settingsService = SettingsService()

    useEffect(() => {
        const fetchData = async () => {
            // console.log
            const timesheetsFromDB = await timesheetService.getTimesheetsOfTheDay()
            console.log(timesheetsFromDB)
            setTimesheets(timesheetsFromDB)
        }

        fetchData()
    }, [timesheetDate])

    const handleEdit = async (data: TimesheetData) => {
        // Implement delete logic here

        // data.running = false
        // await db.update(data)

        // timerRefs.current[data.id!]?.pauseTimer(data)
        // alert(timerRefs.current[data.id!]?.duration)
        // const updatedTS = await db.get(data.id as string)

        setEditingTimesheet({
            ...data,
            running: false,
            // duration: timerRefs.current[data.id!]?.duration,
        })
    }

    const handleDelete = async (id: string) => {
        try {
            setModalState({
                title: "Delete",
                showModal: true,
                body: <div>Are you sure you want to delete this?</div>,
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
                                await db.deleteEntity(id)
                                toast.success("Timesheet deleted successfully", {
                                    position: "top-right",
                                });

                                // refresh
                                const timesheetsOfToday = await timesheetService.getTimesheetsOfTheDay()
                                setTimesheets(timesheetsOfToday)

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
    }

    const columns = React.useMemo(
        () => [
            {
                Header: 'Description',
                accessor: 'taskDescription',
            },
            {
                Header: 'Project',
                accessor: 'client.client',
                Cell: ({ row }: any) => (
                    <span
                        className={`text-cyan-800 text-sm font-medium py-1 px-3 rounded-md 
                        bg-cyan-300 bg-opacity-20 hover:bg-cyan-200 dark:bg-cyan-200 dark:hover:bg-cyan-100`}
                    >
                        {row.original.client.client}
                    </span>

                )
            },
            {
                Header: 'Duration',
                accessor: 'duration',
                Cell: ({ row, value }: any) => (
                    <TimerComponent
                        key={row.original.id}
                        //   ref={(el) => (timerRefs.current[row.original.id] = el)}
                        timesheet={row.original}
                    //   startTimer={toggleTimer}
                    />
                ),
            },
            {
                Header: 'Actions',
                accessor: 'actions',
                Cell: ({ row }: any) => (
                    <div className="flex justify-center">
                        <button
                            onClick={() => handleEdit(row.original as TimesheetData)}
                            className="text-cyan-500 hover:text-cyan-700 mr-2"
                        >
                            <FaEdit size={20} />
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="text-orange-500 hover:text-orange-700"
                        >
                            <FaTrash size={20} />
                        </button>
                    </div>
                ),
            },
        ] as any,
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data: timesheets,
    })

    return (
        <div className="overflow-auto">
            {timesheets.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center space-x-3">
                        <FaRegClock className="text-cyan-500 animate-pulse" size={50} />
                        <p className="text-lg">
                            Time is precious, but this table looks a little empty. <span className="font-semibold">Start logging</span> to keep track!
                        </p>
                    </div>
                </div>
            ) :

                (<table {...getTableProps()} className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <thead>
                        {headerGroups.map((headerGroup) => {
                            const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                            return (
                                <tr
                                    key={key}
                                    {...restHeaderGroupProps}
                                    className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                    {headerGroup.headers.map((column) => {
                                        const { key: columnKey, ...restColumnProps } = column.getHeaderProps();
                                        return (
                                            <th
                                                key={columnKey}
                                                {...restColumnProps}
                                                className="px-4 py-2 text-left text-sm font-medium"
                                            >
                                                {column.render("Header")}
                                            </th>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row, index) => {
                            prepareRow(row)

                            const isRunning = row.original.running;
                            const { key, ...rowProps } = row.getRowProps();
                            return (
                                <tr key={row.id} {...rowProps}
                                    className={`${isRunning ? 'text-cyan-600 font-semibold border-l-4 border-cyan-500' : ''}
                                                 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-500' : 'bg-white dark:bg-gray-600'}
                                                 hover:bg-gray-100 dark:hover:bg-gray-400 transition-colors`}
                                >
                                    {row.cells.map(cell => {
                                        const { key, ...cellProps } = cell.getCellProps();
                                        return (
                                            <td {...cellProps} key={cell.column.id} className="p-3">
                                                {cell.render('Cell')}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>)}

        </div>
    );
};

export default TimeTrackingTable;
