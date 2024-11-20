import { Play, Pause } from "react-feather";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/GlobalContext";
import { TimesheetService } from "./TimesheetService";
import { TimesheetData } from "../../models/Timesheet";
import { MiscTimeData } from "../../models/MiscTime";
import DexieUtils from "../../utils/dexie-utils";

interface TimerComponentProps {
  timesheet: TimesheetData;
}

const TimerComponent: React.FC<TimerComponentProps> = ({ timesheet }) => {
  const [isToday, setIsToday] = useState(false);
  const [isRunning, setIsRunning] = useState(timesheet.running);
  const [duration, setDuration] = useState<number>(timesheet.duration || 0)
  const [startTime, setStartTime] = useState<Date | null>(
    localStorage.getItem("fuse-startTime")
      ? new Date(JSON.parse(localStorage.getItem("fuse-startTime")!))
      : null
  )


  const { timesheetDate, timesheets, setTimesheets } = useGlobalContext();
  const timesheetService = TimesheetService();

  useEffect(() => {
    console.log("timesheet.running")
    if (timesheet.running) {
      const calculateDuration = async () => {
        const currentTime = new Date()
        if (currentTime instanceof Date && startTime instanceof Date) {
          const elapsedTime = currentTime.getTime() - startTime.getTime()
          setDuration(duration + Math.floor(elapsedTime / 1000))
        }
      }

      calculateDuration()
      const intervalId = setInterval(calculateDuration, 1000)
      return () => clearInterval(intervalId)
    }

  }, [timesheet.running])

  useEffect(() => {
    console.log("timesheets")
    setIsToday(
      timesheetDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
    );

    setIsRunning(timesheet.running)
  }, [timesheets]);

  const toggleTimer = async () => {
    const prevRunningTS = timesheets.find(x => x.running);

    let prevRunningDuration = 0;
    if (prevRunningTS) {
      prevRunningDuration = prevRunningTS.duration!// prev running duration when click on other timer
    }

    // calculate duration of prev running timesheet, based on fuse-startTime before it resets     
    const currentTime = new Date()
    const prevStartTime = localStorage.getItem("fuse-startTime") ? new Date(JSON.parse(localStorage.getItem("fuse-startTime")!)) : null
    if (currentTime instanceof Date && prevStartTime instanceof Date) {
      const elapsedTime = currentTime.getTime() - prevStartTime.getTime()

      prevRunningDuration = prevRunningDuration! + Math.floor(elapsedTime / 1000)
    }

    // set local storage start time so that even moving on different pages the timer will not reset
    if (!isRunning) {
      localStorage.setItem("fuse-startTime", JSON.stringify(new Date()))
      setStartTime(new Date())

    } else {
      localStorage.removeItem("fuse-startTime")
      setStartTime(null)
    }

    setIsRunning(!isRunning);

    // update prev running timesheet if any - set running false and refresh state    
    if (prevRunningTS) {
      await timesheetService.updateTimesheet({ ...prevRunningTS, duration: prevRunningDuration, running: false })
      setTimesheets(await timesheetService.getTimesheetsOfTheDay())
    }

    // save timesheet every toggle
    await timesheetService.updateTimesheet({ ...timesheet, duration: duration, running: !isRunning })
    setTimesheets(await timesheetService.getTimesheetsOfTheDay())
  };

  return (
    <div className="flex items-center">
      <span className="mr-2">
        {timesheetService.formatDuration(duration)}
      </span>
      {isToday && (
        <button
          onClick={toggleTimer}
          className={`text-cyan-500 hover:text-cyan-700 transition-transform duration-300 ${isRunning ? "animate-pulse" : ""
            }`}
        >
          {isRunning ? (
            <Pause size={24} className="animate-pulse" />
          ) : (
            <Play
              size={24}
              className="hover:text-cyan-700"
            />
          )}
        </button>
      )}
    </div>
  );
};

export default TimerComponent;
