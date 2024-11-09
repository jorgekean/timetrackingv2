import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import { FaArrowDown, FaCaretDown, FaXmark } from 'react-icons/fa6';
import FuseTextArea from '../../components/shared/forms/FuseTextArea';
import FuseCombobox from '../../components/shared/forms/FuseCombobox';
import FuseInput from '../../components/shared/forms/FuseInput';

interface TimesheetFormProps { }

interface FormData {
    client: string | null;
    taskDescription: string;
    durationStr: string;
}

const clients = ['Client A', 'Client B', 'Client C'];

const TimesheetForm: React.FC<TimesheetFormProps> = () => {
    const [formData, setFormData] = useState<FormData>({ client: null, taskDescription: '', durationStr: '' });
    // const [query, setQuery] = useState('');

    // const filteredClients = query === ''
    //     ? clients
    //     : clients.filter((client) =>
    //         client.toLowerCase().includes(query.toLowerCase())
    //     );

    const handleInputChange = (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Add form submission logic here
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
            <div className="flex space-x-2 mb-2">
                {/* Task Description */}
                <div className="flex flex-col flex-1">
                    <FuseTextArea
                        value={formData.taskDescription}
                        onChange={handleInputChange}
                        placeholder="What are you working on?"
                    />
                </div>

                {/* Client Selection with Combobox */}
                <div className="flex flex-col flex-1 max-w-64">
                    <FuseCombobox items={clients}
                        selectedItem={formData.client}
                        onItemSelect={(value) => setFormData({ ...formData, client: value })}
                        placeholder='Select a Project'
                    ></FuseCombobox>
                </div>

                {/* Duration Input */}
                <div className="flex flex-col flex-1 max-w-32">
                    <FuseInput
                        value={formData.durationStr}
                        onChange={handleInputChange}
                        placeholder="00:00:00"
                        type="text"
                    />
                </div>

                <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <span>Save</span>
                    <FaSave size={16} />
                </button>
            </div>
        </form>
    );
};

export default TimesheetForm;
