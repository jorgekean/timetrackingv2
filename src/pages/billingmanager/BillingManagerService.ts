

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

    const refreshBillingsState = async (showArchived: boolean) => {
        let billingsFromDB = (await db.getAll())
        if (!showArchived) {
            billingsFromDB = billingsFromDB.filter(f => !f.isArchived)
        }

        setBillings(billingsFromDB)
    }


    return {
        refreshBillingsState: refreshBillingsState,

    }
}
