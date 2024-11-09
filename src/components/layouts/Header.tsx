import { Switch } from '@headlessui/react';
import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { FaGear } from 'react-icons/fa6';

const Header: React.FC = () => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage for dark mode setting on initial load
        return localStorage.getItem("fuse-darkmode") === "1";
    });
    const popoverRef = useRef<HTMLDivElement | null>(null);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem("fuse-darkmode", "1");
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.removeItem("fuse-darkmode");
        }
    };

    const togglePopover = () => {
        setIsPopoverOpen(!isPopoverOpen);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setIsPopoverOpen(false);
        }
    };

    useEffect(() => {
        // Apply the dark mode class based on localStorage value when component mounts
        if (localStorage.getItem("fuse-darkmode") === "1") {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Event listener for detecting clicks outside of the popover
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center dark:bg-gray-800">
            <div className="flex items-center space-x-4">
                {/* Additional Header Content */}
            </div>
            <div className="flex items-center space-x-4 relative">
                <FaGear
                    className="text-gray-600 cursor-pointer dark:text-gray-300"
                    size={20}
                    onClick={togglePopover}
                />
                <FaUserCircle className="text-gray-600 cursor-pointer dark:text-gray-300" size={28} />

                {isPopoverOpen && (
                    <div
                        ref={popoverRef}
                        className="absolute right-0 top-4 mt-8 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 z-50 transition-transform duration-300 ease-out"
                        style={{
                            transform: isPopoverOpen ? 'scale(1)' : 'scale(0.95)',
                            opacity: isPopoverOpen ? 1 : 0,
                        }}
                    >
                        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Settings</h2>
                        {/* <Switch
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                            className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-white/10 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white/10"
                        >
                            <span
                                aria-hidden="true"
                                className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-gray-200 peer dark:bg-gray-600 ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
                            />
                        </Switch> */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={toggleDarkMode}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
