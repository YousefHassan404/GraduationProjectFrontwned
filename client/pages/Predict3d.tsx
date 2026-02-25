import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Layout } from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Upload, Download, Eye, Loader2, AlertCircle, Trash2 } from "lucide-react";

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
      window.open(url, '_blank');
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

  // Get modality name
  const getModalityName = (index: number) => {
    const names = ['T1', 'T1GD', 'T2', 'FLAIR'];
    return names[index];
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            3D Brain Tumor Segmentation
          </h1>
          <p className="text-slate-400 mt-2">
            Upload multi-modal MRI scans for advanced 3D tumor analysis and segmentation
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Upload MRI Modalities
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select the four required NIfTI files (.nii.gz or .nii)
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* T1 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  T1-weighted <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".nii.gz,.nii"
                    onChange={(e) => handleFileChange(e, setT1File)}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:cursor-pointer file:transition-colors
                      bg-slate-900/50 rounded-lg border border-slate-700
                      cursor-pointer"
                  />
                </div>
                {t1File && (
                  <p className="text-xs text-slate-500 truncate">
                    Selected: {t1File.name}
                  </p>
                )}
              </div>

              {/* T1GD */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  T1-contrast enhanced (T1GD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".nii.gz,.nii"
                    onChange={(e) => handleFileChange(e, setT1gdFile)}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:cursor-pointer file:transition-colors
                      bg-slate-900/50 rounded-lg border border-slate-700
                      cursor-pointer"
                  />
                </div>
                {t1gdFile && (
                  <p className="text-xs text-slate-500 truncate">
                    Selected: {t1gdFile.name}
                  </p>
                )}
              </div>

              {/* T2 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  T2-weighted <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".nii.gz,.nii"
                    onChange={(e) => handleFileChange(e, setT2File)}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:cursor-pointer file:transition-colors
                      bg-slate-900/50 rounded-lg border border-slate-700
                      cursor-pointer"
                  />
                </div>
                {t2File && (
                  <p className="text-xs text-slate-500 truncate">
                    Selected: {t2File.name}
                  </p>
                )}
              </div>

              {/* FLAIR */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  FLAIR <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".nii.gz,.nii"
                    onChange={(e) => handleFileChange(e, setFlairFile)}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:cursor-pointer file:transition-colors
                      bg-slate-900/50 rounded-lg border border-slate-700
                      cursor-pointer"
                  />
                </div>
                {flairFile && (
                  <p className="text-xs text-slate-500 truncate">
                    Selected: {flairFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isUploading || status === 'processing'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Segmentation
                  </>
                )}
              </Button>

              {jobId && (
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="border-slate-700 bg-slate-800 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-400">Error</h3>
                    <p className="text-sm text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status and Results */}
        {(status === 'processing' || status === 'completed') && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                {status === 'processing' ? (
                  <>
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    Processing Job
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Segmentation Complete
                  </>
                )}
              </h2>
              {jobId && (
                <p className="text-sm text-slate-400 mt-1">
                  Job ID: <span className="font-mono text-blue-400">{jobId}</span>
                </p>
              )}
            </div>
            
            <div className="p-6">
              {status === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-slate-300 mt-6 text-center">
                    Processing your scan... This may take a minute.
                  </p>
                  <p className="text-sm text-slate-500 mt-2 text-center max-w-md">
                    Our AI model is analyzing the multi-modal MRI data and generating a 3D segmentation map.
                  </p>
                </div>
              )}

              {status === 'completed' && metrics && (
                <div className="space-y-6">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Tumor Type */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-sm text-slate-400 mb-1">Tumor Type</p>
                      <p className="text-xl font-semibold text-white capitalize">{metrics.tumor_type}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Confidence: {(metrics.classification_confidence * 100).toFixed(1)}%
                      </p>
                    </div>

                    {/* NCR */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-sm text-slate-400 mb-1">Necrotic Core (NCR)</p>
                      <p className="text-xl font-semibold text-white">{metrics.NCR.volume_cm3.toFixed(1)} cm³</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Confidence: {(metrics.NCR.confidence * 100).toFixed(0)}%
                      </p>
                    </div>

                    {/* ED */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-sm text-slate-400 mb-1">Edema (ED)</p>
                      <p className="text-xl font-semibold text-white">{metrics.ED.volume_cm3.toFixed(1)} cm³</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Confidence: {(metrics.ED.confidence * 100).toFixed(0)}%
                      </p>
                    </div>

                    {/* ET */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-sm text-slate-400 mb-1">Enhancing Tumor (ET)</p>
                      <p className="text-xl font-semibold text-white">{metrics.ET.volume_cm3.toFixed(1)} cm³</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Confidence: {(metrics.ET.confidence * 100).toFixed(0)}%
                      </p>
                    </div>

                    {/* Total Volume */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 sm:col-span-2">
                      <p className="text-sm text-slate-400 mb-1">Total Tumor Volume</p>
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        {metrics.Total.volume_cm3.toFixed(1)} cm³
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700">
                    <Button
                      onClick={handleDownloadMask}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Segmentation Mask
                    </Button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400 mr-2">View modalities:</span>
                      {[0, 1, 2, 3].map((index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewModality(index as 0 | 1 | 2 | 3)}
                          className="border-slate-700 bg-slate-800 hover:bg-slate-700"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {getModalityName(index)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}