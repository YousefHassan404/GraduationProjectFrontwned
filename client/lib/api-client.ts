import {
  AuthRequest,
  AuthResponse,
  ChatRequest,
  ChatResponse,
  SessionHistory,
  SessionsListResponse,
  RAGUploadResponse,
  RAGRecordsResponse,
  PDFReportRequest,
  UserProfile,
  HealthCheckResponse,
} from "@shared/api";

const BASE_URL = "https://brain-tumor-backend-api.vercel.app/api";

class APIClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem("token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string = "GET",
    body?: any,
    headers?: Record<string, string>,
    isFormData: boolean = false
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (this.token) {
      requestHeaders["Authorization"] = `Bearer ${this.token}`;
    }

    if (!isFormData && method !== "GET") {
      requestHeaders["Content-Type"] = "application/json";
    }

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      fetchOptions.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = "/login";
        }

        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }));

        const errorMessage =
          errorData.message ||
          this.getErrorMessage(response.status) ||
          response.statusText;

        throw {
          status: response.status,
          message: errorMessage,
          errors: errorData.errors,
        };
      }

      if (endpoint.includes("pdf")) {
        return response as unknown as T;
      }

      return response.json() as Promise<T>;
    } catch (error: any) {
      if (error.status) {
        throw error;
      }

      throw {
        status: 0,
        message:
          error.message ||
          "Network error. Please check your connection and try again.",
      };
    }
  }

  private getErrorMessage(status: number): string {
    const errorMessages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      401: "Unauthorized. Please log in.",
      403: "Access denied.",
      404: "Resource not found.",
      408: "Request timeout. Please try again.",
      413: "File too large. Maximum 50MB allowed.",
      500: "Server error. Please try again later.",
      503: "Service unavailable. Please try again later.",
    };
    return errorMessages[status] || "An error occurred. Please try again.";
  }

  // ============ Authentication Endpoints ============

  async register(data: AuthRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>("/auth/register", "POST", data);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>("/auth/login", "POST", {
      email,
      password,
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.makeRequest<UserProfile>("/auth/profile", "GET");
  }

  async updateProfileImage(file: File): Promise<{
    message: string;
    profileImage: { public_id: string; url: string };
  }> {
    const formData = new FormData();
    formData.append("profileImage", file);
    return this.makeRequest(
      "/auth/profile/image",
      "PUT",
      formData,
      {},
      true
    );
  }

  async deleteProfileImage(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      "/auth/profile/image",
      "DELETE"
    );
  }

  // ============ Chat Endpoints ============

  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>("/chat", "POST", data);
  }

  async getSessions(limit?: number, skip?: number): Promise<SessionsListResponse> {
    let endpoint = "/sessions";
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (skip) params.append("skip", skip.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;
    return this.makeRequest<SessionsListResponse>(endpoint, "GET");
  }

  async getSessionHistory(sessionId: string): Promise<SessionHistory> {
    return this.makeRequest<SessionHistory>(`/sessions/${sessionId}`, "GET");
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `/sessions/${sessionId}`,
      "DELETE"
    );
  }

  async updateSessionSystemRole(
    sessionId: string,
    systemRole: string
  ): Promise<{ message: string; sessionId: string; systemRole: string }> {
    return this.makeRequest(
      `/sessions/${sessionId}/system-role`,
      "PUT",
      { systemRole }
    );
  }

  async updateSessionTitle(
    sessionId: string,
    title: string
  ): Promise<{ message: string; sessionId: string; title: string }> {
    return this.makeRequest(
      `/sessions/${sessionId}/title`,
      "PUT",
      { title }
    );
  }

  // ============ RAG (Medical Records) Endpoints ============

  async uploadMedicalRecords(files: FileList): Promise<RAGUploadResponse> {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    return this.makeRequest<RAGUploadResponse>(
      "/rag/upload",
      "POST",
      formData,
      {},
      true
    );
  }

  async getMedicalRecords(
    limit?: number,
    skip?: number,
    search?: string,
    type?: string
  ): Promise<RAGRecordsResponse> {
    let endpoint = "/rag/records";
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (skip) params.append("skip", skip.toString());
    if (search) params.append("search", search);
    if (type) params.append("type", type);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return this.makeRequest<RAGRecordsResponse>(endpoint, "GET");
  }

  // ============ Report Endpoints ============

  async generatePDFReport(data: PDFReportRequest): Promise<Blob> {
    const url = `${BASE_URL}/summary/pdf`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = "/login";
        }

        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }));

        const errorMessage =
          errorData.message ||
          this.getErrorMessage(response.status) ||
          response.statusText;

        throw {
          status: response.status,
          message: errorMessage,
        };
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/pdf")) {
        throw {
          status: 500,
          message: "Invalid response format. Expected PDF file.",
        };
      }

      return response.blob();
    } catch (error: any) {
      if (error.status) {
        throw error;
      }

      throw {
        status: 0,
        message:
          error.message ||
          "Failed to generate PDF report. Please try again.",
      };
    }
  }

  // ============ Health Check Endpoint ============

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.makeRequest<HealthCheckResponse>("/health", "GET");
  }
}

export const apiClient = new APIClient();
