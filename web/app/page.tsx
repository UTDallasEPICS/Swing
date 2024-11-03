"use client";
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie'; 

import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    // Check if the redirect cookie exists
    const hasRedirected = Cookies.get('hasRedirected');

    if (!hasRedirected) {
      // Set a cookie to indicate that the redirect has happened
      Cookies.set('hasRedirected', 'true', { expires: (24 * 60 * 60) });
      redirect('/login'); // Redirect to the login page only once
    }
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen bg-white">
    {/* Imported Logo since it's going to be the same everywhere*/}
    <div className="text-black flex justify-center items-center text-center pt-20 pb-12">
      <h2 className="text-xl">
        Click below to upload your video after you have recorded it
      </h2>
    </div>
      
       {/* For the arrow */}
       <div className="flex flex-col items-center">
        {/* Line without margin */}
        <div className="w-0.5 h-[250px] bg-black"></div>
        {/* Arrow tip without margin */}
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-black"></div>
      </div>

      {/* Video Upload Button - redirects to video upload page */}
      <div className="flex flex-col justify-center items-center mt-5">
        <Link href="/homepage">
          <button className="px-10 py-5 bg-red-600 text-white rounded-lg cursor-pointer text-lg transition duration-300 hover:bg-red-700">
            Go to Video Upload Page
          </button>
        </Link>
      </div>
    </main>
  );
}
