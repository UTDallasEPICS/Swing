"use client";
import React, { useState } from "react";

const AddPatientPage = ({ handleShowModal }: { handleShowModal?: () => void }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // replace with real submit logic
        console.log("Submitting patient:", { firstName, lastName, dob });
        handleShowModal && handleShowModal();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => handleShowModal && handleShowModal()}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-[320px] sm:w-[420px] p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
                    Patient Information
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full h-10 bg-gray-200 rounded px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full h-10 bg-gray-200 rounded px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Date of birth</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full h-10 bg-gray-200 rounded px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="mt-4 bg-black text-white px-8 py-2 rounded-md shadow-lg hover:bg-gray-800 transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientPage;
