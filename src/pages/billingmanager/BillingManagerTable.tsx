import React, { useEffect, useState } from 'react';
import { useTable } from "react-table"
import { FaEdit, FaRegClock, FaTrash } from 'react-icons/fa';
import { useGlobalContext } from '../../context/GlobalContext';
import { TimesheetService } from './TimesheetService';
import { FaClock, FaClockRotateLeft, FaCoins } from 'react-icons/fa6';
import { FcAlarmClock, FcClock } from 'react-icons/fc';
import { BillingManagerModel } from '../../models/BillingManager';
import DexieUtils from '../../utils/dexie-utils';
import { ErrorModel } from '../../models/ErrorModel';
import toast from 'react-hot-toast';
import { useBillingManagerContext } from './BillingManagerContext';

interface BillingManagerTableProps {
    // entries: TimesheetData[];
    // onEdit: (id: number) => void;
    // onDelete: (id: number) => void;
}

const BillingManagerTable: React.FC<BillingManagerTableProps> = ({ }) => {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { modalState, setModalState, setEditingBillingManager } =
        useGlobalContext()

    const { billings, setBillings } =
        useBillingManagerContext()

    // const [billingmanagerData, setBillingManagerModel] = useState<
    //     BillingManagerModel[]
    // >([])

    const [showArchived, setShowArchived] = useState(false)


    const db = DexieUtils<BillingManagerModel>({
        tableName: "billingManager",
    })
    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    })

    useEffect(() => {
        const fetchData = async () => {
            // console.log
            await getBillingData()
        }

        fetchData()
    }, [showArchived])

    const getBillingData = async () => {
        try {
            db.getAll()
                .then((data) => {
                    // Filter out archived records if showArchived is false
                    const filteredData = showArchived
                        ? data
                        : data.filter((item) => !item.isArchived)

                    // Sort the data by the client field
                    filteredData.sort((a, b) => a.client.localeCompare(b.client))

                    // Set the sorted and filtered data to BillingManagerModel
                    setBillings(filteredData)
                })
                .catch((error: any) => {
                    console.error("Error fetching data:", error)

                    errorDB.add({
                        message: error.message,
                        stack: error.stack || String(error), // Use stack or stringify error
                        timestamp: new Date(),
                    })
                })
        } catch (error: any) {
            toast.error("Error fetching billing data!", { position: "top-right" })
            console.error("Failed to fetching billing:", error)

            errorDB.add({
                message: error.message,
                stack: error.stack || String(error), // Use stack or stringify error
                timestamp: new Date(),
            })
        }
    }

    const columns: Column<BillingManagerModel>[] = React.useMemo(
        () =>
            [
                {
                    Header: "Project",
                    accessor: "client",
                    minWidth: 100,
                    width: 800,
                },
                {
                    Header: "Project Code",
                    accessor: "projectCode",
                    minWidth: 100,
                    width: 300,
                },
                {
                    Header: "Task Code",
                    accessor: "taskCode",
                    minWidth: 100,
                    width: 200,
                },
            ] as any,
        []
    )

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({
            columns,
            data: billings,
        })

    return (
        <div className="overflow-auto">
            {billings.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center space-x-3">
                        <FaCoins className="text-cyan-500 animate-pulse" size={50} />
                        <p className="text-lg">
                            No Billing Data to show.
                        </p>
                    </div>
                </div>
            ) :

                (<table {...getTableProps()} className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()} className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()} className="p-3 text-left">
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row, index) => {
                            prepareRow(row)
                            return (
                                <tr
                                    {...row.getRowProps()}
                                    className={`${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-500' : 'bg-white dark:bg-gray-600'
                                        } ${deletingId === row.original.id ? 'transition-transform transform scale-y-0' : 'transition-all'} hover:bg-gray-100 dark:hover:bg-gray-400`}
                                >
                                    {row.cells.map(cell => {
                                        return (
                                            <td {...cell.getCellProps()} className="p-3">
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

export default BillingManagerTable;
