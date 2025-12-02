"use client"
import {useState, useEffect, useRef} from 'react'
import { useSearchParams } from 'next/navigation'
interface Result{
    id: number,
    type: string,
    rom_change: number,
    smoothness_change: number,
    before_id: number,
    after_id: number
}
export default function History(){
    const searchParams = useSearchParams()
    const idParam = searchParams.get('id')
    const pID = idParam ? Number(idParam) : null
    const [results, setResults] = useState<Result[]>([])
    const [showModal, setShowModal] = useState(false)
   // console.log('history id: ', pID)
   /* const handleShowModal = (bID?: number, aID?: number) =>{
        if(bID && aID){
            setModalData()
        }
    }*/
    //const [dialogOpen, setDialogOpen] = useState(false);
    //const dialogRef = useRef<HTMLDialogElement>(null);
    const resRef = useRef<Result[]>([])
    useEffect(()=>{
        const controller = new AbortController();
         const fetchPatients = async () => {
            try {
                const response = await fetch(`/api/vid/?id=${encodeURIComponent(String(pID))}`, { signal: controller.signal });
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const data = await response.json();
                const items: Result[] = data.items ?? [];

                // Only update state if data actually changed to avoid flicker
                const prev = JSON.stringify(resRef.current || []);
                const next = JSON.stringify(items);
                if (prev !== next) {
                    resRef.current = items;
                    setResults(items);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') console.error('Failed to fetch patients:', error);
            } /*finally {
                setIsLoading(false);
            }*/
        };
        // initial fetch then poll every 5s
        fetchPatients();
        const interval = setInterval(fetchPatients, 5000);
        return () => {
            controller.abort();
            clearInterval(interval);
        }; 
    }, []);
    //console.log(results)
/*const openDialog = () => dialogRef.current?.showModal();
const closeDialog = () => dialogRef.current?.close();*/

  
    return (
       <main className="flex flex-col items-center min-h-screen bg-white w-full p-4">
       <div className="flex flex-col items-center min-h-screen bg-white w-full p-4">
           <div className="w-[95%] max-w-[1600px] mx-auto px-8 py-8">
               <h1 className="text-3xl text-black border-0 focus:outline-none mb-6">Treatment Results History</h1>
               
               {/*table*/}
               <div className="border border-gray-300 rounded-lg shadow-lg mt-8">
                   <table className="w-full table-fixed">
                       <thead className="sticky top-0 bg-gray-100 border-b border-gray-300 z-10">
                           <tr>
                               <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                                   Type
                               </th>
                               <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                                   ROM Change
                               </th>
                               <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                                   Smoothness Change
                               </th>
                               <th className="px-6 py-3 text-left font-semibold text-sm text-gray-700">
                               </th>
                           </tr>
                       </thead>
                       <tbody>
                           {results.length > 0 ? (
                               results.map((result) => (
                                   <tr 
                                       key={result.id}
                                       className="border-b border-gray-200 hover:bg-gray-50 hover:relative transition-all duration-200"
                                   >
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                           {result.type || 'N/A'}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                           {result.rom_change ? result.rom_change.toFixed(2) : '0.00'}%
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                           {result.smoothness_change ? result.smoothness_change.toFixed(2) : '0.00'}%
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                                           <div className="flex items-center gap-6">
                                               <button
                                                   className="text-blue-600 hover:text-blue-800"
                                                   onClick={() => {
                                                       // Add your action here
                                                       console.log('View details for result:', result.id);
                                                   }}
                                               >
                                                   View
                                               </button>
                                           </div>
                                       </td>
                                   </tr>
                               ))
                           ) : (
                               <tr>
                                   <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-600">
                                       No Treatment Results found
                                   </td>
                               </tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </div>
       </div>
       </main>
    )
}