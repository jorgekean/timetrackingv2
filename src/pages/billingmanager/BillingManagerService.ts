

import DexieUtils from "../../utils/dexie-utils"
import { BillingManagerModel } from "../../models/BillingManager";
import { useBillingManagerContext } from "./BillingManagerContext";

export const BillingManagerService = () => {
    const {
        setBillings
    } = useBillingManagerContext()

    const db = DexieUtils<BillingManagerModel>({
        tableName: "billingManager",
    })

    const refreshBillingsState = async () => {
        const billingsFromDB = (await db.getAll())

        setBillings(billingsFromDB)
    }


    return {
        refreshBillingsState: refreshBillingsState,

    }
}
