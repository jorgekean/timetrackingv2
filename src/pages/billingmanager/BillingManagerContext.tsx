import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { BillingManagerModel } from "../../models/BillingManager"


// Define action types
enum ActionType {
    SET_BILLINGS = "SET_BILLINGS",
}


// State interface with action type union
interface BillingManagerData {
    billings: BillingManagerModel[]
}


interface BillingManagerContextValue extends BillingManagerData {
    setBillings: (billings: BillingManagerModel[]) => void
}

interface Action {
    type: ActionType
    payload?: any
}

const initialState: BillingManagerData = {
    billings: []
}

const reducer = (state: BillingManagerData, action: Action): BillingManagerData => {
    switch (action.type) {
        case ActionType.SET_BILLINGS:
            return { ...state, billings: action.payload }
        default:
            return state
    }
}

export const BillingManagerContext = createContext<BillingManagerContextValue>({
    ...initialState,

    setBillings: () => { }
})

type BillingManagerContextProviderProps = {
    children: ReactNode
}

const BillingManagerContextProvider = ({ children }: BillingManagerContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const setBillings = (locations: any[]) => {
        dispatch({ type: ActionType.SET_BILLINGS, payload: locations })
    }

    return (
        <BillingManagerContext.Provider
            value={{
                ...state,
                setBillings
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
