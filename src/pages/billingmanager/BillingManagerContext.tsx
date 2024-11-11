import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { BillingManagerModel } from "../../models/BillingManager"


// Define action types
enum ActionType {
    SET_BILLINGS = "SET_BILLINGS",
    SET_SHOWARCHIVED = "SET_SHOWARCHIVED",
}


// State interface with action type union
interface BillingManagerData {
    billings: BillingManagerModel[],
    showArchived: boolean
}


interface BillingManagerContextValue extends BillingManagerData {
    setBillings: (billings: BillingManagerModel[]) => void
    setShowArchived: (showArchived: boolean) => void
}

interface Action {
    type: ActionType
    payload?: any
}

const initialState: BillingManagerData = {
    billings: [],
    showArchived: false
}

const reducer = (state: BillingManagerData, action: Action): BillingManagerData => {
    switch (action.type) {
        case ActionType.SET_BILLINGS:
            return { ...state, billings: action.payload }
        case ActionType.SET_SHOWARCHIVED:
            return { ...state, showArchived: action.payload }
        default:
            return state
    }
}

export const BillingManagerContext = createContext<BillingManagerContextValue>({
    ...initialState,

    setBillings: () => { },
    setShowArchived: () => { }
})

type BillingManagerContextProviderProps = {
    children: ReactNode
}

const BillingManagerContextProvider = ({ children }: BillingManagerContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const setBillings = (billings: any[]) => {
        dispatch({ type: ActionType.SET_BILLINGS, payload: billings })
    }

    const setShowArchived = (showArchived: boolean) => {
        dispatch({ type: ActionType.SET_SHOWARCHIVED, payload: showArchived })
    }

    return (
        <BillingManagerContext.Provider
            value={{
                ...state,
                setBillings,
                setShowArchived
            }}
        >
            {children}
        </BillingManagerContext.Provider>
    )
}

export default BillingManagerContextProvider

export const useBillingManagerContext = () => {
    const context = useContext(BillingManagerContext)
    if (!context) {
        throw new Error(
            "useBillingManagerContext must be used within a BillingManagerContextProvider"
        )
    }
    return context
}
