"use client";
import React, { useState, useEffect } from "react";
interface VidAnalysis {
    rom: number,
    upperM: number,
    foreM: number,
    smooth: number,
    upperS: number,
    foreS: number
}
interface Details {
    before: VidAnalysis | null;
    after: VidAnalysis | null;
}
const AddPatientPage = ({ handleShowModal, modalData }: { handleShowModal?: () => void, modalData? :{bID: number, aID: number} | null}) => {
    const {bID, aID} = modalData || {}
    const [details, setDetails] = useState<Details | null>(null)
    const [loading, setLoading] = useState(true)


    /*const [name, setName] = useState(Name || '');
   // const [lastName, setLastName] = useState("");
    const [message, setMessage] = useState("");
    const [dob, setDob] = useState(Dob || null);
    const[isLoading, setIsLoading] = useState(false)*/
    
    // Check if form has changed from original modalData
  
   
    useEffect(() =>{
        fetch('/api/vid')
        .then(res => res.json())
        .then(data => {
            setDetails(data)
            setLoading(false)
        })
    }, [])
    if(loading) return <div>Loading....</div>
    if(!details) return <div> Couldn't retrieve IDs</div>
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
                    Breakdown
                </h1>
                {
                    /*if(name === Name*/
                }
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <table>
                        <thead>
                            <tr>
                                <th className="w-[200px]"></th>
                                <th>Before</th>
                                <th>After</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Upper Arm Movement</td>
                                <td>{details.before?.upperM || 'n/a'}</td>
                                <td>{details.after?.upperM || 'n/a'}</td>
                            </tr>
                            <tr>
                                <td>Fore Arm Movement</td>
                                <td>{details.before?.foreM || 'n/a'}</td>
                                <td>{details.after?.foreM || 'n/a'}</td>
                            </tr>
                            <tr>
                                <td>Upper Arm Smoothness</td>
                                <td>{details.before?.upperS || 'n/a'}</td>
                                <td>{details.after?.upperS || 'n/a'}</td>
                            </tr>
                            <tr>
                                <td>Fore Arm Smoothness</td>
                                <td>{details.before?.foreS || 'n/a'}</td>
                                <td>{details.after?.foreS || 'n/a'}</td>
                            </tr>
                            <tr>
                                <td>Range of Motion</td>
                                <td>{details.before?.rom || 'n/a'}</td>
                                <td>{details.after?.rom || 'n/a'}</td>
                            </tr>
                            <tr>
                                <td>Overall Smoothness</td>
                                <td>{details.before?.smooth || 'n/a'}</td>
                                <td>{details.after?.smooth || 'n/a'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
            </div>
            </div>
        </div>
    );
};

export default AddPatientPage;
