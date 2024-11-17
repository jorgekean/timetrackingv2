import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useGlobalContext } from "../../context/GlobalContext";
import locationData from "../../../src/worklocations.json";
import { SettingModel } from "../../models/SettingModel";
import DexieUtils from "../../utils/dexie-utils";
import { SettingsService } from "../settings/SettingsService";
import { TimesheetService } from "./TimesheetService";
import { TimesheetData } from "../../models/Timesheet";
import FuseCombobox from "../../components/shared/forms/FuseCombobox";

interface CalendarProps { }

const Calendar = ({ }: CalendarProps) => {
    const settingsDB = DexieUtils<SettingModel>({ tableName: "settings" });
    const timesheetsDB = DexieUtils<TimesheetData>({ tableName: "timesheet" });
    const {
        timesheetDate,
        setTimesheetDate,
        workLocations,
        setWorkLocations,
        timesheetWorkLocation,
        setTimesheetWorkLocation,
    } = useGlobalContext();

    const settingsService = SettingsService();
    const timesheetService = TimesheetService();

    useEffect(() => {
        // setTimesheetDate(timesheetDate);

        const fetchWorkLocations = async () => {
            try {

                // // Assuming locationData is an array of objects with label and value properties
                // const formattedLocations = locationData.map((loc: any) => ({
                //     label: loc.description,
                //     value: loc.id,
                // }));
                // console.log(formattedLocations, "formattedLocations")
                setWorkLocations(locationData);

                const workLocationSetting = await settingsService.getSettingByType("worklocation");
                if (workLocationSetting) {
                    setTimesheetWorkLocation(
                        locationData.find((loc) => loc.id === workLocationSetting.value.id) || null
                    );
                }

                const timesheets = await timesheetService.getTimesheetsOfTheDay();
                if (timesheets && timesheets.length > 0) {
                    const firstTimesheetLocation = locationData.find(
                        (loc) => loc.id === timesheets[0].workLocation?.id
                    );
                    setTimesheetWorkLocation(firstTimesheetLocation || null);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchWorkLocations();
    }, [timesheetDate]);

    const handleDateChange = (date: any) => setTimesheetDate(date);

    const handlePrevDay = () => {
        if (timesheetDate) {
            const prevDate = new Date(timesheetDate);
            prevDate.setDate(prevDate.getDate() - 1);
            setTimesheetDate(prevDate);
        }
    };

    const handleNextDay = () => {
        if (timesheetDate) {
            const nextDate = new Date(timesheetDate);
            nextDate.setDate(nextDate.getDate() + 1);
            setTimesheetDate(nextDate);
        }
    };

    const handleWorkLocationChange = async (selectedItem: any) => {
        setTimesheetWorkLocation(selectedItem);

        const tsOfTheDay = await timesheetService.getTimesheetsOfTheDay();
        tsOfTheDay.forEach(async (ts) => {
            ts.workLocation = selectedItem.id;
            await timesheetsDB.update(ts);
        });
    };

    return (
        <form className="flex items-center">
            <div className="flex items-center space-x-4">
                <button type="button" onClick={handlePrevDay} className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <DatePicker
                    selected={timesheetDate}
                    onChange={handleDateChange}
                    dateFormat="MMMM d, yyyy"
                    className="text-center py-2 px-4 rounded-md border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                />
                <button type="button" onClick={handleNextDay} className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
            <div className="ml-auto w-1/3">
                <FuseCombobox
                    placeholder="Select work location"
                    items={workLocations}
                    selectedItem={timesheetWorkLocation || null}
                    onItemSelect={handleWorkLocationChange}
                    labelKey={"description"}
                    valueKey={"id"}
                />
            </div>
        </form>
    );
};

export default Calendar;
