import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { TimesheetData } from "../models/Timesheet"
import { BillingManagerModel } from "../models/BillingManager"

// Define action types
enum ActionType {
    SET_MODALSTATE = "SET_MODALSTATE",
    SET_TIMESHEET_DATE = "SET_TIMESHEET_DATE",
    SET_TIMESHEETS = "SET_TIMESHEETS",
    SET_EDITING_BILLING_MANAGER = "SET_EDITING_BILLING_MANAGER",
    SET_EDITING_TIMESHEET = "SET_EDITING_TIMESHEET",
    SET_WORK_LOCATIONS = "SET_WORK_LOCATIONS",
    SET_WORK_LOCATION = "SET_WORK_LOCATION",
    SET_TIMESHEET_WORK_LOCATION = "SET_TIMESHEET_WORK_LOCATION",
    SET_RUNNING_TIMESHEET = "SET_RUNNING_TIMESHEET",
    SET_RUNNING_TIMER_ID = "SET_RUNNING_TIMER_ID",
    SET_MISC_TIME = "SET_MISC_TIME",
}

interface ModalState {
    title: string
    showModal: boolean
    body?: ReactNode
    footer?: ReactNode
}

const initialModalState: ModalState = {
    title: "",
    showModal: false,
}

// State interface with action type union
interface FuseData {
    timesheetDate: Date
    timesheets: TimesheetData[]
    editingTimesheet: TimesheetData | undefined
    editingBillingManager: BillingManagerModel | undefined
    workLocations: any[]
    workLocation: any // default location, settings page
    timesheetWorkLocation: any // per day timesheet location
    runningTimesheet: TimesheetData | undefined
    modalState: ModalState
    runningTimerId: string | null
    miscTime: number
}

interface FuseDataContextValue extends FuseData {
    setModalState: (state: ModalState) => void
    setTimesheetDate: (date: Date) => void
    setTimesheets: (timesheets: TimesheetData[]) => void
    setEditingTimesheet: (timesheet: TimesheetData | undefined) => void
    setEditingBillingManager: (
        billingManager: BillingManagerModel | undefined
    ) => void
    setWorkLocations: (locations: any[]) => void
    setWorkLocation: (location: any) => void
    setTimesheetWorkLocation: (location: any) => void
    setRunningTimesheet: (timesheet: TimesheetData | undefined) => void
    setRunningTimerId: (id: string | null) => void
    setMiscTime: (durationStr: number) => void
}

interface Action {
    type: ActionType
    payload?: any
}

const initialState: FuseData = {
    timesheetDate: new Date(new Date().setHours(0, 0, 0, 0)),
    timesheets: [],
    editingTimesheet: undefined,
    editingBillingManager: undefined,
    workLocations: [],
    workLocation: undefined,
    runningTimesheet: undefined,
    timesheetWorkLocation: undefined,
    modalState: initialModalState,
    runningTimerId: null,
    miscTime: 0,
}

const reducer = (state: FuseData, action: Action): FuseData => {
    switch (action.type) {
        case ActionType.SET_MODALSTATE:
            return { ...state, modalState: action.payload }
        case ActionType.SET_TIMESHEET_DATE:
            return { ...state, timesheetDate: action.payload }
        case ActionType.SET_TIMESHEETS:
            return { ...state, timesheets: action.payload }
        case ActionType.SET_EDITING_TIMESHEET:
            return { ...state, editingTimesheet: action.payload }
        case ActionType.SET_EDITING_BILLING_MANAGER:
            return { ...state, editingBillingManager: action.payload }
        case ActionType.SET_WORK_LOCATIONS:
            return { ...state, workLocations: action.payload }
        case ActionType.SET_WORK_LOCATION:
            return { ...state, workLocation: action.payload }
        case ActionType.SET_RUNNING_TIMESHEET:
            return { ...state, runningTimesheet: action.payload }
        case ActionType.SET_TIMESHEET_WORK_LOCATION:
            return { ...state, timesheetWorkLocation: action.payload }
        case ActionType.SET_RUNNING_TIMER_ID:
            return { ...state, runningTimerId: action.payload }
        case ActionType.SET_MISC_TIME:
            return { ...state, miscTime: action.payload }
        default:
            return state
    }
}

export const GlobalContext = createContext<FuseDataContextValue>({
    ...initialState,
    setModalState: () => { },
    setTimesheetDate: () => { },
    setTimesheets: () => { },
    setEditingTimesheet: () => { },
    setEditingBillingManager: () => { },
    setWorkLocations: () => { },
    setWorkLocation: () => { },
    setTimesheetWorkLocation: () => { },
    setRunningTimesheet: () => { },
    setRunningTimerId: () => { },
    setMiscTime: () => { },
})

type GlobalContextProviderProps = {
    children: ReactNode
}

const GlobalContextProvider = ({ children }: GlobalContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const setModalState = (state: ModalState) => {
        dispatch({ type: ActionType.SET_MODALSTATE, payload: state })
    }

    const setTimesheetDate = (date: Date) => {
        dispatch({ type: ActionType.SET_TIMESHEET_DATE, payload: date })
    }

    const setTimesheets = (timesheets: TimesheetData[]) => {
        dispatch({ type: ActionType.SET_TIMESHEETS, payload: timesheets })
    }

    const setEditingTimesheet = (timesheet: TimesheetData | undefined) => {
        dispatch({ type: ActionType.SET_EDITING_TIMESHEET, payload: timesheet })
    }

    const setEditingBillingManager = (
        billingManager: BillingManagerModel | undefined
    ) => {
        dispatch({
            type: ActionType.SET_EDITING_BILLING_MANAGER,
            payload: billingManager,
        })
    }

    const setWorkLocations = (locations: any[]) => {
        dispatch({ type: ActionType.SET_WORK_LOCATIONS, payload: locations })
    }

    const setWorkLocation = (location: any) => {
        dispatch({ type: ActionType.SET_WORK_LOCATION, payload: location })
    }

    const setTimesheetWorkLocation = (location: any) => {
        dispatch({
            type: ActionType.SET_TIMESHEET_WORK_LOCATION,
            payload: location,
        })
    }

    const setRunningTimesheet = (timesheet: TimesheetData | undefined) => {
        dispatch({ type: ActionType.SET_RUNNING_TIMESHEET, payload: timesheet })

        // store in local storage so in case there is page reload
        if (timesheet) {
            localStorage.setItem("fuse-runningTimesheet", JSON.stringify(timesheet))
        } else {
            localStorage.removeItem("fuse-runningTimesheet")
        }
    }

    const setRunningTimerId = (id: string | null) => {
        dispatch({ type: ActionType.SET_RUNNING_TIMER_ID, payload: id })
    }

    const setMiscTime = (durationStr: number) => {
        dispatch({ type: ActionType.SET_MISC_TIME, payload: durationStr })
    }
    return (
        <GlobalContext.Provider
            value={{
                ...state,
                setModalState,
                setTimesheetDate,
                setTimesheets,
                setEditingTimesheet,
                setEditingBillingManager,
                setWorkLocations,
                setWorkLocation,
                setTimesheetWorkLocation,
                setRunningTimesheet,
                setRunningTimerId,
                setMiscTime,
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalContextProvider

export const useGlobalContext = () => {
    const context = useContext(GlobalContext)
    if (!context) {
        throw new Error(
            "useGlobalContext must be used within a GlobalContextProvider"
        )
    }
    return context
}
