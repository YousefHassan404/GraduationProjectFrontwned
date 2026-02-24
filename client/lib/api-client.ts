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
  PredictionResponse,
  PredictionResponse2D,
} from "@shared/api";

const BASE_URL = "https://brain-tumor-backend-v1.vercel.app/api";
// const BASE_URL = "http://localhost:3000/api";
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
  

// في ملف lib/api-client.ts
async predict(file: File): Promise<PredictionResponse2D> {
  const formData = new FormData();
  formData.append('image', file); // الاسم أصبح image كما هو مطلوب
  return this.makeRequest<PredictionResponse2D>('/predict/2d', 'POST', formData, {}, true);
}

// ============ 3D Brain Tumor Endpoints ============

/** 
 * Submit 4 MRI modalities for 3D segmentation.
 * @param files Object containing the four modality files (t1, t1gd, t2, flair)
 * @returns Job submission response with job_id and prediction_id
 */
async submit3DSegmentationJob(files: {
  t1: File;
  t1gd: File;
  t2: File;
  flair: File;
}): Promise<{
  success: boolean;
  job_id: string;
  prediction_id: string;
}> {
  const formData = new FormData();
  formData.append('t1', files.t1);
  formData.append('t1gd', files.t1gd);
  formData.append('t2', files.t2);
  formData.append('flair', files.flair);
  return this.makeRequest('/3dpredict', 'POST', formData, {}, true);
}

/**
 * Check the status of a 3D segmentation job.
 * @param jobId The job ID returned from submission
 * @returns Status object – either { status: "processing" } or completed with metrics
 */
async get3DJobStatus(jobId: string): Promise<{
  status: string;
  metrics?: {
    NCR: { volume_cm3: number; confidence: number };
    ED: { volume_cm3: number; confidence: number };
    ET: { volume_cm3: number; confidence: number };
    Total: { volume_cm3: number; confidence: number };
    tumor_type: string;
    classification_confidence: number;
  };
}> {
  return this.makeRequest(`/3dpredict/status/${jobId}`, 'GET');
}

/**
 * Download the generated segmentation mask (.nii.gz).
 * @param jobId The job ID
 * @returns Blob containing the .nii.gz file
 */
async download3DSegmentationMask(jobId: string): Promise<Blob> {
  const url = `${BASE_URL}/3dpredict/download/${jobId}`;
  const headers: Record<string, string> = {};
  if (this.token) {
    headers['Authorization'] = `Bearer ${this.token}`;
  }

  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw {
        status: response.status,
        message: errorData.message || this.getErrorMessage(response.status),
      };
    }
    // Ensure it's a binary file
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/octet-stream')) {
      throw {
        status: 500,
        message: 'Invalid response format. Expected binary file.',
      };
    }
    return response.blob();
  } catch (error: any) {
    if (error.status) throw error;
    throw {
      status: 0,
      message: error.message || 'Failed to download segmentation mask.',
    };
  }
}

/**
 * View a specific uploaded MRI modality for a job.
 * @param jobId The job ID
 * @param modalityIndex 0: T1, 1: T1GD, 2: T2, 3: FLAIR
 * @returns Blob containing the original .nii.gz file
 */
async view3DModality(jobId: string, modalityIndex: 0 | 1 | 2 | 3): Promise<Blob> {
  const url = `${BASE_URL}/3dpredict/view/${jobId}/${modalityIndex}`;
  const headers: Record<string, string> = {};
  if (this.token) {
    headers['Authorization'] = `Bearer ${this.token}`;
  }

  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw {
        status: response.status,
        message: errorData.message || this.getErrorMessage(response.status),
      };
    }
    // Expected content-type: application/octet-stream or similar
    return response.blob();
  } catch (error: any) {
    if (error.status) throw error;
    throw {
      status: 0,
      message: error.message || 'Failed to view modality.',
    };
  }
}

/**
 * Clear all data from the AI server.
 * @returns Confirmation message
 */
async clearAll3DData(): Promise<{ message: string }> {
  return this.makeRequest('/3dpredict/clear', 'DELETE');
}

  // ============ Health Check Endpoint ============

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.makeRequest<HealthCheckResponse>("/health", "GET");
  }
}

export const apiClient = new APIClient();
