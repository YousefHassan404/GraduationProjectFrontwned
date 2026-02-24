/**
 * Shared code between client and server
 * API types and interfaces for the Brain Tumor Analysis System
 */

// ============ Authentication Types ============
export interface UserProfile {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "doctor" | "patient" | "admin";
  profileImage?: {
    public_id: string;
    url: string;
  };
  createdAt?: string;
}

export interface PredictionResponse2D {
  success: boolean;
  prediction_id: string;
  segmentation: {
    prediction: string;      // "Glioma", "Meningioma", "Pituitary", "No Tumor"
    class_id: number;        // 0,1,2,3
  };
  classification: {
    prediction: string;      // نفس اسم الورم
    confidence: number;      // مثلاً 0.95 (يجب تحويله إلى نسبة مئوية)
    probabilities: Record<string, number>; // نفس الشيء، قيم بين 0 و 1
  } | null;                  // يكون null في حالة No Tumor
  final_decision: string;    // "Tumor Detected" أو "No Tumor"
  images: {
    original: string;        // رابط الصورة الأصلية
    blended: string;         // الصورة مع الـ mask متراكب
    mask: string;            // الـ mask فقط
  };
  createdAt: string;         // تاريخ
}

export interface AuthRequest {
  name?: string;
  email: string;
  password: string;
  role?: "doctor" | "patient" | "admin";
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// ============ Chat Types ============
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  includeContext?: boolean;
  language?: "ar" | "en";
}

export interface ChatResponse {
  sessionId: string;
  response: string;
  title: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  title: string;
  audience?: string;
  systemRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionHistory {
  sessionId: string;
  title: string;
  systemRole: string;
  audience: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface SessionsListResponse {
  sessions: ChatSession[];
  total: number;
}

// ============ RAG (Medical Records) Types ============
export interface MedicalRecord {
  recordId: string;
  userId: string;
  fileName: string;
  fileType: "PDF" | "Image";
  fileUrl: string;
  content: string;
  createdAt: string;
}

export interface UploadedFile {
  fileName: string;
  fileType: "PDF" | "Image";
  url: string;
  recordId: string;
  status: "Processing" | "Processed";
}

export interface RAGUploadResponse {
  uploadedFiles: UploadedFile[];
  summary: string;
  totalTokens: number;
}

export interface RAGRecordsResponse {
  records: MedicalRecord[];
  total: number;
  limit: number;
  skip: number;
}

// ============ Report Types ============
export interface PDFReportRequest {
  sessionId: string;
  audience: "doctor" | "patient";
}

// ============ Prediction Types ============
export interface PredictionResponse {
  prediction: string;
  confidence: number;
  probabilities?: Record<string, number>;
  imageUrl?: string;
  model_info?: string;
}


// تعريف واجهة الاستجابة الجديدة


// ============ Health Check Types ============
export interface HealthCheckResponse {
  status: "OK";
  timestamp: string;
  service: string;
}

// ============ Error Response Types ============
export interface APIError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}
