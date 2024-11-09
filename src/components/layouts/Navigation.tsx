import React, { useState } from 'react';
import { FaHome, FaUsers, FaCog, FaBars, FaCoins } from 'react-icons/fa';
import Logo from '../../assets/FUSE (4).png';
import { FaClockRotateLeft, FaCloudArrowUp } from 'react-icons/fa6';
import { NavLink, useLocation } from 'react-router-dom'; // Import NavLink and useLocation


// Reusable NavigationItem Component
interface NavigationItemProps {
    icon: React.ReactNode;
    text: string;
    to: string;
    activePath: string;
    isCollapsed?: boolean;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ icon, text, to, activePath, isCollapsed }) => {
    return (
        <li className={`hover:bg-gray-300 hover:bg-opacity-50 p-2 rounded flex items-center space-x-3 ${activePath === to ? 'bg-gray-300 bg-opacity-50' : ''}`}>
            <NavLink to={to} className="flex items-center">
                {icon}
                {!isCollapsed ? <span className="ml-2">{text}</span> : null}
            </NavLink>
        </li>
    );
};

const Navigation: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation(); // Get the current location

    const toggleNavigation = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <nav
            className={`bg-white dark:bg-gray-800
        text-cyan-950 dark:text-cyan-50
        ${isCollapsed ? 'w-20' : 'w-64'} 
        h-full p-4 shadow-lg transition-width 
        border-r-4 border-gray-100 dark:border-gray-700
        duration-300`}
        >
            {/* Toggle Button (Hamburger Icon) */}
            <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-end'} items-center`}>
                <button onClick={toggleNavigation} className="text-cyan-950 dark:text-cyan-50 focus:outline-none">
                    <FaBars size={24} />
                </button>
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center">
                <img
                    src={Logo} // Replace with the path to your logo
                    alt="Logo"
                // className={`h-12 w-12 ${isCollapsed ? 'h-8 w-8' : 'h-12 w-12'}`}
                />
            </div>

            {/* Navigation Items */}
            <ul className="space-y-4 font-serif">
                <NavigationItem
                    icon={<FaClockRotateLeft size={30} />}
                    text="TIME TRACKING"
                    to="/"
                    activePath={location.pathname}
                    isCollapsed={isCollapsed}
                />
                <NavigationItem
                    icon={<FaCoins size={30} />}
                    text="BILLING MANAGER"
                    to="/billingmanager"
                    activePath={location.pathname}
                    isCollapsed={isCollapsed}
                />
                <NavigationItem
                    icon={<FaCloudArrowUp size={30} />}
                    text="ORACLE UPLOAD"
                    to="/oracleupload"
                    activePath={location.pathname}
                    isCollapsed={isCollapsed}
                />
                <NavigationItem
                    icon={<FaCog size={30} />}
                    text="SETTINGS"
                    to="/settings"
                    activePath={location.pathname}
                    isCollapsed={isCollapsed}
                />
            </ul>
        </nav>
    );
};

export default Navigation;