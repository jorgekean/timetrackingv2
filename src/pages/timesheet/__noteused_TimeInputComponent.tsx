import React, { useRef, useState } from "react";
import { Clock } from "react-feather";
import { TimesheetService } from "./TimesheetService";

interface TimeInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const TimeInputComponent: React.FC<TimeInputProps> = ({
    value,
    onChange,
    placeholder,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const timesheetService = TimesheetService();

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const position = target.selectionStart || 0;
        const section = getSection(position);
        selectSection(section);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        onChange(value);
    };

    const handleDurationChange = (delta: number) => {
        const currentSeconds = timesheetService.timeToSeconds(value);
        let newSeconds = currentSeconds + delta;
        if (newSeconds < 0) newSeconds = 0; // Prevent negative time
        onChange(timesheetService.secondsToTime(newSeconds));
    };

    const resetTime = () => {
        onChange("00:00:00");
    };

    const getSection = (position: number) => {
        if (position <= 2) return "HH";
        if (position >= 3 && position <= 5) return "mm";
        if (position >= 6) return "ss";
        return "";
    };

    const selectSection = (section: string) => {
        if (inputRef.current) {
            const start = section === "HH" ? 0 : section === "mm" ? 3 : 6;
            const end = section === "HH" ? 2 : section === "mm" ? 5 : 8;
            inputRef.current.setSelectionRange(start, end);
        }
    };

    return (
        <div className="relative flex items-center space-x-2">
            <input
                type="text"
                ref={inputRef}
                value={value}
                onClick={handleClick}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
                className="time-input w-28 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-center text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 outline-none"
            />
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 text-cyan-500 hover:text-cyan-600 focus:outline-none"
                >
                    <Clock size={18} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-10">
                        <button
                            onClick={resetTime}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Reset Time
                        </button>
                        <button
                            onClick={() => handleDurationChange(300)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            +5 mins
                        </button>
                        <button
                            onClick={() => handleDurationChange(900)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            +15 mins
                        </button>
                        <button
                            onClick={() => handleDurationChange(1800)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            +30 mins
                        </button>
                        <button
                            onClick={() => handleDurationChange(3600)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            +1 hour
                        </button>
                        <button
                            onClick={() => handleDurationChange(-300)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            -5 mins
                        </button>
                        <button
                            onClick={() => handleDurationChange(-900)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            -15 mins
                        </button>
                        <button
                            onClick={() => handleDurationChange(-1800)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            -30 mins
                        </button>
                        <button
                            onClick={() => handleDurationChange(-3600)}
                            className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            -1 hour
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeInputComponent;
