"use client";
import Link from 'next/link'
import React from 'react'

export default function PatientActions(){
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Instructions Section */}
      <div className="bg-gray-100 p-6 rounded-lg max-w-2xl mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Instructions for Video Recording</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Ensure the patient is standing in a well-lit area</li>
          <li>Record the patient&apos;s arm swing from a side view</li>
          <li>Keep the camera steady and at shoulder height</li>
          <li>Record for at least 10 seconds</li>
          <li>Upload both before and after treatment videos</li>
        </ul>
      </div>

      <div className="p-4">
        {/* upload video & view history buttons (moved from homepage) */}
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
      </div>
    </main>
  )
}
