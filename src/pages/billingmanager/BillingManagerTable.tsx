import React, { useEffect, useState } from 'react';
import { Column, useTable } from "react-table"
import { FaArchive, FaEdit, FaRegClock, FaTrash } from 'react-icons/fa';
import { useGlobalContext } from '../../context/GlobalContext';
// import { TimesheetService } from './TimesheetService';
import { FaClock, FaClockRotateLeft, FaCoins } from 'react-icons/fa6';
// import { FcAlarmClock, FcClock } from 'react-icons/fc';
import { BillingManagerModel } from '../../models/BillingManager';
import DexieUtils from '../../utils/dexie-utils';
import { ErrorModel } from '../../models/ErrorModel';
import toast from 'react-hot-toast';
import { useBillingManagerContext } from './BillingManagerContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface BillingManagerTableProps {
    // entries: TimesheetData[];
    // onEdit: (id: number) => void;
    // onDelete: (id: number) => void;
}

const BillingManagerTable: React.FC<BillingManagerTableProps> = ({ }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { modalState, setModalState, setEditingBillingManager } =
        useGlobalContext()

    const { billings, setBillings, showArchived, setShowArchived } =
        useBillingManagerContext()

    const db = DexieUtils<BillingManagerModel>({
        tableName: "billingManager",
    })
    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    })

    useEffect(() => {
        const fetchData = async () => {
            // console.log
            await getBillingData(searchTerm)
        }

        fetchData()
    }, [showArchived, searchTerm])

    const getBillingData = async (searchTerm: string) => {
        try {
            db.getAll()
                .then((data) => {
                    // Filter out archived records if showArchived is false
                    let filteredData = showArchived
                        ? data
                        : data.filter((item) => !item.isArchived)

                    if (searchTerm) {
                        filteredData = filteredData.filter((item) =>
                            item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.taskCode.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }

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

    const handleEdit = async (data: BillingManagerModel) => {
        setEditingBillingManager(data)
    }

    const handleDelete = (id: string) => {
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
                                await db.deleteEntity(id);
                                toast.success("Billing deleted successfully", {
                                    position: "top-right",
                                });
                                // refresh
                                getBillingData(searchTerm);

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
            toast.error("Error deleting billing entry!", { position: "top-right" });
            console.error("Failed to delete billing:", error);
            errorDB.add({
                message: error.message,
                stack: error.stack || String(error),
                timestamp: new Date(),
            });
        }
    };


    const handleArchiveToggle = (id: string, isArchived: boolean) => {
        try {
            const action = isArchived ? "Unarchive" : "Archive";
            setModalState({
                title: action,
                showModal: true,
                body: (
                    <div>
                        Are you sure you want to {action.toLowerCase()} this record?
                    </div>
                ),
                footer: (
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => {
                                setModalState({ ...modalState, showModal: false });
                            }}
                            className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            No
                        </button>
                        <button
                            onClick={async () => {
                                const billing = await db.get(id);
                                if (billing) {
                                    billing.isArchived = !isArchived;
                                    await db.update(billing);
                                    toast.success(
                                        `Billing ${action.toLowerCase()}d successfully`,
                                        {
                                            position: "top-right",
                                        }
                                    );
                                    // refresh
                                    getBillingData(searchTerm);

                                    setModalState({ ...modalState, showModal: false });
                                }
                            }}
                            className="bg-cyan-600 text-white rounded-md px-4 py-2 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            Yes
                        </button>
                    </div>
                ),
            });
        } catch (error: any) {
            toast.error("Error toggling archive status!", { position: "top-right" });
            console.error("Failed to toggle archive status:", error);
            errorDB.add({
                message: error.message,
                stack: error.stack || String(error),
                timestamp: new Date(),
            });
        }
    };


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
        <div className="">
            <div className="flex flex-wrap justify-between items-center mb-2 gap-4">
                <input
                    type="text"
                    placeholder="Search..."
                    onChange={(e) => {
                        setSearchTerm(e.currentTarget.value);
                    }}
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                />
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="flex items-center px-4 py-2 border border-cyan-500 text-cyan-500 rounded-md hover:bg-cyan-50 focus:outline-none"
                >
                    {showArchived ? <FiEyeOff className="mr-2" /> : <FiEye className="mr-2" />}
                    {showArchived ? "Hide Archived" : "Show Archived"}
                </button>
            </div>


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
                            <tr {...headerGroup.getHeaderGroupProps()}
                                className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()} className="p-3 text-left">
                                        {column.render('Header')}
                                    </th>
                                ))}
                                <th></th>
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row, index) => {
                            prepareRow(row)
                            return (
                                <tr
                                    {...row.getRowProps()}
                                    className={`${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-500' : 'bg-white dark:bg-gray-600'} 
                                                               hover:bg-gray-100 dark:hover:bg-gray-400`}
                                >
                                    {row.cells.map(cell => {
                                        return (
                                            <td {...cell.getCellProps()} className="p-3">
                                                {cell.render('Cell')}
                                            </td>
                                        )
                                    })}

                                    <td className="flex justify-end space-x-2 p-2">
                                        <button
                                            onClick={() => handleEdit(row.original as BillingManagerModel)}
                                            className="text-cyan-500 hover:text-cyan-700"
                                            title="Edit"
                                        >
                                            <FaEdit size={20} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(row.original.id as string)}
                                            className="text-orange-500 hover:text-orange-700"
                                            title="Delete"
                                        >
                                            <FaTrash size={20} />
                                        </button>

                                        <button
                                            onClick={() => handleArchiveToggle(row.original.id as string, row.original.isArchived!)}
                                            className={`${row.original.isArchived ? 'text-green-500 hover:text-green-700' : 'text-yellow-500 hover:text-yellow-700'}`}
                                            title={row.original.isArchived ? "Unarchive" : "Archive"}
                                        >
                                            <FaArchive size={20} />
                                        </button>
                                    </td>


                                </tr>
                            )
                        })}
                    </tbody>
                </table>)}

        </div>
    );
};

export default BillingManagerTable;
