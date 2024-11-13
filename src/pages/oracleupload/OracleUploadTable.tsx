import React, { useMemo } from "react";
import { Trash2 } from "react-feather";
import { useTable, Column } from "react-table";
import { useOracleUploadContext } from "./OracleUploadContext";

// interface Task {
//     Description: string;
//     Project: string;
//     Location: string;
//     BillingCode: string;
//     TaskCode: string;
//     sunHours: number;
//     monHours: number;
//     tueHours: number;
//     wedHours: number;
//     thuHours: number;
//     friHours: number;
//     satHours: number;
// }

interface OracleUploadTableProps {
    // data: Task[];
    // handleRemove: (index: number) => void;
}


const OracleUploadTable: React.FC<OracleUploadTableProps> = () => {

    const { toUpload } = useOracleUploadContext()

    const handleRemove = async () => {

    }

    const columns = useMemo(
        () => [
            { Header: "Client", accessor: "client" },
            { Header: "Description", accessor: "taskDescription" },
            { Header: "Location", accessor: "workLoc.description" },
            { Header: "BillingCode", accessor: "projectCode" },
            { Header: "TaskCode", accessor: "taskCode" },
            { Header: "Sun", accessor: "sunHours" },
            { Header: "Mon", accessor: "monHours" },
            { Header: "Tue", accessor: "tueHours" },
            { Header: "Wed", accessor: "wedHours" },
            { Header: "Thu", accessor: "thuHours" },
            { Header: "Fri", accessor: "friHours" },
            { Header: "Sat", accessor: "satHours" },
            { Header: "Actions", accessor: "id" },
        ],
        []
    )
    // const updatedColumns = React.useMemo(
    //     () => [
    //         ...columns,
    //         {
    //             Header: "Actions",
    //             id: "actions",
    //             Cell: ({ row }: { row: any }) => (
    //                 <button
    //                     title="Remove"
    //                     onClick={() => handleRemove(row.index)}
    //                     className="text-red-500 hover:text-red-700 p-1"
    //                 >
    //                     <Trash2 size={16} />
    //                 </button>
    //             ),
    //         },
    //     ],
    //     [columns, handleRemove]
    // );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({
            columns: columns as any,
            data: toUpload,
        });

    // Calculate totals for each numeric column
    const totals = React.useMemo(() => {
        const initialTotals = {
            sunTot: 0,
            monTot: 0,
            tueTot: 0,
            wedTot: 0,
            thuTot: 0,
            friTot: 0,
            satTot: 0,
            grandTot: 0,
        };
        return toUpload.reduce((acc, task) => {
            acc.sunTot += task.sunHours || 0;
            acc.monTot += task.monHours || 0;
            acc.tueTot += task.tueHours || 0;
            acc.wedTot += task.wedHours || 0;
            acc.thuTot += task.thuHours || 0;
            acc.friTot += task.friHours || 0;
            acc.satTot += task.satHours || 0;
            acc.grandTot +=
                task.sunHours +
                task.monHours +
                task.tueHours +
                task.wedHours +
                task.thuHours +
                task.friHours +
                task.satHours;
            return acc;
        }, initialTotals);
    }, [toUpload]);

    return (
        <table
            {...getTableProps()}
            className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-sm"
        >
            <thead>
                {headerGroups.map((headerGroup) => {
                    const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                        <tr
                            key={key}
                            {...restHeaderGroupProps}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        >
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
                {rows.map((row) => {
                    prepareRow(row);
                    return (
                        <tr
                            {...row.getRowProps()}
                            className="hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            {row.cells.map((cell) => (
                                <td
                                    {...cell.getCellProps()}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-200 text-sm"
                                >
                                    {cell.render("Cell")}
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
            <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-300">
                    <td colSpan={columns.length - 8} className="px-4 py-2">
                        Totals
                    </td>
                    <td className="px-4 py-2">{totals.sunTot}</td>
                    <td className="px-4 py-2">{totals.monTot}</td>
                    <td className="px-4 py-2">{totals.tueTot}</td>
                    <td className="px-4 py-2">{totals.wedTot}</td>
                    <td className="px-4 py-2">{totals.thuTot}</td>
                    <td className="px-4 py-2">{totals.friTot}</td>
                    <td className="px-4 py-2">{totals.satTot}</td>
                    <td className="px-4 py-2">{totals.grandTot}</td>
                </tr>
            </tfoot>
        </table>
    );
};

export default OracleUploadTable;
