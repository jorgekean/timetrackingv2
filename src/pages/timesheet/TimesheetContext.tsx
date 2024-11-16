import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { TimesheetData } from "../../models/Timesheet"


// Define action types
enum ActionType {
    // SET_BILLINGS = "SET_BILLINGS",
    SET_SHOWSELECTOPTIONS = "SET_SHOWSELECTOPTIONS",
    SET_SELECTEDITEMS = "SET_SELECTEDITEMS",
}


// State interface with action type union
interface TimesheetContextData {
    selectedRows: TimesheetData[]
    showSelectOptions: boolean
}


interface TimesheetContextValue extends TimesheetContextData {
    setSelectedRows: (selectedRows: TimesheetData[]) => void
    setShowSelectOptions: (showSelectOptions: boolean) => void
}

interface Action {
    type: ActionType
    payload?: any
}

const initialState: TimesheetContextData = {
    selectedRows: [],
    showSelectOptions: false
}

const reducer = (state: TimesheetContextData, action: Action): TimesheetContextData => {
    switch (action.type) {
        case ActionType.SET_SELECTEDITEMS:
            return { ...state, selectedRows: action.payload }
        case ActionType.SET_SHOWSELECTOPTIONS:
            return { ...state, showSelectOptions: action.payload }
        default:
            return state
    }
}

export const TimesheetContext = createContext<TimesheetContextValue>({
    ...initialState,

    setSelectedRows: () => { },
    setShowSelectOptions: () => { }
})

type TimesheetContextProviderProps = {
    children: ReactNode
}

const TimesheetContextProvider = ({ children }: TimesheetContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState)


    const setShowSelectOptions = (showSelectOpt: boolean) => {
        dispatch({ type: ActionType.SET_SHOWSELECTOPTIONS, payload: showSelectOpt })
    }

    const setSelectedRows = (selectedRows: TimesheetData[]) => {
        dispatch({ type: ActionType.SET_SHOWSELECTOPTIONS, payload: selectedRows })
    }

    return (
        <TimesheetContext.Provider
            value={{
                ...state,
                setSelectedRows,
                setShowSelectOptions
            }}
        >
            {children}
        </TimesheetContext.Provider>
    )
}

export default TimesheetContextProvider

export const useTimesheetContext = () => {
    const context = useContext(TimesheetContext)
    if (!context) {
        throw new Error(
            "useTimesheetContext must be used within a TimesheetContextProvider"
        )
    }
    return context
}
