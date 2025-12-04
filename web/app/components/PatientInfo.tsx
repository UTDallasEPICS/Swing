"use client";
import React, { useState, useEffect } from "react";

const AddPatientPage = ({ handleShowModal, id, Name, Dob }: { handleShowModal?: () => void, id?: number, Name?: string, Dob?: Date}) => {
    const [name, setName] = useState("");
   // const [lastName, setLastName] = useState("");
    const [message, setMessage] = useState(Name || '');
    const [dob, setDob] = useState(Dob || null);
    const[isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!id){
            handleAdd(e as any)
        }
        else
        {
            handleUpdate(e as any)
        }
        //window.alert(message)
    };
   const handleUpdate = async(event: any) =>{
        event.preventDefault()
        const UpdateData = {
            id: id,
            name: name,
            dob: dob
        }
        if(!name && !dob){
            console.log('please dont do that ')
        }
        else{
            try{
            setIsLoading(true)
            const response = await fetch(`/api/analyze}`, {
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(UpdateData)
            })
            }catch(error){
                console.error("Network or Parse error")
                setMessage("An unexpected error occurred")
            }finally{
                setIsLoading(false)
            }
        }
        
    }
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
    // lock body scroll while modal is open so backdrop-blur covers the page and remains consistent
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalOverflow; };
    }, []);
    return (
        <div
            className="w-full h-full top-0 backdrop-filter backdrop-brightness-75
            backdrop-blur-md fixed inset-0  bg-black/50 z-40"
            onClick={() => handleShowModal && handleShowModal()}
        >
            <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                            required
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
                            value={dob ? dob.toISOString().split('T')[0] : ''}
                            onChange={(e) => setDob(new Date(e.target.value))}
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
        </div>
    );
};

export default AddPatientPage;
