import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import { FaCaretDown } from 'react-icons/fa6';

interface FuseComboboxProps<T> {
    items: T[];
    selectedItem: T | null;
    onItemSelect: (item: T) => void;
    labelKey: keyof T;
    valueKey: keyof T;
    placeholder?: string;
    onQueryChange?: (query: string) => void;
    onSaveQuery?: (query: string) => void;
}

const FuseCombobox = <T,>({
    items,
    selectedItem,
    onItemSelect,
    labelKey,
    valueKey,
    placeholder = 'Select an item',
    onQueryChange,
    onSaveQuery,
}: FuseComboboxProps<T>) => {
    const [query, setQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState(items)

    useEffect(() => {
        console.log(query)
        if (onQueryChange) {
            onQueryChange(query);
        }

        const fItems = query === ''
            ? items
            : items.filter((item) =>
                String(item[labelKey]).toLowerCase().includes(query.toLowerCase())
            );

        setFilteredItems(fItems)
    }, [query, onQueryChange]);

    // Reset query when the combobox loses focus
    const handleFocus = () => {
        if (query && !selectedItem) setQuery("");  // Reset query to show all items on re-focus
    };

    return (
        <Combobox value={selectedItem} onChange={onItemSelect}>
            <div className="relative">
                <div className="relative">
                    <ComboboxInput
                        className="w-full p-2 border dark:bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        displayValue={(item: T) => (item ? String(item[labelKey]) : '')}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        onFocus={handleFocus}
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <FaCaretDown className="text-cyan-600" size={20} />
                    </ComboboxButton>
                </div>
                <ComboboxOptions className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <ComboboxOption
                                key={String(item[valueKey])}
                                value={item}
                                className={({ active }) =>
                                    `cursor-pointer z-50 select-none relative py-2 pl-10 pr-4 ${active ? 'text-white bg-cyan-600' : 'text-gray-900 dark:text-white'
                                    }`
                                }
                            >
                                {String(item[labelKey])}
                            </ComboboxOption>
                        ))
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-gray-700 dark:text-gray-200 mb-2">No results found</p>
                            {onSaveQuery && query && (
                                <button
                                    type='button'
                                    className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    onClick={() => onSaveQuery(query)}
                                >
                                    Save "{query}"
                                </button>
                            )}
                        </div>
                    )}
                </ComboboxOptions>
            </div>
        </Combobox>
    );
};

export default FuseCombobox;
