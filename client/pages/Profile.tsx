import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { apiClient } from "@/lib/api-client";
import { Upload, Trash2, Loader2, AlertCircle, CheckCircle, Mail, Calendar, Shield, User as UserIcon } from "lucide-react";
import { Navigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/utils";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading, setUser } = useAuth();
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or GIF image");
      return;
    }

    try {
      setIsLoadingImage(true);
      setError("");
      setSuccess("");

      const response = await apiClient.updateProfileImage(file);
      setUser({
        ...user!,
        profileImage: response.profileImage,
      });
      setSuccess("Profile image updated successfully");

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!window.confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    try {
      setIsLoadingImage(true);
      setError("");
      setSuccess("");

      await apiClient.deleteProfileImage();
      setUser({
        ...user!,
        profileImage: undefined,
      });
      setSuccess("Profile image deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoadingImage(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
              Profile
            </h1>
            <p className="text-slate-400 text-lg">Manage your account settings</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl backdrop-blur-sm flex gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl backdrop-blur-sm flex gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Image Section */}
            <div className="p-8 pb-6 border-b border-slate-700">
              <div className="flex flex-col items-center">
                <div className="relative mb-6 group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center overflow-hidden ring-4 ring-slate-700/50 shadow-xl">
                    {user?.profileImage?.url ? (
                      <img
                        src={user.profileImage.url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <UserIcon size={48} className="text-white/80" />
                      </div>
                    )}
                  </div>
                  
                  {/* Hover overlay for upload hint */}
                  <div 
                    onClick={handleProfileImageClick}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                <p className="text-slate-400 text-sm mb-4">{user?.email}</p>

                <div className="flex gap-3 flex-wrap justify-center">
                  <Button
                    onClick={handleProfileImageClick}
                    disabled={isLoadingImage}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25"
                    size="sm"
                  >
                    {isLoadingImage && <Loader2 size={18} className="animate-spin mr-2" />}
                    <Upload size={18} className="mr-2" />
                    Upload Photo
                  </Button>

                  {user?.profileImage && (
                    <Button
                      onClick={handleDeleteProfileImage}
                      disabled={isLoadingImage}
                      variant="outline"
                      size="sm"
                      className="border-slate-700 bg-slate-800 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400"
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete Photo
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-4">JPG, PNG or GIF (Max 5MB)</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700">
                    <label className="text-sm font-medium text-slate-400 block mb-2">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2">
                      <UserIcon size={18} className="text-blue-400" />
                      <p className="text-lg font-semibold text-white">
                        {user?.name}
                      </p>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2">
                      <Mail size={16} className="text-blue-400" />
                      Email Address
                    </label>
                    <p className="text-lg font-semibold text-white break-all">
                      {user?.email}
                    </p>
                  </div>

                  {/* Account Type */}
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2">
                      <Shield size={16} className="text-blue-400" />
                      Account Type
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-blue-400" />
                      Member Since
                    </label>
                    <p className="text-lg font-semibold text-white">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Account Settings Section */}
                <div className="mt-8 pt-8 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-blue-400" />
                    Security & Privacy
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Your account information is securely stored and protected with industry-standard encryption and HIPAA-compliant infrastructure.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-400" />
                      </div>
                      <span className="text-sm text-slate-300">Email verified</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Shield size={16} className="text-blue-400" />
                      </div>
                      <span className="text-sm text-slate-300">2FA available</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700 sm:col-span-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <CheckCircle size={16} className="text-purple-400" />
                      </div>
                      <span className="text-sm text-slate-300">HIPAA compliant storage</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                  <p className="text-sm text-slate-400">
                    <span className="text-blue-400 font-medium">Note:</span> Your profile information is used to personalize your experience and secure your account. All changes are logged for security purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}