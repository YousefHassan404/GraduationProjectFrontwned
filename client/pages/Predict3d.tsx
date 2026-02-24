import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Layout } from '@/components/Layout';

export default function Predict3d() {
  // File state for each modality
  const [t1File, setT1File] = useState<File | null>(null);
  const [t1gdFile, setT1gdFile] = useState<File | null>(null);
  const [t2File, setT2File] = useState<File | null>(null);
  const [flairFile, setFlairFile] = useState<File | null>(null);

  // UI states
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Polling interval ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  // Submit job
  const handleSubmit = async () => {
    // Validate all files are selected
    if (!t1File || !t1gdFile || !t2File || !flairFile) {
      setError('Please select all four MRI modalities.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setStatus('idle');

    try {
      const response = await apiClient.submit3DSegmentationJob({
        t1: t1File,
        t1gd: t1gdFile,
        t2: t2File,
        flair: flairFile,
      });

      if (response.success) {
        setJobId(response.job_id);
        setStatus('processing');
        // Start polling for status
        startPolling(response.job_id);
      } else {
        setError('Submission failed. Please try again.');
        setStatus('error');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
      setStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Polling function
  const startPolling = (id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const statusResponse = await apiClient.get3DJobStatus(id);
        if (statusResponse.status === 'completed') {
          setStatus('completed');
          setMetrics(statusResponse.metrics);
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (statusResponse.status === 'error') {
          setError('Processing failed on server.');
          setStatus('error');
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
        // If still processing, keep polling
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job status.');
        setStatus('error');
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
    }, 3000); // poll every 3 seconds
  };

  // Download segmentation mask
  const handleDownloadMask = async () => {
    if (!jobId) return;
    try {
      const blob = await apiClient.download3DSegmentationMask(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segmentation_${jobId}.nii.gz`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download mask.');
    }
  };

  // View a modality
  const handleViewModality = async (modalityIndex: 0 | 1 | 2 | 3) => {
    if (!jobId) return;
    try {
      const blob = await apiClient.view3DModality(jobId, modalityIndex);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank'); // open in new tab for download/view
    } catch (err: any) {
      setError(err.message || 'Failed to view modality.');
    }
  };

  // Clear all data
  const handleClearAll = async () => {
    try {
      await apiClient.clearAll3DData();
      // Reset local state
      setT1File(null);
      setT1gdFile(null);
      setT2File(null);
      setFlairFile(null);
      setJobId(null);
      setStatus('idle');
      setMetrics(null);
      setError(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
    } catch (err: any) {
      setError(err.message || 'Failed to clear data.');
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">3D Brain Tumor Segmentation</h1>

        {/* File Upload Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Upload MRI Modalities</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Select the four required NIfTI files (.nii.gz).</p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {/* T1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">T1-weighted</label>
                  <input
                    type="file"
                    accept=".nii.gz,.nii"
                    onChange={(e) => handleFileChange(e, setT1File)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {t1File && <p className="mt-1 text-xs text-gray-500">{t1File.name}</p>}
                </div>

                {/* T1GD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">T1-contrast enhanced (T1GD)</label>
                  <input
                    type="file"
                    accept=".nii.gz,.nii"
                    onChange={(e) => handleFileChange(e, setT1gdFile)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {t1gdFile && <p className="mt-1 text-xs text-gray-500">{t1gdFile.name}</p>}
                </div>

                {/* T2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">T2-weighted</label>
                  <input
                    type="file"
                    accept=".nii.gz,.nii"
                    onChange={(e) => handleFileChange(e, setT2File)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {t2File && <p className="mt-1 text-xs text-gray-500">{t2File.name}</p>}
                </div>

                {/* FLAIR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">FLAIR</label>
                  <input
                    type="file"
                    accept=".nii.gz,.nii"
                    onChange={(e) => handleFileChange(e, setFlairFile)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {flairFile && <p className="mt-1 text-xs text-gray-500">{flairFile.name}</p>}
                </div>
              </div>

              <div className="mt-6 flex items-center space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={isUploading || status === 'processing'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Start Segmentation'}
                </button>

                {jobId && (
                  <button
                    onClick={handleClearAll}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear All Data
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status and Results */}
        {(status === 'processing' || status === 'completed') && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Job Status</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Job ID: {jobId}</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {status === 'processing' && (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-700">Processing your scan... This may take a minute.</span>
                </div>
              )}

              {status === 'completed' && metrics && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Segmentation Results</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="bg-gray-50 px-4 py-3 sm:rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">Tumor Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{metrics.tumor_type}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">Classification Confidence</dt>
                      <dd className="mt-1 text-sm text-gray-900">{(metrics.classification_confidence * 100).toFixed(1)}%</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">NCR (Necrotic Core)</dt>
                      <dd className="mt-1 text-sm text-gray-900">{metrics.NCR.volume_cm3.toFixed(1)} cm³ (conf: {(metrics.NCR.confidence * 100).toFixed(0)}%)</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">ED (Edema)</dt>
                      <dd className="mt-1 text-sm text-gray-900">{metrics.ED.volume_cm3.toFixed(1)} cm³ (conf: {(metrics.ED.confidence * 100).toFixed(0)}%)</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">ET (Enhancing Tumor)</dt>
                      <dd className="mt-1 text-sm text-gray-900">{metrics.ET.volume_cm3.toFixed(1)} cm³ (conf: {(metrics.ET.confidence * 100).toFixed(0)}%)</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">Total Tumor Volume</dt>
                      <dd className="mt-1 text-sm text-gray-900">{metrics.Total.volume_cm3.toFixed(1)} cm³</dd>
                    </div>
                  </dl>

                  {/* Action buttons for results */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={handleDownloadMask}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Download Segmentation Mask (.nii.gz)
                    </button>

                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        id="menu-button"
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={() => {}} // This would open a dropdown; for simplicity we add separate buttons below
                      >
                        View Modality
                        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {/* Simple dropdown: we'll just render separate buttons for clarity */}
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button onClick={() => handleViewModality(0)} className="px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">T1</button>
                      <button onClick={() => handleViewModality(1)} className="px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">T1GD</button>
                      <button onClick={() => handleViewModality(2)} className="px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">T2</button>
                      <button onClick={() => handleViewModality(3)} className="px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">FLAIR</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}