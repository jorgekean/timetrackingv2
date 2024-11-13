import BillingManager from "./pages/billingmanager/Index"
import OracleUpload from "./pages/oracleupload/Index"
import Settings from "./pages/settings/Index"
import Timesheet from "./pages/timesheet/Index"

const routes = [
    {
        path: "",
        element: <Timesheet />,
    },
    {
        path: "oracleupload",
        element: <OracleUpload />,
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
