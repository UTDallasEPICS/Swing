'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

interface AnalysisResults {
  beforeResult: string;
  afterResult: string;
  improvementResult: string;
}

interface ImprovementStatus {
  overall_score: number;
  improved: boolean;
  criteria: {
    range_of_motion: boolean;
    smoothness: boolean;
  };
  details: {
    range_of_motion: {
      score: number;
      details: {
        upper_arm: number;
        forearm: number;
      };
    };
    smoothness: {
      score: number;
      details: {
        upper_arm: number;
        forearm: number;
      };
    };
  };
  statistics: {
    range_of_motion: {
      upper_arm: {
        statistic: number;
        p_value: number;
        significant: boolean;
      };
      forearm: {
        statistic: number;
        p_value: number;
        significant: boolean;
      };
    };
    smoothness: {
      upper_arm: {
        statistic: number;
        p_value: number;
        significant: boolean;
      };
      forearm: {
        statistic: number;
        p_value: number;
        significant: boolean;
      };
    };
  };
}

export default function Results() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [improvementStatus, setImprovementStatus] = useState<ImprovementStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const beforeResult = searchParams.get('before')
        const afterResult = searchParams.get('after')
        const improvementResult = searchParams.get('improvement')

        if (!beforeResult || !afterResult || !improvementResult) {
          setError('Missing analysis results')
          return
        }

        setResults({
          beforeResult,
          afterResult,
          improvementResult,
        })

        // Fetch improvement analysis
        const improvementResponse = await fetch(improvementResult)
        if (!improvementResponse.ok) {
          throw new Error('Failed to fetch improvement analysis')
        }
        const improvementData = await improvementResponse.json()
        console.log('Raw improvement data:', JSON.stringify(improvementData, null, 2))
        console.log('Data keys:', Object.keys(improvementData))
        console.log('Statistics keys:', Object.keys(improvementData.statistics || {}))
        console.log('Range of motion keys:', Object.keys(improvementData.statistics?.range_of_motion || {}))
        console.log('Smoothness keys:', Object.keys(improvementData.statistics?.smoothness || {}))
        setImprovementStatus(improvementData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  // Add debug logging for the rendered values
  useEffect(() => {
    if (improvementStatus) {
      console.log('Current improvement status:', improvementStatus)
      console.log('Range of motion p-values:', {
        upper_arm: improvementStatus.statistics?.range_of_motion?.upper_arm?.p_value,
        forearm: improvementStatus.statistics?.range_of_motion?.forearm?.p_value
      })
      console.log('Smoothness p-values:', {
        upper_arm: improvementStatus.statistics?.smoothness?.upper_arm?.p_value,
        forearm: improvementStatus.statistics?.smoothness?.forearm?.p_value
      })
    }
  }, [improvementStatus])

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
        <div className="text-center">
          <div className="spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </main>
    )
  }

  if (!results || !improvementStatus) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
        <div className="text-center">
          <p className="text-gray-600">No results found</p>
        </div>
      </main>
    )
  }

  // Calculate the actual improvement percentage
  const improvementPercentage = ((improvementStatus.overall_score - 1) * 100).toFixed(1)
  const isImprovement = improvementStatus.overall_score > 1.0

  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Analysis Results</h1>

      {imageError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 w-full max-w-6xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{imageError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      <div className="w-full max-w-6xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Range of Motion */}
          <div className={`p-4 rounded-lg shadow-sm ${
            improvementStatus?.criteria?.range_of_motion 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="font-medium text-gray-900 mb-2">Range of Motion</h3>
            <div className="flex items-center mb-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${improvementStatus?.criteria?.range_of_motion ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {((improvementStatus?.details?.range_of_motion?.score - 1) * 100).toFixed(1)}% {improvementStatus?.criteria?.range_of_motion ? 'improvement' : 'degradation'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Upper Arm Movement</span>
                  <span className="font-medium">
                    {((improvementStatus?.details?.range_of_motion?.details?.upper_arm - 1) * 100).toFixed(1)}%
                    <span className={`ml-2 text-xs ${improvementStatus?.statistics?.range_of_motion?.upper_arm?.significant ? 'text-green-600' : 'text-gray-400'}`}>
                      (p = {improvementStatus?.statistics?.range_of_motion?.upper_arm?.p_value?.toFixed(3) ?? 'N/A'})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Forearm Movement</span>
                  <span className="font-medium">
                    {((improvementStatus?.details?.range_of_motion?.details?.forearm - 1) * 100).toFixed(1)}%
                    <span className={`ml-2 text-xs ${improvementStatus?.statistics?.range_of_motion?.forearm?.significant ? 'text-green-600' : 'text-gray-400'}`}>
                      (p = {improvementStatus?.statistics?.range_of_motion?.forearm?.p_value?.toFixed(3) ?? 'N/A'})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Movement Smoothness */}
          <div className={`p-4 rounded-lg shadow-sm ${
            improvementStatus?.criteria?.smoothness 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="font-medium text-gray-900 mb-2">Movement Smoothness</h3>
            <div className="flex items-center mb-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${improvementStatus?.criteria?.smoothness ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {((improvementStatus?.details?.smoothness?.score - 1) * 100).toFixed(1)}% {improvementStatus?.criteria?.smoothness ? 'improvement' : 'degradation'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Upper Arm Smoothness</span>
                  <span className="font-medium">
                    {((improvementStatus?.details?.smoothness?.details?.upper_arm - 1) * 100).toFixed(1)}%
                    <span className={`ml-2 text-xs ${improvementStatus?.statistics?.smoothness?.upper_arm?.significant ? 'text-green-600' : 'text-gray-400'}`}>
                      (p = {improvementStatus?.statistics?.smoothness?.upper_arm?.p_value?.toFixed(3) ?? 'N/A'})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Forearm Smoothness</span>
                  <span className="font-medium">
                    {((improvementStatus?.details?.smoothness?.details?.forearm - 1) * 100).toFixed(1)}%
                    <span className={`ml-2 text-xs ${improvementStatus?.statistics?.smoothness?.forearm?.significant ? 'text-green-600' : 'text-gray-400'}`}>
                      (p = {improvementStatus?.statistics?.smoothness?.forearm?.p_value?.toFixed(3) ?? 'N/A'})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistical Significance Legend */}
      <div className="w-full max-w-6xl mb-8 text-sm text-gray-600">
        <p className="text-center">
          <span className="text-green-600">Green p-values</span> indicate statistically significant improvements (p &lt; 0.05)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Before Treatment Results */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Before Treatment</h2>
          <div className="relative aspect-square w-full">
            <Image
              src={results.beforeResult}
              alt="Before Treatment Analysis"
              fill
              className="object-contain"
              unoptimized
              onError={() => setImageError('Failed to load analysis images. Please try uploading the videos again.')}
            />
          </div>
        </div>

        {/* After Treatment Results */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">After Treatment</h2>
          <div className="relative aspect-square w-full">
            <Image
              src={results.afterResult}
              alt="After Treatment Analysis"
              fill
              className="object-contain"
              unoptimized
              onError={() => setImageError('Failed to load analysis images. Please try uploading the videos again.')}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          The graphs show the position, velocity, and acceleration of the arm joints over time.
          Compare the patterns between before and after treatment to assess improvement.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload New Videos
        </a>
      </div>
    </main>
  )
} 