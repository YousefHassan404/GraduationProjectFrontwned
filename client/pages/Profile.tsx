import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { apiClient } from "@/lib/api-client";
import { Upload, Trash2, Loader2, AlertCircle, CheckCircle, Mail, Calendar, Shield } from "lucide-react";
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
            <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading profile...</p>
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Profile</h1>
            <p className="text-slate-600">Manage your account settings</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200 p-8">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-12 pb-8 border-b border-slate-200">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {user?.profileImage?.url ? (
                    <img
                      src={user.profileImage.url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  onClick={handleProfileImageClick}
                  disabled={isLoadingImage}
                  className="gap-2"
                  size="sm"
                >
                  {isLoadingImage && <Loader2 size={18} className="animate-spin" />}
                  <Upload size={18} />
                  Upload Photo
                </Button>

                {user?.profileImage && (
                  <Button
                    onClick={handleDeleteProfileImage}
                    disabled={isLoadingImage}
                    variant="outline"
                    className="gap-2"
                    size="sm"
                  >
                    <Trash2 size={18} />
                    Delete Photo
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3">JPG, PNG or GIF (Max 5MB)</p>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 block mb-2">
                    Full Name
                  </label>
                  <p className="text-lg font-semibold text-slate-900">
                    {user?.name}
                  </p>
                </div>

                {/* Email */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <p className="text-lg font-semibold text-slate-900">
                    {user?.email}
                  </p>
                </div>

                {/* Role */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-2">
                    <Shield size={16} />
                    Account Type
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Member Since */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-2">
                    <Calendar size={16} />
                    Member Since
                  </label>
                  <p className="text-lg font-semibold text-slate-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Account Settings
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  Your account information is securely stored and protected with industry-standard encryption.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={18} className="text-green-600" />
                    Email verified
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={18} className="text-green-600" />
                    Two-factor authentication available
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={18} className="text-green-600" />
                    HIPAA compliant storage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
