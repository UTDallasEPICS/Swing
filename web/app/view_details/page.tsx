"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { allTrials } from '../page';

export default function ViewDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const dob = searchParams.get("dob");
  const [selectedTrial, setSelectedTrial] = useState<string | null>(null);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Treatment Details</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium text-gray-900">{dob ? new Date(dob).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="font-medium text-gray-900">{id || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-4">
            {Object.entries(allTrials).map(([trialId, trial]) => (
              <button
                key={trialId}
                onClick={() => setSelectedTrial(trialId)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedTrial === trialId
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {trial.name}
              </button>
            ))}
          </div>
        </div>

        {selectedTrial && allTrials[selectedTrial] ? (
          <div className="bg-white shadow-md rounded-xl p-8 border border-gray-200 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              Breakdown for {allTrials[selectedTrial].name}
            </h2>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-white">
                    <th className="px-6 py-3 text-left font-semibold text-sm text-gray-900"></th>
                    <th className="px-6 py-3 text-left font-semibold text-sm text-gray-900">Before</th>
                    <th className="px-6 py-3 text-left font-semibold text-sm text-gray-900">After</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {allTrials[selectedTrial].metrics.map((m: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="px-6 py-4 text-sm text-gray-900">{m.label}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{m.before || m.value}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{m.after || m.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {allTrials[selectedTrial].notes && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Clinical Notes</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {allTrials[selectedTrial].notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl p-12 border border-gray-200 text-center">
            <p className="text-gray-500 text-lg">Please select a trial to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}