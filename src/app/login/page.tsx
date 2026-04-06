"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { loginApi, getMeApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Cpu } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginApi(email, password);
      setToken(res.access_token);
      const user = await getMeApi();
      setUser(user);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-center space-x-2 pb-6">
          <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl bg-white shadow-md border border-slate-100">
            <img src="/logo.png" alt="ArcFusion Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-xl font-bold text-slate-800">
            ArcFusion
          </span>
        </div>
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-800">Welcome Back</h2>
        {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600 ring-1 ring-red-100">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
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
          </div>
          <Button type="submit" className="w-full rounded-xl bg-corporate-blue py-5 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-corporate-blue-dark hover:shadow-lg">
            Sign In
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-corporate-blue transition-colors hover:text-corporate-blue-dark">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
