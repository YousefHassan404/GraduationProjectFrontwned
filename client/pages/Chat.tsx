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
  MessageSquare,
  Menu,
  History,
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
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading chat...</p>
          </div>
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
      setMobileMenuOpen(false);
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

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date for session
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Sidebar - Sessions List */}
        <aside
          className={`${
            mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"
          } md:relative md:flex w-full md:w-80 border-r border-slate-700 bg-slate-800/95 backdrop-blur-xl flex-col transition-all`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h2 className="font-semibold text-white">Chat History</h2>
              </div>
              <button
                className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <Button
              onClick={newSession}
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25"
              size="sm"
            >
              <Plus size={18} />
              New Chat
            </Button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  No chat sessions yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Start a new conversation
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.sessionId} className="group">
                  {editingSessionId === session.sessionId ? (
                    <div className="flex gap-2 p-2 bg-slate-700/50 rounded-lg">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        autoFocus
                        placeholder="Enter session title"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateSessionTitle(session.sessionId)}
                        className="border-slate-600 hover:bg-blue-600 hover:border-blue-600"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => loadSessionHistory(session.sessionId)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeSessionId === session.sessionId
                          ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30"
                          : "hover:bg-slate-700/50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium truncate max-w-[160px] ${
                          activeSessionId === session.sessionId
                            ? "text-blue-400"
                            : "text-slate-300"
                        }`}>
                          {session.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatSessionDate(session.updatedAt)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(session.updatedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </button>
                  )}

                  {/* Session Actions */}
                  {activeSessionId === session.sessionId && !editingSessionId && (
                    <div className="flex items-center gap-1 mt-1 px-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 h-8 text-slate-400 hover:text-blue-400 hover:bg-blue-600/10"
                        onClick={() => handleGenerateReport(session.sessionId)}
                        disabled={reportGenerating === session.sessionId}
                        title="Generate PDF report"
                      >
                        {reportGenerating === session.sessionId ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        <span className="ml-1 text-xs">Report</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 h-8 text-slate-400 hover:text-green-400 hover:bg-green-600/10"
                        onClick={() => {
                          setEditingSessionId(session.sessionId);
                          setEditingTitle(session.title);
                        }}
                        title="Edit title"
                      >
                        <Edit2 size={14} />
                        <span className="ml-1 text-xs">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 h-8 text-slate-400 hover:text-red-400 hover:bg-red-600/10"
                        onClick={() => handleDeleteSession(session.sessionId)}
                        title="Delete session"
                      >
                        <Trash2 size={14} />
                        <span className="ml-1 text-xs">Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu size={20} className="text-slate-400" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  {activeSessionId ? (
                    sessions.find(s => s.sessionId === activeSessionId)?.title || "Chat with AI"
                  ) : (
                    "New Chat"
                  )}
                </h2>
                {activeSessionId && messages.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            
            {activeSessionId && messages.length > 0 && (
              <Button
                onClick={() => handleGenerateReport(activeSessionId)}
                disabled={reportGenerating === activeSessionId}
                size="sm"
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-600/25"
              >
                {reportGenerating === activeSessionId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FileText size={16} />
                )}
                <span className="hidden sm:inline">Download Report</span>
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Alerts */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl backdrop-blur-sm flex gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm flex-1">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-xl backdrop-blur-sm flex gap-3">
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-300 text-sm flex-1">{success}</p>
              </div>
            )}

            {/* Messages */}
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Start a New Conversation
                </h3>
                <p className="text-slate-400 max-w-md">
                  Ask our AI assistant about brain tumor analysis, symptoms, diagnosis, and treatment options.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-300">💡 "What are the early symptoms of brain tumors?"</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-300">🔍 "Explain the different types of brain tumors"</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 animate-fade-in ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar for assistant */}
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/25">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-xs sm:max-w-md lg:max-w-2xl px-5 py-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-lg shadow-blue-600/25"
                          : "bg-slate-800/90 text-slate-200 border border-slate-700 rounded-bl-none shadow-lg"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.timestamp && (
                        <p
                          className={`text-xs mt-2 ${
                            msg.role === "user"
                              ? "text-blue-200"
                              : "text-slate-500"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      )}
                    </div>

                    {/* Avatar for user */}
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-600/25">
                        <span className="text-white text-sm font-semibold">U</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6">
            <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about brain tumor analysis..."
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 px-6"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}