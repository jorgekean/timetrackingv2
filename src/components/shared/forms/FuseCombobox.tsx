import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import { FaCaretDown } from 'react-icons/fa6';

interface FuseComboboxItem {
    label: string;
    value: string;
}

interface FuseComboboxProps {
    items: FuseComboboxItem[];
    selectedItem: FuseComboboxItem | null | any;
    onItemSelect: (item: FuseComboboxItem) => void;
    placeholder?: string;
}

const FuseCombobox: React.FC<FuseComboboxProps> = ({
    items,
    selectedItem,
    onItemSelect,
    placeholder = 'Select an item',
}) => {
    const [query, setQuery] = useState('');
    useEffect(() => {
        console.log(items, query, "items")
    }, [])
    const filteredItems = query === ''
        ? items
        : items.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
        );

    return (
        <Combobox value={selectedItem} onChange={onItemSelect}>
            <div className="relative">
                <div className="relative">
                    <ComboboxInput
                        className="w-full p-2 border dark:bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        displayValue={(item: FuseComboboxItem) => item?.label ?? ''}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <FaCaretDown className="text-cyan-600" size={20} />
                    </ComboboxButton>
                </div>
                <ComboboxOptions className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <ComboboxOption
                                key={item.value}
                                value={item}
                                className={({ active }) =>
                                    `cursor-pointer z-50 select-none relative py-2 pl-10 pr-4 ${active ? 'text-white bg-cyan-600' : 'text-gray-900 dark:text-white'
                                    }`
                                }
                            >
                                {item.label}
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
