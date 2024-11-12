import BillingManager from "./pages/billingmanager/Index"
import Settings from "./pages/settings/Index"
import Timesheet from "./pages/timesheet/Index"

const routes = [
    {
        path: "",
        element: <Timesheet />,
    },
    {
        path: "oracleupload",
        element: <div>Oracle Upload</div>,
    },
    // {
    //     path: "timetracking",
    //     element: <Timesheet />,
    // },
    {
        path: "billingmanager",
        element: <BillingManager />,
    },
    {
        path: "settings",
        element: <Settings />,
    },
]
export default routes
