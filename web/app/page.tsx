"use client";
import {useEffect} from 'react'
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import {useState} from 'react'
import Link from 'next/link'

interface PatientItem{
    id: string;
    patientName: string;
    dob: string;
    dateChanged: string;
}

export default function Home(){
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
            Cookies.set('hasRedirected', 'true', {expires: (24 * 60 * 60)});
            redirect('/login') // if theres no cookie redirect to login page look back at this a bit
        }
    }, [])
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

      {/* Instructions Section */}
      <div className="bg-gray-100 p-6 rounded-lg max-w-2xl mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Instructions for Video Recording</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Ensure the patient is standing in a well-lit area</li>
          <li>Record the patient's arm swing from a side view</li>
          <li>Keep the camera steady and at shoulder height</li>
          <li>Record for at least 10 seconds</li>
          <li>Upload both before and after treatment videos</li>
        </ul>
      </div>

      {/* upload video & view history button */}
    <div className ="flex justify-end items-center mt-5 gap-4">
           <Link href="/patientHistory">
          <button className="px-8 py-4 bg-black hover:bg-gray-200 text-white rounded-lg 
            cursor-pointer text-lg font-semibold transition duration-300
            shadow-lg hover:shadow-xl flex items-center gap-2">
            <span>View Patient History</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6zm0 2h8v1H6V4zm0 3h8v2H6V7zm0 3h5v2H6v-2z" />
            </svg>
          </button>
        </Link>
           <Link href="/videoUpload">
          <button className="px-8 py-4 bg-black hover:bg-gray-200 text-white rounded-lg 
            cursor-pointer text-lg font-semibold transition duration-300
            shadow-lg hover:shadow-xl flex items-center gap-2">
            <span>Upload Patient Videos</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </Link>
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
                        Actions
                    </th>
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
        {filteredPatients.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            No patients found matching your search.
                        </div>
                    )}
    </div>
</div>
</main>
)
}
