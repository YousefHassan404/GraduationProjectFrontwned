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
          <Loader2 size={32} className="animate-spin text-blue-600" />
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

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Medical Records
            </h1>
            <p className="text-slate-600">
              Upload and manage your medical records for AI analysis
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Upload Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-xl p-12 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <Upload size={32} className="text-white" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Upload Medical Records
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Upload PDF reports and medical images (JPG, PNG, GIF) for AI analysis. Max 50MB per file.
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
                className="gap-2"
              >
                {isLoading && <Loader2 size={20} className="animate-spin" />}
                {isLoading ? "Uploading..." : "Choose Files"}
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
              }}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
            >
              <option value="">All Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="image">Images</option>
            </select>
          </div>

          {/* Records List */}
          {recordsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-xl border border-slate-200">
              <FileText size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No records found
              </h3>
              <p className="text-slate-600">
                {records.length === 0
                  ? "Upload your first medical record to get started"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.recordId}
                  className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {record.fileType === "PDF" ? (
                        <FileText size={24} className="text-blue-600" />
                      ) : (
                        <ImageIcon size={24} className="text-blue-600" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {record.fileName || "Untitled"}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {record.fileType || "Unknown"}
                        </span>
                        <span className="text-sm text-slate-600">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {record.content || "No content available"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          // Download file
                          if (record.fileUrl) {
                            window.open(record.fileUrl, "_blank");
                          }
                        }}
                      >
                        <Download size={18} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.recordId)}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {records.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-lg p-6 border border-slate-200">
                <div className="text-sm text-slate-600 mb-2">Total Records</div>
                <div className="text-3xl font-bold text-slate-900">
                  {records.length}
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-6 border border-slate-200">
                <div className="text-sm text-slate-600 mb-2">PDF Documents</div>
                <div className="text-3xl font-bold text-slate-900">
                  {records.filter((r) => r.fileType === "PDF").length}
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-6 border border-slate-200">
                <div className="text-sm text-slate-600 mb-2">Images</div>
                <div className="text-3xl font-bold text-slate-900">
                  {records.filter((r) => r.fileType === "Image").length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}