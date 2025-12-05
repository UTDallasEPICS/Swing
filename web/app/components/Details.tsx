"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from 'next/image'
const BreakDown = ({ handleShowModal, modalData }: { handleShowModal?: () => void, modalData? :{bID: number, aID: number} | null}) => {
    const {bID, aID} = modalData || {}
  //  const [beforeDetails, setBDetails] = useState<Details | null>(null)
  //  const [afterDetails, set]
    const [loading, setLoading] = useState(true)
    const [imageError, setImageError] = useState<string>('');

    // Check if form has changed from original modalData
    useEffect(() => {
    // If you don't have API calls, set loading to false here
    setLoading(false);
    }, [bID, aID]); // Re-run if IDs change
 
    if(loading) return <div>Loading....</div>
    // lock body scroll while modal is open so backdrop-blur covers the page and remains consistent
   // Helper function to stop click propagation (should be defined outside return)


return (
    <div
        className=" flex w-full h-full top-0 backdrop-filter backdrop-brightness-75 backdrop-blur-md fixed inset-0 bg-black/50 z-40"
        onClick={() => handleShowModal && handleShowModal()}
    >
        
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl p-8 
                           w-full max-w-xl max-h-[90vh]  justify-between" 
            >
                <h2 className="text-3xl sm:text-1xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
                    Breakdown
                </h2>
                <div className="flex">
                <div className="relative w-full h-[350px]">
                     <Image
                              src={`/api/vid/?bID=${encodeURIComponent(String(bID))}`}
                              alt="Before Treatment Analysis"
                              fill
                              className="w-full h-auto max-w-[240px] object-contain"
                              unoptimized
                             onError={() => setImageError('Failed to load analysis images. Please try uploading the videos again.')}
                            />

                </div>
                
                <div className="relative w-full h-[350px]">
                     <Image
                              src={`/api/vid/?bID=${encodeURIComponent(String(aID))}`}
                              alt="After Treatment Analysis"
                              fill
                              className="w-full h-auto max-w-[240px] object-contain"
                              unoptimized
                              onError={() => setImageError('Failed to load analysis images. Please try uploading the videos again.')}
                            />

                </div>
                </div>
                {/* Optional: Add a Close button here for better UX */}
                
            </div>
        </div>
    </div>
);}
export default BreakDown;
