import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import React, { useState } from 'react';
import { FaCaretDown } from 'react-icons/fa6';

interface FuseComboboxProps {
    items: string[];
    selectedItem: string | null;
    onItemSelect: (item: string) => void;
    placeholder?: string;
}

const FuseCombobox: React.FC<FuseComboboxProps> = ({ items, selectedItem, onItemSelect, placeholder = 'Select an item' }) => {
    const [query, setQuery] = useState('');

    const filteredItems = query === ''
        ? items
        : items.filter((item) =>
            item.toLowerCase().includes(query.toLowerCase())
        );

    return (
        <Combobox value={selectedItem} onChange={onItemSelect}>
            <div className="relative">
                <div className="relative ">
                    <ComboboxInput
                        className="w-full p-2 border dark:bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        displayValue={(item: string) => item}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <FaCaretDown className="text-cyan-600" size={20} />
                    </ComboboxButton>
                </div>
                <ComboboxOptions className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <ComboboxOption
                                key={item}
                                value={item}
                                className={({ active }) =>
                                    `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'text-white bg-cyan-600' : 'text-gray-900 dark:text-white'
                                    }`
                                }
                            >
                                {item}
                            </ComboboxOption>
                        ))
                    ) : (
                        <div className="cursor-default select-none relative py-2 px-4 text-gray-700 dark:text-gray-200">
                            No results found
                        </div>
                    )}
                </ComboboxOptions>
            </div>
        </Combobox>
    );
};

export default FuseCombobox;
