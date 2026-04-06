"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";

import { GlobalConfirmDialog } from "@/components/layout/GlobalConfirmDialog";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Backward compatibility sync for active sessions without a cookie
    if (token && typeof document !== "undefined" && !document.cookie.includes("auth_token=")) {
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
      router.refresh(); // Refresh the page to trigger Server Components with the new cookie
    }
  }, [token, router]);

  useEffect(() => {
    if (mounted) {
      const isAuthRoute = pathname === "/login" || pathname === "/register";
      if (!token && !isAuthRoute) {
        router.push("/login");
      } else if (token && isAuthRoute) {
        router.push("/");
      }
    }
  }, [mounted, pathname, token, router]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) return null;

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isAuthRoute) {
    return (
      <>
        {children}
        <GlobalConfirmDialog />
      </>
    );
  }

  if (!token) return null; // Wait for redirect

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">{children}</main>
      <GlobalConfirmDialog />
    </div>
  );
}

