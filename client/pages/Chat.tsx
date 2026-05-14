import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ChatSession, ChatMessage as ChatMessageType } from "@shared/api";
import { Send, Loader2, Plus, AlertCircle, CheckCircle, Trash2, Edit2, X, Download, FileText, MessageSquare, Menu, History } from "lucide-react";
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

  if (authLoading) return <Layout><LoadingSpinner message="Loading chat..." /></Layout>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const loadSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const response = await apiClient.getSessions();
      setSessions(response.sessions);
      setActiveSessionId((prev) => {
        if (!prev && response.sessions.length > 0) {
          apiClient.getSessionHistory(response.sessions[0].sessionId)
            .then((history) => setMessages(history.messages))
            .catch((err) => setError(getErrorMessage(err)));
          return response.sessions[0].sessionId;
        }
        return prev;
      });
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const history = await apiClient.getSessionHistory(sessionId);
      setMessages(history.messages);
      setActiveSessionId(sessionId);
      setMobileMenuOpen(false);
    } catch (err: any) { setError(getErrorMessage(err)); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userMessage = inputValue;
    setInputValue(""); setError(""); setSuccess("");
    try {
      setIsLoading(true);
      const response = await apiClient.sendMessage({ message: userMessage, sessionId: activeSessionId || undefined, includeContext: true, language: "ar" });
      setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date().toISOString() }]);
      setMessages((prev) => [...prev, { role: "assistant", content: response.response, timestamp: new Date().toISOString() }]);
      if (!activeSessionId) setActiveSessionId(response.sessionId);
      await loadSessions();
    } catch (err: any) { setError(getErrorMessage(err)); }
    finally { setIsLoading(false); }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await apiClient.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      if (activeSessionId === sessionId) { setActiveSessionId(null); setMessages([]); }
      setSuccess("Session deleted"); setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) { setError(getErrorMessage(err)); }
  };

  const handleUpdateSessionTitle = async (sessionId: string) => {
    if (!editingTitle.trim()) return;
    try {
      await apiClient.updateSessionTitle(sessionId, editingTitle);
      setSessions((prev) => prev.map((s) => s.sessionId === sessionId ? { ...s, title: editingTitle } : s));
      setEditingSessionId(null); setEditingTitle("");
      setSuccess("Session title updated"); setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) { setError(getErrorMessage(err)); }
  };

  const newSession = () => { setActiveSessionId(null); setMessages([]); setInputValue(""); setMobileMenuOpen(false); };

  const handleGenerateReport = async (sessionId: string, audience: "doctor" | "patient" = "doctor") => {
    if (!sessionId) { setError("No active session to generate report"); return; }
    try {
      setReportGenerating(sessionId); setError("");
      const reportBlob = await apiClient.generatePDFReport({ sessionId, audience });
      downloadPDF(reportBlob, `brain-tumor-report-${Date.now()}.pdf`);
      setSuccess("Report downloaded successfully"); setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) { setError(`Failed to generate report: ${getErrorMessage(err)}`); }
    finally { setReportGenerating(null); }
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatSessionDate = (ds: string) => {
    const d = new Date(ds), today = new Date(), yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">

        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"} md:relative md:flex w-full md:w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 backdrop-blur-xl flex-col transition-all`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Chat History</h2>
              </div>
              <button className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <Button onClick={newSession} className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25" size="sm">
              <Plus size={18} /> New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No chat sessions yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start a new conversation</p>
              </div>
            ) : sessions.map((session) => (
              <div key={session.sessionId} className="group">
                {editingSessionId === session.sessionId ? (
                  <div className="flex gap-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} autoFocus placeholder="Enter session title"
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    <Button size="sm" variant="outline" onClick={() => handleUpdateSessionTitle(session.sessionId)}
                      className="border-slate-200 dark:border-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white">Save</Button>
                  </div>
                ) : (
                  <button onClick={() => loadSessionHistory(session.sessionId)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeSessionId === session.sessionId
                      ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium truncate max-w-[160px] ${activeSessionId === session.sessionId ? "text-blue-500 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                        {session.title}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatSessionDate(session.updatedAt)}</span>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(session.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                )}

                {activeSessionId === session.sessionId && !editingSessionId && (
                  <div className="flex items-center gap-1 mt-1 px-2">
                    {[
                      { label: "Report", icon: reportGenerating === session.sessionId ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />, onClick: () => handleGenerateReport(session.sessionId), disabled: reportGenerating === session.sessionId, color: "hover:text-blue-400 hover:bg-blue-600/10" },
                      { label: "Edit", icon: <Edit2 size={14} />, onClick: () => { setEditingSessionId(session.sessionId); setEditingTitle(session.title); }, disabled: false, color: "hover:text-green-400 hover:bg-green-600/10" },
                      { label: "Delete", icon: <Trash2 size={14} />, onClick: () => handleDeleteSession(session.sessionId), disabled: false, color: "hover:text-red-400 hover:bg-red-600/10" },
                    ].map((btn) => (
                      <Button key={btn.label} size="sm" variant="ghost" disabled={btn.disabled} onClick={btn.onClick}
                        className={`flex-1 h-8 text-slate-500 dark:text-slate-400 ${btn.color}`}>
                        {btn.icon}<span className="ml-1 text-xs">{btn.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
        </aside>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 backdrop-blur-xl px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  {activeSessionId ? sessions.find(s => s.sessionId === activeSessionId)?.title || "Chat with AI" : "New Chat"}
                </h2>
                {activeSessionId && messages.length > 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            {activeSessionId && messages.length > 0 && (
              <Button onClick={() => handleGenerateReport(activeSessionId)} disabled={reportGenerating === activeSessionId} size="sm"
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-600/25">
                {reportGenerating === activeSessionId ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                <span className="hidden sm:inline">Download Report</span>
              </Button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm flex-1">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex gap-3">
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-600 dark:text-green-300 text-sm flex-1">{success}</p>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">Start a New Conversation</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">Ask our AI assistant about brain tumor analysis, symptoms, diagnosis, and treatment options.</p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300">💡 "What are the early symptoms of brain tumors?"</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300">🔍 "Explain the different types of brain tumors"</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/25">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-xs sm:max-w-md lg:max-w-2xl px-5 py-3 rounded-2xl ${msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-lg shadow-blue-600/25"
                      : "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-lg"}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.timestamp && (
                        <p className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-200" : "text-slate-400 dark:text-slate-500"}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      )}
                    </div>
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

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6">
            <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about brain tumor analysis..." disabled={isLoading}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition" />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 px-6">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
