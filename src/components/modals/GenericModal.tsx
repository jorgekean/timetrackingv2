import React, { useContext } from "react";
import { GlobalContext } from "../../context/GlobalContext"

const GenericModal = () => {
    const { modalState, setModalState } = useContext(GlobalContext);

    const handleClose = () => {
        setModalState({ ...modalState, showModal: false });
    };

    return (
        <>
            {modalState.showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-lg">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {modalState.title}
                            </h2>
                        </div>
                        <div className="p-4 text-gray-700">{modalState.body}</div>
                        <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
                            {modalState.footer ? (
                                modalState.footer
                            ) : (
                                <button
                                    onClick={handleClose}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Ok
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GenericModal;
