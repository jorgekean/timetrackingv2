import React, { useEffect, useState } from 'react';
import { useTable } from "react-table"
import { FaEdit, FaRegClock, FaTrash } from 'react-icons/fa';
import { useGlobalContext } from '../../context/GlobalContext';
import { TimesheetService } from './TimesheetService';
import DexieUtils from '../../utils/dexie-utils';
import { TimesheetData } from '../../models/Timesheet';
import { ErrorModel } from '../../models/ErrorModel';
import { SettingsService } from '../settings/SettingsService';
import TimerComponent from './TimerComponent';
import toast from 'react-hot-toast';
import TimesheetMoreActions from './TimesheetMoreActions';
import { useTimesheetContext } from './TimesheetContext';

interface TimeTrackingTableProps {

}

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = () => {

    const [selectAllChecked, setSelectAllChecked] = useState(false)
    // const [selectedRows, setSelectedRows] = useState<TimesheetData[]>([])

    const { timesheets, timesheetDate, modalState, setTimesheets, setEditingTimesheet, setModalState } = useGlobalContext()
    const { showSelectOptions, selectedRows, setSelectedRows } = useTimesheetContext()

    const db = DexieUtils<TimesheetData>({
        tableName: "timesheet",
    })
    // const copiedTimesheetsDB = DexieUtils<TimesheetData>({
    //     tableName: "copiedTimesheet",
    // })
    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    })
    // const miscDB = DexieUtils<MiscTimeData>({
    //     tableName: "miscTime",
    // })

    const timesheetService = TimesheetService()
    const settingsService = SettingsService()

    useEffect(() => {
        const fetchData = async () => {
            console.log(timesheetDate, "time")
            const timesheetsFromDB = await timesheetService.getTimesheetsOfTheDay()
            setTimesheets(timesheetsFromDB)

            setSelectAllChecked(false)
            setSelectedRows([])
        }

        fetchData()
    }, [timesheetDate])

    useEffect(() => {
        if (selectAllChecked) {
            setSelectedRows(timesheets)
        } else {
            setSelectedRows([])
        }
    }, [selectAllChecked, timesheets])

    const handleEdit = async (data: TimesheetData) => {
        // Implement delete logic here

        if (data.running) {

            // data.running = false
            // await db.update(data)

            await timesheetService.processPrevRunningTimesheet()

            // setTimesheets(await timesheetService.getTimesheetsOfTheDay())
        }

        // timerRefs.current[data.id!]?.pauseTimer(data)
        // alert(timerRefs.current[data.id!]?.duration)
        // const updatedTS = await db.get(data.id as string)

        const updatedTimesheet = await db.get(data.id!)
        setEditingTimesheet(updatedTimesheet)
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
                            type="button"
                            onClick={async () => {
                                await db.deleteEntity(id)
                                toast.success("Timesheet deleted successfully", {
                                    position: "top-right",
                                });

                                // refresh            

                                const timesheetsOfToday = (await db.getAll()).filter(
                                    (f) => f.timesheetDate.setHours(0, 0, 0, 0) === timesheetDate.setHours(0, 0, 0, 0)
                                )
                                    .sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime())
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

    const handleSelectAllChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSelectAllChecked(event.target.checked)
    }

    const handleCheckboxChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        row: TimesheetData
    ) => {
        if (event.target.checked) {
            // alert(JSON.stringify(row))
            setSelectedRows([...selectedRows, row])
        } else {
            setSelectedRows(selectedRows.filter((x) => x.id !== row.id))
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
        [timesheetDate]
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
        <div className="space-y-4">
            <TimesheetMoreActions />

            {/* Table Section */}
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
                ) : (
                    <table
                        {...getTableProps()}
                        className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
                    >
                        <thead>
                            {headerGroups.map((headerGroup) => {
                                const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                                return (
                                    <tr
                                        key={key}
                                        {...restHeaderGroupProps}
                                        className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                                    >
                                        {showSelectOptions && (
                                            <th>
                                                {" "}
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-5 w-5 text-cyan-600 border-gray-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50 rounded"
                                                    checked={selectAllChecked}
                                                    onChange={handleSelectAllChange}
                                                />
                                            </th>
                                        )
                                        }
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
                                prepareRow(row);

                                const isRunning = row.original.running;
                                const { key, ...rowProps } = row.getRowProps();
                                return (
                                    <tr
                                        key={row.id}
                                        {...rowProps}
                                        className={`${isRunning
                                            ? "text-cyan-600 font-semibold border-l-4 border-cyan-500"
                                            : ""
                                            }
                            ${index % 2 === 0
                                                ? "bg-gray-50 dark:bg-gray-500"
                                                : "bg-white dark:bg-gray-600"
                                            }
                            hover:bg-gray-100 dark:hover:bg-gray-400 transition-colors`}
                                    >

                                        {showSelectOptions && (
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.some(
                                                        (selectedRow) => selectedRow.id === row.original.id
                                                    )}
                                                    onChange={(e) => handleCheckboxChange(e, row.original)}
                                                    className="form-checkbox h-5 w-5 text-cyan-600 border-gray-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50 rounded"
                                                />
                                            </td>
                                        )}
                                        {row.cells.map((cell) => {
                                            const { key, ...cellProps } = cell.getCellProps();
                                            return (
                                                <td
                                                    {...cellProps}
                                                    key={cell.column.id}
                                                    className="p-3"
                                                >
                                                    {cell.render("Cell")}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                )}
            </div>
        </div>
    );

};

export default TimeTrackingTable;
