'use client'

import Image from 'next/image'
import { Upload } from 'lucide-react'
import { useState, useCallback } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  
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
    
    const file = e.dataTransfer.files?.[0]
    handleFileUpload(file)
  }, [])

  const handleFileUpload = (file?: File) => {
    if (!file) return
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/avi', 'video/x-matroska', 'video/webm']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid video file')
      return
    }
    
    // Validate file size (50MB = 50 * 1024 * 1024 bytes)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB')
      return
    }
    
    setVideoFile(file)
    // Here you would typically upload the file to your server
    console.log('File ready for upload:', file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleFileUpload(file)
  }

  return (
    <main className={styles.main}>
      <div>
        <h1 className={styles.title}>Upload your video here</h1>
      </div>
      
      <div 
        className={`${styles.uploadContainer} ${dragActive ? 'border-blue-500 bg-blue-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={styles.uploadArea}>
          <div className={styles.uploadIcon}>
            <Image src="/Uploadicon.svg" alt="Upload icon" width={48} height={48} />
          </div>
          <p className={styles.uploadText}>Drag or select a video file to upload</p>
          <p className={styles.uploadSubtext}>mp4, mov, wmv, flv, avi, mkv, webm</p>
          <p className={styles.uploadSubtext}>Less than 30 seconds and 50 MB</p>
        </div>
        
        <div className={styles.buttonContainer}>
        <label className={styles.fileInputLabel}>
            <input
              id="file-upload"
              type="file"
              className={styles.fileInput}
              accept="video/mp4,video/quicktime,video/x-ms-wmv,video/x-flv,video/avi,video/x-matroska,video/webm"
              onChange={handleFileSelect}
            />
            <div className={styles.selectFileButton}>
              <Upload className="w-4 h-4 mr-2" />
              Select File
            </div>
          </label>
        </div>
        
        
      
      </div>
      
    </main>
    
  )
  
}