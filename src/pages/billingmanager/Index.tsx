import React from "react";
import BillingManagerForm from "./BillingManagerForm";
import BillingManagerTable from "./BillingManagerTable";
import BillingManagerContextProvider from "./BillingManagerContext";


const BillingManager = () => {

    const handleEdit = (id: number) => {
        console.log('Edit entry with ID:', id);
        // Logic for editing an entry
    };

    const handleDelete = (id: number) => {
        // setTimeEntries(timeEntries.filter(entry => entry.id !== id));
        console.log('Deleted entry with ID:', id);
    };

    return (
        <React.Fragment>
            <BillingManagerContextProvider>
                {/* transition-all duration-300 bg-gradient-to-r from-white dark:from-gray-800 to-white dark:to-gray-800
            focus-within:from-cyan-100 focus-within:to-cyan-200 dark:focus-within:from-cyan-800 dark:focus-within:to-cyan-800 "> */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-10">

                    {/* <form className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-transform 
        duration-300 transform focus-within:scale-105 focus-within:shadow-[0_4px_20px_rgba(0,188,212,0.3)]"> */}
                    <BillingManagerForm />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <BillingManagerTable />
                </div>
            </BillingManagerContextProvider>
        </React.Fragment>
    )
}

export default BillingManager
