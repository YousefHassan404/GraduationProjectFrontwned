import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import {
  ChatSession,
  SessionHistory,
  ChatMessage as ChatMessageType,
} from "@shared/api";
import {
  Send,
  Loader2,
  Plus,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit2,
  X,
  Download,
  FileText,
} from "lucide-react";
import { downloadPDF, getErrorMessage } from "@/lib/utils";
import { Navigate } from "react-router-dom";

export default function Chat() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [reportGenerating, setReportGenerating] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await apiClient.getSessions();
      setSessions(response.sessions);
      if (response.sessions.length > 0 && !activeSessionId) {
        setActiveSessionId(response.sessions[0].sessionId);
        loadSessionHistory(response.sessions[0].sessionId);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const history = await apiClient.getSessionHistory(sessionId);
      setMessages(history.messages);
      setActiveSessionId(sessionId);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setError("");
    setSuccess("");

    try {
      setIsLoading(true);

      const response = await apiClient.sendMessage({
        message: userMessage,
        sessionId: activeSessionId || undefined,
        includeContext: true,
        language: "ar",
      });

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.response,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Update active session if new
      if (!activeSessionId) {
        setActiveSessionId(response.sessionId);
      }

      // Reload sessions
      await loadSessions();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await apiClient.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      setSuccess("Session deleted");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateSessionTitle = async (sessionId: string) => {
    if (!editingTitle.trim()) return;

    try {
      await apiClient.updateSessionTitle(sessionId, editingTitle);
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId ? { ...s, title: editingTitle } : s
        )
      );
      setEditingSessionId(null);
      setEditingTitle("");
      setSuccess("Session title updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const newSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputValue("");
    setMobileMenuOpen(false);
  };

  const handleGenerateReport = async (sessionId: string, audience: "doctor" | "patient" = "doctor") => {
    if (!sessionId) {
      setError("No active session to generate report");
      return;
    }

    try {
      setReportGenerating(sessionId);
      setError("");
      const reportBlob = await apiClient.generatePDFReport({
        sessionId,
        audience,
      });
      const filename = `brain-tumor-report-${new Date().getTime()}.pdf`;
      downloadPDF(reportBlob, filename);
      setSuccess("Report downloaded successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(`Failed to generate report: ${errorMsg}`);
    } finally {
      setReportGenerating(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Sidebar - Sessions List */}
        <aside
          className={`${
            mobileMenuOpen ? "fixed" : "hidden"
          } md:relative md:flex w-full md:w-64 border-r border-slate-200 bg-white/80 backdrop-blur flex-col transition-all z-40`}
        >
          <div className="p-4 border-b border-slate-200">
            <Button
              onClick={newSession}
              className="w-full gap-2"
              size="sm"
            >
              <Plus size={18} />
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-8">
                No chat sessions yet
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.sessionId} className="group">
                    {editingSessionId === session.sessionId ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateSessionTitle(session.sessionId)
                          }
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          loadSessionHistory(session.sessionId);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium ${
                          activeSessionId === session.sessionId
                            ? "bg-blue-100 text-blue-900"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="truncate">{session.title}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </div>
                      </button>
                    )}

                    {activeSessionId === session.sessionId && (
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-8"
                          onClick={() => handleGenerateReport(session.sessionId)}
                          disabled={reportGenerating === session.sessionId}
                          title="Generate PDF report"
                        >
                          {reportGenerating === session.sessionId ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-8"
                          onClick={() => {
                            setEditingSessionId(session.sessionId);
                            setEditingTitle(session.title);
                          }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-8"
                          onClick={() => handleDeleteSession(session.sessionId)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={18} />
              Close
            </Button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-200 bg-white/80 backdrop-blur px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                ☰
              </button>
              <h2 className="text-lg font-semibold text-slate-900">
                {activeSessionId ? "Chat with AI" : "New Chat"}
              </h2>
            </div>
            {activeSessionId && messages.length > 0 && (
              <Button
                onClick={() => handleGenerateReport(activeSessionId)}
                disabled={reportGenerating === activeSessionId}
                size="sm"
                className="gap-2"
              >
                {reportGenerating === activeSessionId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span className="hidden sm:inline">Download Report</span>
                <FileText size={16} className="sm:hidden" />
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Start a New Conversation
                </h3>
                <p className="text-slate-600 max-w-md">
                  Ask our AI assistant about brain tumor analysis, symptoms, diagnosis, and treatment options.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 animate-fade-in ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {msg.timestamp && (
                        <p
                          className={`text-xs mt-2 ${
                            msg.role === "user"
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white/80 backdrop-blur p-4 sm:p-6">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about brain tumor analysis..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="gap-2"
              >
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
