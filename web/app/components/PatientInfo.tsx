"use client";
import React, { useState } from "react";

const AddPatientPage = ({ handleShowModal }: { handleShowModal?: () => void }) => {
    const [name, setName] = useState("");
   // const [lastName, setLastName] = useState("");
    const [message, setMessage] = useState('');
    const [dob, setDob] = useState("");
    const[isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAdd(e as any);
        //window.alert(message)
    };
       const handleAdd = async(event: any) =>{
        event.preventDefault();
        setMessage('')
        const PatientData = {
            name: name,
            dob: dob,
            Results: []
        }
        try{
            setIsLoading(true)
            const response = await fetch(`/api/analyze`, {
                method: "POST",
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(PatientData)
            });
            if(response.ok){
                const np = await response.json();
                setMessage(`Patient ${np.name} has been successfully created`)
                console.log('new patient data: ', np);
                // Close modal after successful creation
                setTimeout(() => {
                    handleShowModal && handleShowModal();
                }, 100);
            } else{
                const errData = await response.json();
                setMessage(`Error (${response.status}): ${errData.error || 'Failed to create patient'}`);
            }
        }catch(soowoo){
            console.error("Network or Parse Error:", soowoo)
            setMessage('An unexpected error occurred. Check console')
        }finally{
            setIsLoading(false);
        }
    }
    return (
        <div
            className="w-full h-full absolute top-0 backdrop-filter backdrop-brightness-75
            backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => handleShowModal && handleShowModal()}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-[320px] sm:w-[420px] p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
                    Patient Information
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4 text-black">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 bg-gray-200 rounded px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/*<div>
                        <label className="block text-sm text-gray-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full h-10 bg-gray-200 rounded px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>*/}

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
