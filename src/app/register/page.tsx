"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { registerApi, loginApi, getMeApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

function calculateStrength(pw: string) {
  if (!pw) return 0;
  let score = 1;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(4, score);
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const strength = calculateStrength(password);
  const strengthText = ["", "Weak", "Fair", "Good", "Strong"][strength] || "";
  const strengthColor = [
    "bg-slate-200",
    "bg-red-400",
    "bg-amber-400",
    "bg-emerald-400",
    "bg-emerald-500",
  ][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    try {
      await registerApi(name, email, password);
      // Automatically login after register
      const res = await loginApi(email, password);
      setToken(res.access_token);
      const user = await getMeApi();
      setUser(user);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-center space-x-2 pb-6">
          <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl bg-white shadow-md border border-slate-100">
            <Image src="/logo.png" alt="ArcFusion Logo" width={40} height={40} className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-xl font-bold text-slate-800">
            ArcFusion
          </span>
        </div>
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-800">Create Account</h2>
        {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600 ring-1 ring-red-100">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl border-slate-200 bg-slate-50 py-5 text-slate-800 placeholder:text-slate-400 focus-visible:ring-corporate-blue shadow-sm"
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border-slate-200 bg-slate-50 py-5 text-slate-800 placeholder:text-slate-400 focus-visible:ring-corporate-blue shadow-sm"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl border-slate-200 bg-slate-50 py-5 text-slate-800 placeholder:text-slate-400 focus-visible:ring-corporate-blue shadow-sm"
            />
            {password.length > 0 && (
              <div className="mt-2 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Password strength</span>
                  <span className="text-slate-700 font-medium">{strengthText}</span>
                </div>
                <div className="flex gap-1 h-1.5 w-full">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-full flex-1 rounded-full transition-colors duration-300",
                        strength >= level ? strengthColor : "bg-slate-200"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-xl border-slate-200 bg-slate-50 py-5 text-slate-800 placeholder:text-slate-400 focus-visible:ring-corporate-blue shadow-sm"
            />
          </div>
          <Button type="submit" className="w-full mt-2 rounded-xl bg-corporate-blue py-5 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-corporate-blue-dark hover:shadow-lg">
            Get Started
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-corporate-blue transition-colors hover:text-corporate-blue-dark">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
