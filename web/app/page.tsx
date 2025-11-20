"use client";
import {useEffect, useState, useRef} from 'react'
import { redirect, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import AddPatientPage from "./components/PatientInfo";
import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'; // client redirect
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';


interface PatientItem{
    id: number;
    name: string;
    dob?: string;
}

export default function Home(){
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [showModal, setShowModal] = useState(false)
    const [patients, setPatients] = useState<PatientItem[]>([])
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
    const patientsRef = useRef<PatientItem[]>([])
    
    useEffect(() => {
        const controller = new AbortController();

        const fetchPatients = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/analyze/', { signal: controller.signal });
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const data = await response.json();
                const items: PatientItem[] = data.items ?? [];

                // Only update state if data actually changed to avoid flicker
                const prev = JSON.stringify(patientsRef.current || []);
                const next = JSON.stringify(items);
                if (prev !== next) {
                    patientsRef.current = items;
                    setPatients(items);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') console.error('Failed to fetch patients:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // initial fetch then poll every 5s
        fetchPatients();
        const interval = setInterval(fetchPatients, 1000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    /*const handleDelete = (id?: string) =>{
        const target = id ?? deleteTarget
        if (!target) return
        setPatients(prev => prev.filter(p => p.id !== target))
        setDeleteTarget(null)
    }*/
    const handleDelete = async(id: number) =>{
        const target = id ?? deleteTarget
        if(!target) return
        //if(!patients.includes(patients.id))
        try{
            setIsLoading(true)
            const response = await fetch(`/api/analyze/`,{
                method: "DELETE",
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: id})
            })
        }catch(error){
            console.log("Error detected")
        }finally{
            setIsLoading(false)
        }
    } /* const handleUpdate = async(id: any, name?: any, dob?: any) =>{
        if(!name && !dob){
            console.log('please dont do that ')
        }
        else{
            try{
            setIsLoading(true)
            const response = await fetch(`/api/analyze${id}`, {
                method: 'PUT',
                body:
            })
            }catch{

            }finally{

            }
        }
        
    }*/
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
            //set a cookie to indicate that the redirect has happend
            Cookies.set('hasRedirected', 'true', {expires: 1});
            router.replace('/login'); // if theres no cookie redirect to login page look back at this a bit
        }
    }, [router]);

    const toggleItemSelection = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemID => itemID !== id) :
            [...prev, id]
        )
    }*/
    const realSpill = (id: number) =>
    {
        //patientID = id
        //console.log(typeof id)
        router.push(`instruction_page?id=${encodeURIComponent(id)}`)
    }

   /* const toggleAllItems = () => {
        if (selectedItems.length === patients.length){
            setSelectedItems([])
        } else {
            setSelectedItems(patients.map((item: PatientItem) => item.id))
        }
    }*/
        
        const filteredPatients = patientData.filter(patient =>
        patient.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
                    {/* add patient button*/}
                    <div className="flex gap-3">
                        <button onClick={() => handleShowModal()} className="px-6 py-2 bg-black border-0 focus:outline-none text-white rounded hover:bg-black transition-colors">
                            Add Patient
                        </button>
                    </div>
                    </div>

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
                                                    onClick={(e) => {
                                                            // prevent the row click from firing (navigation)
                                                            e.stopPropagation();
                                                            handleShowModal();
                                                        }}
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
                        Date of Last Change
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                        Actions</th>
                    </tr>
                </thead>
            <tbody>
                {patientData.map((patient) => (
                    <tr 
                        key={patient.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {patient.dob}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {patient.dateChanged}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                            href= {{
                                pathname: '/view_patient_history',
                                query: {
                                    id: patient.id,
                                    name: patient.patientName,
                                    dob: patient.dob,
                                    dateChanged: patient.dateChanged
                                }
                            }} 
                            >
                                <button className="text-blue-600 hover:text-blue-800 mr-3">
                                    View History
                                </button>
                                
                            </Link>
                                <button className="text-blue-600 hover:text-blue-800 mr-3">
                                    Edit
                                </button>
                            
                            <button className="text-red-600 hover:text-red-800">
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div>
        {filteredPatients.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            No patients found matching your search.
                        </div>
                    )}
    </div>
</div>
</div>
</main>
)
}
