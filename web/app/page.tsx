"use client";
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie'; 
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    //Check if the redirect cookie exists
    const hasRedirected = Cookies.get('hasRedirected');

    if (!hasRedirected) {
      //Set a cookie to indicate that the redirect has happened
      Cookies.set('hasRedirected', 'true', { expires: (24 * 60 * 60) });
      redirect('/login'); //Redirect to the login page only once
    }
  }, []);

  //Responsive size added to adjust for mobile/tablet
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* Header Section */}
      <div className="text-black flex flex-col items-center text-center pt-20 pb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Cerebral Palsy Arm Swing Analysis
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
          Upload before and after videos of your patient's arm swing to analyze improvement in unilateral cerebral palsy
        </p>
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

      {/* Upload Button */}
      <div className="flex flex-col justify-center items-center mt-5">
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
    </main>
  );
}
