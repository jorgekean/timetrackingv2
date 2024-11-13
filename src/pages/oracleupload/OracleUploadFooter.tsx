import React, { useEffect } from "react"
import { ChevronDown, ToggleLeft, ToggleRight } from "react-feather" // Imported icons from react-feather

import { useOracleUploadContext, Week } from "./OracleUploadContext"
import { OracleUploadService } from "./OracleUploadService"
import toast from "react-hot-toast"
import DexieUtils from "../../utils/dexie-utils"
import { ErrorModel } from "../../models/ErrorModel"
import { useGlobalContext } from "../../context/GlobalContext"
import FuseCombobox from "../../components/shared/forms/FuseCombobox"
import { TimesheetService } from "../timesheet/TimesheetService"
import { Switch } from "@headlessui/react"
import { FaUpload } from "react-icons/fa6"



interface OracleUploadFooterProps { }

const OracleUploadFooter: React.FC<OracleUploadFooterProps> = () => {
    // const errorDB = DexieUtils<ErrorModel>({ tableName: "fuse-logs" })

    // const oracleuploadService = OracleUploadService()


    const { toUpload } = useOracleUploadContext()
    // const { modalState, setModalState } = useGlobalContext()

    return (
        <div className="flex justify-end">
            <button
                type="submit"
                onClick={() => console.log(toUpload)}
                className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium 
                         text-white
                        bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <span>Upload</span>
                <FaUpload size={16} />
            </button>
        </div>
    )
}

export default OracleUploadFooter
