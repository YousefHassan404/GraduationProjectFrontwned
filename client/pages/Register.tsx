import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "patient" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) { setError("Name is required"); return; }
    if (!formData.email.includes("@")) { setError("Please enter a valid email address"); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    try {
      setIsLoading(true);
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate("/");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2";
  const iconClass = "absolute left-3 top-3 text-slate-400 dark:text-slate-500";

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400">Join Brain Care and start AI-powered analysis</p>
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl shadow-blue-600/10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <User size={18} className={iconClass} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Ahmed Ali" disabled={isLoading} className={inputClass} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail size={18} className={iconClass} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="example@email.com" disabled={isLoading} className={inputClass} />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className={labelClass}>Account Type</label>
                <select name="role" value={formData.role} onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="lab">Hospital / Radiology Lab</option>
                  <option value="admin">Admin</option>
                </select>

                {formData.role === "lab" && (
                  <p className="mt-2 text-xs text-blue-500 dark:text-blue-400/80 flex items-start gap-1.5">
                    <span className="mt-0.5">🏥</span>
                    Labs can upload MRI scans and send them directly to doctors via chat.
                  </p>
                )}
                {formData.role === "doctor" && (
                  <p className="mt-2 text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="mt-0.5">👨‍⚕️</span>
                    Doctors get full access to predictions, records, reports, and lab-sent MRI scans.
                  </p>
                )}
                {formData.role === "patient" && (
                  <p className="mt-2 text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="mt-0.5">🧑</span>
                    Patients can use AI chat and 2D MRI prediction.
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock size={18} className={iconClass} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    placeholder="••••••••" disabled={isLoading} className={inputClass} />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className={iconClass} />
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    placeholder="••••••••" disabled={isLoading} className={inputClass} />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} size="lg"
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-blue-600/30 transition-all text-white">
                {isLoading && <Loader2 size={20} className="animate-spin" />}
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 dark:text-blue-400 hover:text-blue-400 font-medium transition">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
