import React, { useEffect, useState } from "react";
import { SettingModel } from "../../models/SettingModel";
import DexieUtils from "../../utils/dexie-utils";
import TimezoneSelect, { type ITimezone, ITimezoneOption, allTimezones } from "react-timezone-select";
import { SettingsService } from "./SettingsService";
import { useGlobalContext } from "../../context/GlobalContext"
import locationData from "../../worklocations.json";
import { ErrorModel } from "../../models/ErrorModel";
import { FcCheckmark } from "react-icons/fc";
import FuseCheckbox from "../../components/shared/forms/FuseCheckbox";
import FuseCombobox from "../../components/shared/forms/FuseCombobox";

const SettingsContent = () => {
    const [selectedTimezone, setSelectedTimezone] = useState<ITimezone | undefined>(undefined);
    const [copyTimesheet, setCopyTimesheet] = useState<boolean>(false);
    const [isPeriodDecimalMark, setIsPeriodDecimalMark] = useState<boolean>(true);

    const { workLocations, workLocation, setWorkLocations, setWorkLocation } = useGlobalContext();

    const db = DexieUtils<SettingModel>({ tableName: "settings" });
    const errorDB = DexieUtils<ErrorModel>({ tableName: "fuse-logs" });

    const settingsService = SettingsService();

    useEffect(() => {
        const getSettingFromDB = async () => {
            try {
                const timezoneSetting = await settingsService.getSettingByType(
                    "timezone"
                )
                if (timezoneSetting) {
                    setSelectedTimezone(timezoneSetting.value as string)
                } else {
                    // Use the user's local timezone if no value is found in IndexedDB
                    setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
                }

                const workLocationSetting = await settingsService.getSettingByType(
                    "worklocation"
                )
                if (workLocationSetting) {
                    setWorkLocation(workLocationSetting.value as string)
                } else {
                    // Use the user's local timezone if no value is found in IndexedDB
                    // setWorkLocation(Intl.DateTimeFormat().resolvedOptions().timeZone)
                }

                const copyTimesheetSetting = await settingsService.getSettingByType(
                    "copytimesheet"
                )
                if (copyTimesheetSetting) {
                    setCopyTimesheet(copyTimesheetSetting.value as boolean)
                }

                const isPeriodDecimalMarkSetting =
                    await settingsService.getSettingByType("decimalmark")
                if (isPeriodDecimalMarkSetting) {
                    setIsPeriodDecimalMark(isPeriodDecimalMarkSetting.value as boolean)
                }
            } catch (error: any) {
                console.error("Error fetching data:", error)

                errorDB.add({
                    message: error.message,
                    stack: error.stack || String(error), // Use stack or stringify error
                    timestamp: new Date(),
                })
            }
        }

        getSettingFromDB()

        const fetchWorkLocations = async () => {
            try {
                setWorkLocations(locationData as any) // Set the fetched data as the workLocations state
            } catch (error: any) {
                console.error("Error fetching data:", error)

                errorDB.add({
                    message: error.message,
                    stack: error.stack || String(error), // Use stack or stringify error
                    timestamp: new Date(),
                })
            }
        }

        fetchWorkLocations()
    }, []);

    const handleTimezoneChange = async (timezone: ITimezoneOption) => {
        setSelectedTimezone(timezone)
        // Update timezone setting in IndexedDB
        const timezoneSetting = (await db.getAll()).find(
            (x) => x.type === "timezone"
        )
        if (timezoneSetting) {
            timezoneSetting.value = timezone.value
            await db.update(timezoneSetting)
        }
    }

    const handleWorkLocationChange = async (value: any) => {
        const selectedItem = value
        setWorkLocation(selectedItem)
        // Update timezone setting in IndexedDB
        const workLocSetting = (await db.getAll()).find(
            (x) => x.type === "worklocation"
        )
        if (workLocSetting) {
            workLocSetting.value = selectedItem
            await db.update(workLocSetting)
        }
    }

    const handleCopyTimesheetChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = e.target.checked
        setCopyTimesheet(newValue)

        const copyTimesheetSetting = (await db.getAll()).find(
            (x) => x.type === "copytimesheet"
        )
        if (copyTimesheetSetting) {
            copyTimesheetSetting.value = newValue
            await db.update(copyTimesheetSetting)
        }
    }

    const handleDecimalMarkChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = e.target.checked
        setIsPeriodDecimalMark(newValue)

        const setting = (await db.getAll()).find((x) => x.type === "decimalmark")
        if (setting) {
            setting.value = newValue
            await db.update(setting)
        }
    }

    return (
        <div>
            <div className="mb-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Timezone:</label>
                {selectedTimezone && (
                    <TimezoneSelect
                        value={selectedTimezone}
                        onChange={handleTimezoneChange}
                        timezones={{
                            ...allTimezones,
                            "America/Lima": "Pittsburgh",
                            "Europe/Berlin": "Frankfurt",
                        }}
                        className="w-full border border-gray-300 rounded-lg"
                    />
                )}
            </div>

            <div className="mb-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Default Work Location:</label>
                <FuseCombobox
                    placeholder="Select work location"
                    items={workLocations}
                    selectedItem={workLocation}
                    onItemSelect={handleWorkLocationChange}
                    labelKey={"description"}
                    valueKey={"id"}
                />
                {/* <Typeahead
                    id="workLocationTypeahead"
                    labelKey={"description"}
                    onChange={(selected) => handleWorkLocationChange(selected)}
                    options={workLocations}
                    selected={workLocation ? [workLocation] : []}
                    className="w-full border border-gray-300 rounded-lg"
                /> */}
            </div>

            <div className="flex items-center mb-12">
                {/* The actual checkbox */}
                <input
                    type="checkbox"
                    id="chkCopyTimesheet"
                    className="peer hidden"
                    checked={copyTimesheet}
                    onChange={handleCopyTimesheetChange}
                />

                {/* Label as custom styled checkbox */}
                <label htmlFor="chkCopyTimesheet"
                    className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-cyan-600 peer-checked:border-cyan-500 peer-checked:ring-2 peer-checked:ring-cyan-300 cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 20 20"
                    >

                        <path d="m6 10 3 3 6-6" />
                    </svg>
                    {/* Checkmark icon that will appear when checked */}
                    {copyTimesheet && <img src={"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e"}></img>
                    }
                </label>
                <label htmlFor="chkCopyTimesheet" className="ml-3 block text-sm font-medium text-gray-700">
                    Copy Timesheets from previous day?
                </label>
            </div>

            <div className="flex items-center">
                {/* The actual checkbox */}
                <input
                    type="checkbox"
                    id="chkPeriodDecimalMark"
                    className="peer hidden"
                    checked={isPeriodDecimalMark}
                    onChange={handleDecimalMarkChange}
                />

                {/* Label as custom styled checkbox */}
                <label htmlFor="chkPeriodDecimalMark"
                    className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-cyan-600 peer-checked:border-cyan-500 peer-checked:ring-2 peer-checked:ring-cyan-300 cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 20 20"
                    >

                        <path d="m6 10 3 3 6-6" />
                    </svg>
                    {/* Checkmark icon that will appear when checked */}
                    {isPeriodDecimalMark && <img src={"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e"}></img>
                    }
                </label>
                <label htmlFor="chkPeriodDecimalMark" className="ml-3 block text-sm font-medium text-gray-700">
                    Decimal Mark: <span className="text-sm text-gray-500">(Check for period (.) or uncheck for comma (,))</span>
                </label>
            </div>

        </div>
    );
};

export default SettingsContent;
