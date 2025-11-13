"use client";
import {useEffect, useState} from 'react'
import { redirect, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import AddPatientPage from "./components/PatientInfo";
import Link from 'next/link'
import { getAllPatients } from '../queries/queries';

interface PatientItem{
    id: number;
    name: string;
    dob?: string;
}
export default function Home(){
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [showModal, setShowModal] = useState(false)
    const [patients, setPatients] = useState<PatientItem[]>([])
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
    
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setIsLoading(true);
                const data = await getAllPatients();
                setPatients(data);
            } catch (error) {
                console.error('Failed to fetch patients:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchPatients();
    }, []);
    const handleDelete = (id?: string) =>{
        const target = id ?? deleteTarget
        if (!target) return
        setPatients(prev => prev.filter(p => p.id !== target))
        setDeleteTarget(null)
    }
    const handleShowModal = () =>{
        setShowModal(!showModal)
    }
    const filteredPatients = patients.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true; // no filter -> show all
        return (
            p.name.toLowerCase().includes(q) ||
            (p.dob?.toLowerCase().includes(q) ?? false)
        );
    });
    useEffect(() => {
        const hasRedirected = Cookies.get('hasRedirected');
        if (!hasRedirected){
            Cookies.set('hasRedirected', 'true', {expires: (24 * 60 * 60)});
            redirect('/login') 
        }
    }, [])
    /*const toggleItemSelection = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemID => itemID !== id) :
            [...prev, id]
        )
    }*/
    const realSpill = (id: any) =>
    {
        //patientID = id
        router.push(`instruction_page?id=${encodeURIComponent(id)}`)
    }

   /* const toggleAllItems = () => {
        if (selectedItems.length === patients.length){
            setSelectedItems([])
        } else {
            setSelectedItems(patients.map((item: PatientItem) => item.id))
        }
    }*/
        
    return (
        <main className="flex flex-col items-center min-h-screen bg-white w-full p-4">
            <div className="fixed top-5 left-5 w-[40vw] sm:w-[30vw] md:w-[25vw] max-w-[500px] z-50">
                <Image
                className="max-w-full h-auto"
                src="/image2vector.svg"
                alt="Swing Logo"
                layout="responsive"
                width={450}
                height={50}
                priority
                />
            </div>
            <div className="w-[95%] max-w-[1600px] mx-auto px-8 py-24 mt-12">
                {/*header section*/}
                <div className="flex items-center justify-between mb-6">
                    {showModal && <AddPatientPage handleShowModal={handleShowModal}/>}
                    <h1 className="text-3xl text-black border-0 focus:outline-none">Patient Profile</h1>
                    {/*search bar */}
                    <div className="flex-1 max-w-md mx-8">
                        <input
                            type="text"
                            placeholder="Search to filter..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className = "w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {/*buttons*/}
                    <div className="flex gap-3">
                        <button onClick={() => handleShowModal()} className="px-6 py-2 bg-black border-0 focus:outline-none text-white rounded hover:bg-black transition-colors">
                            Add Patient
                        </button>
                    </div>
                </div>

                {/*table*/}
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg mt-8">
                    <table className="w-full table-fixed">
                        <thead className="bg-gray-100 border-b border-gray-300">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                                    Patient Name
                                </th>
                                <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                                    Date of Birth
                                </th>
                                <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <tr 
                                        key={patient.id}
                                        className="border-b border-gray-200 hover:transform hover:scale-[1.02] hover:shadow-md hover:z-10 hover:bg-gray-50 hover:relative transition-all duration-200"
                                        onClick={() => realSpill(patient.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {patient.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                                            <div className="flex items-center gap-6">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800"
                                                    //onClick={() => { }}
                                                >
                                                    Edit
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={(e) => {
                                                            // prevent the row click from firing (navigation)
                                                            e.stopPropagation();
                                                            if(window.confirm("Are you sure? Play dangerous games get dangerous results")){
                                                                // confirmed: proceed with deletion logic
                                                                setDeleteTarget(patient.id);
                                                                console.log("Item deleted")
                                                            } else {
                                                                // cancelled: stay on the same page (do nothing)
                                                                console.log("Deletion canceled")
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-600">
                                        No results found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                </div>
            </div>
          
        </main>
    )
}
