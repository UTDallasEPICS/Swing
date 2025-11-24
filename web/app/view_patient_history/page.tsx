"use client";
import Link from 'next/link'
import { useSearchParams } from 'next/navigation';
import React from 'react'

export default function ViewPatientHistoryPage() {
  const params = useSearchParams();
  const name = params.get('name');
  const dob = params.get('dob');
  const dateChanged = params.get('dateChanged');
  return (
   <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Patient History</h1>
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                 Patient Name
                 </th>
             <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                Date of Birth
                </th>
             <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                Total Treatments
                </th>
             <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                Action
                </th>
           </tr>
         </thead>
         <tbody>
           <tr className ="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {name} 
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {dob} 
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {dateChanged} 
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-blue-600 hover:text-blue-800 mr-3">
                  View Details
                </button>
              </td>
           </tr>
         </tbody>
       </table>
    </div>
  )
}
