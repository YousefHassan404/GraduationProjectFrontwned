import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  FlaskConical,
  Upload,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  FileImage,
  X,
  MessageSquare,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

interface DoctorOption {
  id: string;
  name: string;
  email: string;
}

export default function LabPortal() {
  const { user } = useAuth();

  // Doctor search
  const [doctorEmail, setDoctorEmail] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption | null>(null);
  const [doctorSearchLoading, setDoctorSearchLoading] = useState(false);
  const [doctorError, setDoctorError] = useState("");

  // MRI files
  const [mriFiles, setMriFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Message
  const [message, setMessage] = useState("");

  // Submission
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [sentSessionId, setSentSessionId] = useState<string | null>(null);

  // ── Doctor lookup ──────────────────────────────────────────────────────────
  const handleFindDoctor = async () => {
    if (!doctorEmail.trim() || !doctorEmail.includes("@")) {
      setDoctorError("Please enter a valid doctor email address.");
      return;
    }
    setDoctorError("");
    setSelectedDoctor(null);
    setDoctorSearchLoading(true);
    try {
      const profile = await apiClient.getDoctorByEmail(doctorEmail.trim());
      setSelectedDoctor(profile);
    } catch (err: any) {
      setDoctorError(
        getErrorMessage(err) || "Doctor not found. Check the email and try again."
      );
    } finally {
      setDoctorSearchLoading(false);
    }
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) =>
      ["image/jpeg", "image/png", "image/bmp", "image/gif"].includes(f.type)
    );
    const invalid = Array.from(incoming).length - valid.length;
    if (invalid > 0)
      setError(`${invalid} file(s) skipped — only JPG, PNG, BMP, GIF images are accepted.`);
    setMriFiles((prev) => [...prev, ...valid]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setMriFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Send MRI to doctor ─────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!selectedDoctor) {
      setError("Please find and select a doctor first.");
      return;
    }
    if (mriFiles.length === 0) {
      setError("Please attach at least one MRI image.");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      // 1. Upload MRI files as medical records to get URLs
      const dt = new DataTransfer();
      mriFiles.forEach((f) => dt.items.add(f));
      const uploadResponse = await apiClient.uploadMedicalRecords(dt.files);

      // 2. Build the chat message with file links + optional note
      const fileLinks = uploadResponse.uploadedFiles
        .map((f) => `📎 [${f.fileName}](${f.url})`)
        .join("\n");

      const fullMessage = [
        `🏥 **MRI scan(s) from ${user?.name ?? "Radiology Lab"}**`,
        message.trim() ? `\n📝 Note: ${message.trim()}` : "",
        `\n${fileLinks}`,
      ]
        .filter(Boolean)
        .join("\n");

      // 3. Send as a chat message directly to the doctor
      const chatResponse = await apiClient.sendMessageToDoctor({
        doctorId: selectedDoctor.id,
        message: fullMessage,
      });

      setSentSessionId(chatResponse.sessionId);
      setSuccess(
        `MRI scan(s) sent successfully to Dr. ${selectedDoctor.name}. They will see it in their chat.`
      );

      // Reset form
      setMriFiles([]);
      setMessage("");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* ── Header ── */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <FlaskConical size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Lab Portal
                </h1>
                <p className="text-slate-400 dark:text-slate-400 text-sm mt-0.5">
                  Send MRI scans directly to doctors — no patient handoff needed
                </p>
              </div>
            </div>
          </div>

          {/* ── Alerts ── */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm flex-1">{error}</p>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex gap-3">
              <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-emerald-600 dark:text-emerald-300 text-sm">{success}</p>
                {sentSessionId && (
                  <p className="text-xs text-slate-400 mt-1">
                    Session ID:{" "}
                    <span className="font-mono text-emerald-500">{sentSessionId}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 1: Find Doctor ── */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Find Doctor
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={doctorEmail}
                    onChange={(e) => {
                      setDoctorEmail(e.target.value);
                      setSelectedDoctor(null);
                      setDoctorError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleFindDoctor()}
                    placeholder="Doctor's email address"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                  />
                </div>
                <Button
                  onClick={handleFindDoctor}
                  disabled={doctorSearchLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 px-5"
                >
                  {doctorSearchLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Find"
                  )}
                </Button>
              </div>

              {doctorError && (
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle size={14} /> {doctorError}
                </p>
              )}

              {selectedDoctor && (
                <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {selectedDoctor.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedDoctor.email}
                    </p>
                  </div>
                  <CheckCircle size={20} className="text-emerald-500 ml-auto" />
                </div>
              )}
            </div>
          </div>

          {/* ── Step 2: Upload MRI ── */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Attach MRI Scans
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-slate-300 dark:border-slate-600 hover:border-emerald-500/60 hover:bg-emerald-500/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/bmp,image/gif"
                  onChange={(e) => addFiles(e.target.files)}
                  className="hidden"
                />
                <FileImage size={40} className="mx-auto text-emerald-500/60 mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Drag & drop MRI images or{" "}
                  <span className="text-emerald-500 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-2">JPG, PNG, BMP, GIF</p>
              </div>

              {/* File list */}
              {mriFiles.length > 0 && (
                <div className="space-y-2">
                  {mriFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <FileImage size={18} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Step 3: Add Note ── */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-slate-400 dark:bg-slate-600 text-white text-sm font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Add a Note{" "}
                <span className="text-sm font-normal text-slate-400">(optional)</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="relative">
                <MessageSquare size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Patient shows signs of headache and vision loss. Please review urgently."
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── Send Button ── */}
          <Button
            onClick={handleSend}
            disabled={sending || !selectedDoctor || mriFiles.length === 0}
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sending to Doctor...
              </>
            ) : (
              <>
                <Send size={20} />
                Send MRI to Doctor
              </>
            )}
          </Button>

          {/* ── Info box ── */}
          <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-medium">How it works: </span>
              The MRI images are uploaded to secure storage, then sent as a message directly into
              the doctor's chat. The doctor will see them the next time they open their chat — no
              patient involvement required.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
