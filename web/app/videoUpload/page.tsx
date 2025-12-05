'use client'

import Image from 'next/image'
import { Upload, Video, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import styles from './video.module.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

// Create FFmpeg instance at module level so it persists across renders
let ffmpegInstance: FFmpeg | null = null
let ffmpegLoaded = false

export default function VideoUpload() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [beforeVideo, setBeforeVideo] = useState<File | null>(null)
  const [afterVideo, setAfterVideo] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeUpload, setActiveUpload] = useState<'before' | 'after' | null>(null)
  const [downsizeProgress, setDownsizeProgress] = useState<number>(0)
  const [downsizeStatus, setDownsizeStatus] = useState<string>('')
  const router = useRouter()

  // Load FFmpeg once at module level
  const loadFFmpeg = async () => {
    if (ffmpegLoaded && ffmpegInstance) {
      console.log('FFmpeg already loaded, reusing instance')
      return ffmpegInstance
    }

    if (!ffmpegInstance) {
      ffmpegInstance = new FFmpeg()
    }

    const ffmpeg = ffmpegInstance
    
    ffmpeg.on('log', ({ message }) => {
      console.log(message)
    })

    ffmpeg.on('progress', ({ progress }) => {
      setDownsizeProgress(Math.round(progress * 100))
    })

    setDownsizeStatus('Loading Before Video....')
    
    try {
      await ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
      })
      
      ffmpegLoaded = true
      console.log('FFmpeg loaded successfully and cached')
      return ffmpeg
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      ffmpegInstance = null
      ffmpegLoaded = false
      throw error
    }
  }

  // Downsize video to 720p with OpenCV-compatible settings
  const downsizeTo720p = async (file: File): Promise<File> => {
    try {
      setDownsizeStatus(`Loading After Video ${file.name}...`)
      setDownsizeProgress(0)

      const ffmpeg = await loadFFmpeg()

      // Write input file
      await ffmpeg.writeFile('input.mp4', await fetchFile(file))

      // Run FFmpeg command with OpenCV-compatible settings
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', 'scale=-2:720',        // -2 ensures width is divisible by 2
        '-c:v', 'libx264',             // H.264 codec
        '-profile:v', 'baseline',      // Baseline profile for max compatibility
        '-level', '3.0',               // H.264 level
        '-pix_fmt', 'yuv420p',         // Pixel format OpenCV expects
        '-crf', '23',                  // Quality
        '-preset', 'medium',           // Encoding speed
        '-movflags', '+faststart',     // Move metadata to beginning for streaming
        '-c:a', 'aac',                 // Re-encode audio to AAC (more compatible)
        '-b:a', '128k',                // Audio bitrate
        '-ar', '44100',                // Audio sample rate
        'output.mp4'
      ])

      // Read output
      const data = await ffmpeg.readFile('output.mp4')
      const dataBuffer = (data as Uint8Array).buffer as ArrayBuffer
      const blob = new Blob([dataBuffer], { type: 'video/mp4' })
      
      // Convert blob back to File
      const downsizedFile = new File([blob], file.name, { type: 'video/mp4' })
      
      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      console.log(`Downsized size: ${(downsizedFile.size / 1024 / 1024).toFixed(2)}MB`)
      
      setDownsizeStatus('')
      setDownsizeProgress(0)
      
      return downsizedFile
    } catch (err) {
      console.error('Error downsizing video:', err)
      setDownsizeStatus('')
      setDownsizeProgress(0)
      throw new Error(`Failed to downsize video: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

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
      if (file.size > 500 * 1024 * 1024) {
        setError(`${file.name} exceeds the 500MB file size limit.`)
        continue
      }

      try {
        // Downsize the video before setting it
        const downsizedFile = await downsizeTo720p(file)

        // If we have an active upload type, use that
        if (activeUpload) {
          if (activeUpload === 'before') {
            setBeforeVideo(downsizedFile)
          } else {
            setAfterVideo(downsizedFile)
          }
          setActiveUpload(null)
        } 
        // Otherwise, try to determine which video to set
        else {
          if (!beforeVideo) {
            setBeforeVideo(downsizedFile)
          } else if (!afterVideo) {
            setAfterVideo(downsizedFile)
          } else {
            setError('Please select which video you want to upload (Before or After)')
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process video')
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
    formData.append('id', String(id))
    formData.append('beforeVideo', beforeVideo)
    formData.append('afterVideo', afterVideo)

    try {
      const response = await fetch('/api/vid/', {
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

          {/* Downsize Progress Indicator */}
          {downsizeStatus && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-700">{downsizeStatus}</p>
                </div>
                <span className="text-sm font-semibold text-blue-700">{downsizeProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downsizeProgress}%` }}
                ></div>
              </div>
              {downsizeProgress === 0 && downsizeStatus.includes('Loading FFmpeg') && (
                <p className="text-xs text-blue-600 mt-2">First time setup takes 10-15 seconds...</p>
              )}
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
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">{beforeVideo.name}</span>
                      <span className="text-xs text-gray-500">
                        {(beforeVideo.size / (1024 * 1024)).toFixed(2)} MB (720p)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo('before')}
                    className="text-red-500 hover:text-red-700"
                    disabled={!!downsizeStatus}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveUpload('before')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!!downsizeStatus}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload Before video</p>
                  <p className="text-xs text-gray-500 mt-1">Will be downsized to 720p in browser</p>
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
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">{afterVideo.name}</span>
                      <span className="text-xs text-gray-500">
                        {(afterVideo.size / (1024 * 1024)).toFixed(2)} MB (720p)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo('after')}
                    className="text-red-500 hover:text-red-700"
                    disabled={!!downsizeStatus}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveUpload('after')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!!downsizeStatus}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload After video</p>
                  <p className="text-xs text-gray-500 mt-1">Will be downsized to 720p in browser</p>
                </button>
              )}
            </div>
          </div>

          {activeUpload && !downsizeStatus && (
            <div className="mb-8">
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-blue-500" />
                  <span className="text-blue-700 font-medium">
                    Select {activeUpload === 'before' ? 'Before' : 'After'} Treatment video
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
              disabled={!beforeVideo || !afterVideo || isProcessing || !!downsizeStatus}
              className={`px-8 py-4 rounded-lg text-white font-semibold flex items-center gap-2
                ${(!beforeVideo || !afterVideo || isProcessing || downsizeStatus) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isProcessing ? (
                <>
                  <div className="spinner border-4 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
                  Analyzing Videos...
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