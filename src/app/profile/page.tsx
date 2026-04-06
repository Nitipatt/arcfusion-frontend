"use client";

import { useState } from "react";
import { User, Loader2, Sparkles, Mail, Lock, Shield, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { updateMeApi } from "@/lib/api";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profilePassword && profilePassword !== profileConfirmPassword) {
      setProfileMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setProfileSaving(true);
    setProfileMessage({ text: "", type: "" });
    try {
      const updatedUser = await updateMeApi({ name: profileName, password: profilePassword || undefined });
      setUser(updatedUser);
      setProfileMessage({ text: "Profile updated successfully!", type: "success" });
      setProfilePassword("");
      setProfileConfirmPassword("");
    } catch (err: unknown) {
      setProfileMessage({ text: err instanceof Error ? err.message : "An error occurred", type: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="ml-[72px] min-h-screen bg-[#fafcff] relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[120%] rounded-full bg-gradient-to-br from-indigo-100/40 via-purple-100/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute -top-[10%] left-[60%] w-[50%] h-[120%] rounded-full bg-gradient-to-bl from-teal-50/60 via-cyan-50/20 to-transparent blur-3xl opacity-70" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="mx-auto max-w-4xl px-8 py-16 relative z-10">
        
        {/* Animated Hero Header */}
        <div className="mb-12 flex flex-col items-center text-center animate-fade-in-up">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-corporate-blue to-purple-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-white to-slate-50 ring-1 ring-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
              <span className="text-4xl font-bold bg-gradient-to-br from-corporate-blue to-purple-600 bg-clip-text text-transparent">
                {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U"}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 ring-4 ring-[#fafcff] shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Account Details
          </h1>
          <p className="mt-3 text-base text-slate-500 max-w-md mx-auto">
            Manage your digital footprint. Personalize your display identity and secure your authorization credentials.
          </p>
        </div>

        {/* Glassmorphic Form Container */}
        <div className="max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form 
            onSubmit={handleProfileSave}
            className="relative overflow-hidden rounded-[2.5rem] bg-white/70 backdrop-blur-xl p-10 ring-1 ring-slate-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]"
          >
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-corporate-blue via-purple-500 to-teal-400" />
            
            <h2 className="text-2xl font-semibold text-slate-800 mb-8 flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-400" /> Security & Profile
            </h2>
            
            {profileMessage.text && (
              <div className={`mb-8 p-4 rounded-2xl text-sm border flex items-start gap-3 transition-all ${
                profileMessage.type === 'success' 
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50/50 border-red-200 text-red-800'
              }`}>
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${profileMessage.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <p className="font-medium">{profileMessage.text}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Address (Read Only) */}
              <div className="group">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors group-focus-within:text-corporate-blue">
                  <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-corporate-blue" />
                  Primary Email
                </label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="rounded-2xl h-12 bg-slate-50/50 border-slate-200/60 text-slate-500 opacity-80 cursor-not-allowed"
                />
                <p className="mt-2 text-xs text-slate-400 ml-1">Email tied directly to your unique identifier.</p>
              </div>

              {/* Display Name */}
              <div className="group">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors group-focus-within:text-corporate-blue">
                  <User className="h-4 w-4 text-slate-400 group-focus-within:text-corporate-blue" />
                  Display Name
                </label>
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="rounded-2xl h-12 border-slate-200 bg-white/50 focus-visible:ring-corporate-blue/20 focus-visible:border-corporate-blue transition-all"
                />
              </div>

              {/* Password */}
              <div className="group">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors group-focus-within:text-purple-500">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-purple-500" />
                  Password
                </label>
                <div className="flex flex-col gap-3">
                  <Input
                    type="password"
                    placeholder="New password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="rounded-2xl h-12 border-slate-200 bg-white/50 focus-visible:ring-purple-500/20 focus-visible:border-purple-400 transition-all font-mono"
                  />
                  
                  {/* Dynamic Confirmation Field */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${profilePassword.length > 0 ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      className="rounded-2xl h-12 border-slate-200 bg-white/50 focus-visible:ring-purple-500/20 focus-visible:border-purple-400 transition-all font-mono"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400 ml-1">Leave empty to keep your current password.</p>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-6 h-14 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_25px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
                >
                  {profileSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Update Profile
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                  {/* Subtle inner gradient shine on hover */}
                  <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] transition-transform duration-1000 ease-out group-hover:translate-x-[50%]" />
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" /> End-to-end encrypted connection active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
