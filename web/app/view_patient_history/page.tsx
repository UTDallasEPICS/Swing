"use client";
import Link from 'next/link'
import { useSearchParams } from 'next/navigation';
import React from 'react'
import { dummyTreatments } from '../page';

export default function ViewPatientHistoryPage() {
  const params = useSearchParams();
  const id = params.get('id');
  const name = params.get('name');
  const dob = params.get('dob');

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Patient History</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 text-gray-900">Patient Information</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium text-gray-900">{name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="font-medium text-gray-900">{dob ? new Date(dob).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Patient ID</p>
            <p className="font-medium text-gray-900">{id}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-900">Treatment History</h2>
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <table className="w-full table-fixed bg-white">
          <thead className="bg-gray-100 border-b border-gray-300">
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
            <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {dob ? new Date(dob).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {dummyTreatments.length}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link 
                  href={{
                    pathname: '/view_details',
                    query: {
                      id: id,
                      name: name,
                      dob: dob
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View Details
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}