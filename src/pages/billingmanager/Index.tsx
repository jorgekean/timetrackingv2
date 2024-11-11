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
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-10">
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
