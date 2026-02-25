import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { MedicalRecord } from "@shared/api";
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
  Search,
  FileText,
  Image as ImageIcon,
  Filter,
  HardDrive,
  FileJson,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/utils";

export default function Records() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"" | "pdf" | "image">("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load records on mount
  useEffect(() => {
    loadRecords();
  }, []);

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading records...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const loadRecords = async () => {
    try {
      setRecordsLoading(true);
      const response = await apiClient.getMedicalRecords(
        100,
        0,
        searchQuery || undefined,
        filterType || undefined
      );
      setRecords(response.records);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate files
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    let hasError = false;
    for (let file of Array.from(files)) {
      if (file.size > maxSize) {
        setError("File size must be less than 50MB");
        hasError = true;
        break;
      }

      if (!validTypes.includes(file.type)) {
        setError("Only PDF and image files are supported");
        hasError = true;
        break;
      }
    }

    if (hasError) return;

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const response = await apiClient.uploadMedicalRecords(files);
      setSuccess(
        `Successfully uploaded ${response.uploadedFiles.length} file(s)`
      );

      // Reload records
      await loadRecords();

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    // Note: Delete endpoint not provided in API, so this is a placeholder
    setError("Delete functionality not yet implemented");
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchQuery === "" ||
      (record.fileName && record.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.content && record.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filterType === "" || 
      (record.fileType && record.fileType.toLowerCase() === filterType);

    return matchesSearch && matchesFilter;
  });

  // Get file type icon
  const getFileIcon = (fileType?: string) => {
    if (fileType === "PDF") {
      return <FileText className="w-6 h-6 text-red-400" />;
    } else if (fileType === "Image") {
      return <ImageIcon className="w-6 h-6 text-green-400" />;
    } else {
      return <FileJson className="w-6 h-6 text-blue-400" />;
    }
  };

  // Get file type color
  const getFileTypeColor = (fileType?: string) => {
    if (fileType === "PDF") {
      return "bg-red-500/10 text-red-400 border-red-500/30";
    } else if (fileType === "Image") {
      return "bg-green-500/10 text-green-400 border-green-500/30";
    } else {
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
              Medical Records
            </h1>
            <p className="text-slate-400 text-lg">
              Upload and manage your medical records for AI analysis
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl backdrop-blur-sm flex gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm flex-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl backdrop-blur-sm flex gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm flex-1">{success}</p>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-600/30 mb-6">
                  <Upload size={36} className="text-white" />
                </div>

                <h3 className="text-2xl font-semibold text-white mb-3">
                  Upload Medical Records
                </h3>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                  Upload PDF reports and medical images (JPG, PNG, GIF) for AI analysis. 
                  Maximum file size: 50MB per file.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />

                <Button
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 px-8"
                >
                  {isLoading && <Loader2 size={20} className="animate-spin mr-2" />}
                  <Upload size={20} className="mr-2" />
                  {isLoading ? "Uploading..." : "Choose Files"}
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  loadRecords();
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  loadRecords();
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none"
              >
                <option value="" className="bg-slate-800">All Types</option>
                <option value="pdf" className="bg-slate-800">PDF Documents</option>
                <option value="image" className="bg-slate-800">Images</option>
              </select>
            </div>
          </div>

          {/* Records List */}
          {recordsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-slate-400">Loading your records...</p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700/50 rounded-2xl mb-6">
                <FileText size={36} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                No records found
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {records.length === 0
                  ? "Upload your first medical record to get started with AI analysis"
                  : "Try adjusting your search or filter to find what you're looking for"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.recordId}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      record.fileType === "PDF" 
                        ? "bg-red-500/10 border-red-500/30" 
                        : record.fileType === "Image"
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-blue-500/10 border-blue-500/30"
                    }`}>
                      {getFileIcon(record.fileType)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-white text-lg mb-1 truncate group-hover:text-blue-400 transition">
                            {record.fileName || "Untitled Document"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getFileTypeColor(record.fileType)}`}>
                              {record.fileType || "Unknown"}
                            </span>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <HardDrive size={14} />
                              {new Date(record.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (record.fileUrl) {
                                window.open(record.fileUrl, "_blank");
                              }
                            }}
                            className="border-slate-700 bg-slate-800 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.recordId)}
                            className="border-slate-700 bg-slate-800 hover:bg-red-600 hover:border-red-600 transition-all duration-300"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      
                      {record.content && (
                        <p className="text-sm text-slate-400 mt-3 line-clamp-2 border-t border-slate-700/50 pt-3">
                          {record.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {records.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">Total Records</span>
                  <HardDrive size={18} className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {records.length}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Across all types
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">PDF Documents</span>
                  <FileText size={18} className="text-red-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {records.filter((r) => r.fileType === "PDF").length}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Medical reports and documents
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">Images</span>
                  <ImageIcon size={18} className="text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {records.filter((r) => r.fileType === "Image").length}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Medical scans and images
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}