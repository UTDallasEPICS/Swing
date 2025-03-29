'use client'

import Image from 'next/image'
import { Upload, Video, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useState, useCallback } from 'react'
import styles from './video.module.css'
import { useRouter } from 'next/navigation'

export default function VideoUpload() {
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [beforeVideo, setBeforeVideo] = useState<File | null>(null)
  const [afterVideo, setAfterVideo] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeUpload, setActiveUpload] = useState<'before' | 'after' | null>(null)
  const router = useRouter()

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
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }, [])

  const handleFileUpload = async (files: File[]) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/avi', 'video/x-matroska', 'video/webm']
    
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} is not a valid video type.`)
        continue
      }
      if (file.size > 50 * 1024 * 1024) {
        setError(`${file.name} exceeds the 50MB file size limit.`)
        continue
      }

      // If we have an active upload type, use that
      if (activeUpload) {
        if (activeUpload === 'before') {
          setBeforeVideo(file)
        } else {
          setAfterVideo(file)
        }
        setActiveUpload(null)
      } 
      // Otherwise, try to determine which video to set
      else {
        if (!beforeVideo) {
          setBeforeVideo(file)
        } else if (!afterVideo) {
          setAfterVideo(file)
        } else {
          setError('Please select which video you want to upload (Before or After)')
        }
      }
    }
  }

  const checkVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const videoElement = document.createElement('video')
      const objectURL = URL.createObjectURL(file)
      videoElement.src = objectURL
      videoElement.onloadeddata = () => {
        resolve(videoElement.duration)
        URL.revokeObjectURL(objectURL)
      }
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFileUpload(files)
  }

  const removeVideo = (type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforeVideo(null)
    } else {
      setAfterVideo(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!beforeVideo || !afterVideo) {
      setError('Please select both videos')
      return
    }

    setIsProcessing(true)
    setError(null)

    const formData = new FormData()
    formData.append('beforeVideo', beforeVideo)
    formData.append('afterVideo', afterVideo)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to analyze videos')
      }

      // Redirect to results page with all analysis URLs
      router.push(`/results?before=${result.beforeResult}&after=${result.afterResult}&improvement=${result.improvementResult}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsProcessing(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Upload Patient Videos</h1>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Before Video Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Before Treatment</h2>
              {beforeVideo ? (
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <Video className="h-6 w-6 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">{beforeVideo.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo('before')}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveUpload('before')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload Before video</p>
                </button>
              )}
            </div>

            {/* After Video Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">After Treatment</h2>
              {afterVideo ? (
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <Video className="h-6 w-6 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">{afterVideo.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo('after')}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveUpload('after')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload After video</p>
                </button>
              )}
            </div>
          </div>

          {activeUpload && (
            <div className="mb-8">
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-blue-500" />
                  <span className="text-blue-700 font-medium">
                    Uploading {activeUpload === 'before' ? 'Before' : 'After'} Treatment video
                  </span>
                </div>
                <input
                  type="file"
                  name="file"
                  className="block w-full max-w-xs text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={handleFileSelect}
                  accept="video/mp4,video/quicktime,video/x-ms-wmv,video/x-flv,video/avi,video/x-matroska,video/webm"
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={!beforeVideo || !afterVideo || isProcessing}
              className={`px-8 py-4 rounded-lg text-white font-semibold flex items-center gap-2
                ${(!beforeVideo || !afterVideo || isProcessing) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isProcessing ? (
                <>
                  <div className="spinner border-4 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Analyze Videos
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
