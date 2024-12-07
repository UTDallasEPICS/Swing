'use client'

import Image from 'next/image'
import { Upload } from 'lucide-react'
import { useState, useCallback } from 'react'
import styles from './video.module.css'

export default function Home() {

  const [dragActive, setDragActive] = useState<boolean>(false)
  const [videoFiles, setVideoFiles] = useState<File[]>([]) // Store multiple files
  const [isProcessing, setIsProcessing] = useState<boolean>(false) // Processing state

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    handleFileUpload(Array.from(files)) // Convert FileList to an array
  }, [])

  const handleFileUpload = (files: File[]) => {
    if (videoFiles.length + files.length > 2) {
      alert('You can upload up to 2 videos only.')
      return
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/avi', 'video/x-matroska', 'video/webm']
    const validFiles: File[] = []

    // Validate each file
    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid video type.`)
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} exceeds the 50MB file size limit.`)
        return
      }

      // Check video duration
      checkVideoDuration(file).then((duration) => {
        if (duration > 30) {
          alert(`${file.name} exceeds the 30 seconds limit.`)
          return
        }

        validFiles.push(file) // Add file to valid files if all checks pass

        // If valid file count is correct, process files
        if (validFiles.length > 0) {
          setVideoFiles((prevFiles) => [...prevFiles, ...validFiles])
          setIsProcessing(true)
          // Simulate a delay for video processing
          setTimeout(() => {
            setIsProcessing(false)
            console.log('Videos processed successfully:', validFiles)
          }, 2000) // Replace with actual processing logic
        }
      })
    })
  }

  // Function to check the duration of the video file
  const checkVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const videoElement = document.createElement('video')
      const objectURL = URL.createObjectURL(file)
      videoElement.src = objectURL
      videoElement.onloadstart = () => {
        videoElement.onloadeddata = () => {
          resolve(videoElement.duration)
          URL.revokeObjectURL(objectURL) // Cleanup the URL after usage
        }
      }
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFileUpload(files)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
  <div>
    <h1 className="text-5xl font-bold mb-32 text-center">Upload your videos here</h1>
  </div>

  <div 
    className={`w-full max-w-xl border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center gap-8 ${dragActive ? 'border-blue-500 bg-blue-50' : ''}`}
    onDragEnter={handleDrag}
    onDragLeave={handleDrag}
    onDragOver={handleDrag}
    onDrop={handleDrop}
  >
    <div className="flex flex-col items-center text-center gap-2">
      <div className="mb-4 flex justify-center items-center w-12 h-12">
        <Image src="/Uploadicon.svg" alt="Upload icon" width={48} height={48} />
      </div>
      <p className="text-lg text-gray-700 mb-2">Drag or select up to 2 video files to upload</p>
      <p className="text-sm text-gray-500">mp4, mov, wmv, flv, avi, mkv, webm</p>
      <p className="text-sm text-gray-500">Max 30 seconds and 50 MB per file</p>
    </div>
    
    <div className="flex justify-center w-full">
      <label className="relative inline-block">
        <input
          id="file-upload"
          type="file"
          className="absolute w-px h-px p-0 m-[-1px] overflow-hidden clip border-0"
          accept="video/mp4,video/quicktime,video/x-ms-wmv,video/x-flv,video/avi,video/x-matroska,video/webm"
          onChange={handleFileSelect}
          multiple
        />
        <div className="select-file-button inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium cursor-pointer transition duration-200">
          <Upload className="w-4 h-4 mr-2" />
          Select Files
        </div>
      </label>
    </div>

    
    {/* Display video upload list */}
    <div className="mt-5">
      {videoFiles.map((file, index) => (
        <div key={index} className="mb-2 text-sm font-medium text-gray-700">
          <p className="inline-block mr-2">{file.name}</p>
          {isProcessing && <span className="text-gray-500 italic text-xs">Processing...</span>}
        </div>
      ))}
    </div>

    {/* Show processing animation */}
    {isProcessing && (
      <div className="flex justify-center items-center mt-5">
        <div className="spinner border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
      </div>
    )}
  </div>
  </main>
  );
}