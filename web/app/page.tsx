"use client";
import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'; // client redirect
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';


interface PatientItem{
    id: string;
    patientName: string;
    dob: string;
    dateChanged: string;
}

export default function Home(){
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('')
    //change this soon itll come from something else
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const patientData: PatientItem[] = [
        {
            id: '1',
            patientName: 'Bessie Young',
            dob: '9/12/2006',
            dateChanged: '10/20/2024'
        },
        {
            id: '2',
            patientName: 'John Smith',
            dob: '3/15/2005',
            dateChanged: '10/21/2024'
        },
        {
            id: '3',
            patientName: 'Sarah Johnson',
            dob: '7/23/2007',
            dateChanged: '10/19/2024'
        },
        {
            id: '4',
            patientName: 'Michael Brown',
            dob: '1/30/2004',
            dateChanged: '10/18/2024'
        }
    ]
    useEffect(() => {
        //check if the redirect cookie exists
        const hasRedirected = Cookies.get('hasRedirected');
        if (!hasRedirected){
            //set a cookie to indicate that the redirect has happend
            Cookies.set('hasRedirected', 'true', {expires: 1});
            router.replace('/login'); // if theres no cookie redirect to login page look back at this a bit
        }
    }, [router]);

    const toggleItemSelection = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemID =>itemID !== id) :
            [...prev, id]
        )
    }
        const toggleAllItems = () => {
            if (selectedItems.length === patientData.length){
                setSelectedItems([])
            } else {
                setSelectedItems(patientData.map(item => item.id))
            }
        }
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
                        <button className="px-6 py-2 bg-black border-0 focus:outline-none text-white rounded hover:bg-black transition-colors">
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
