"use client";

import { useEffect, useRef, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  PieChart,
  Bookmark,
  Database,
  Coins,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/useConfirm";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: PieChart, label: "Stories", href: "/stories" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
  { icon: Database, label: "Data Settings", href: "/settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { confirm } = useConfirm();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Sign Out",
      description: "Are you sure you want to sign out?",
      variant: "warning",
      confirmLabel: "Sign Out",
    });
    if (!confirmed) return;
    
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[72px] flex-col items-center bg-corporate-blue py-6">
      {/* Logo */}
      <button
        onClick={() => router.push("/")}
        className="mb-10 flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl bg-white transition-all hover:bg-slate-50 hover:scale-105 shadow-sm"
      >
        <img src="/logo.png" alt="ArcFusion Logo" className="w-full h-full object-contain p-1" />
      </button>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              title={label}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                isActive
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full ml-3 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {label}
              </span>
              {/* Active indicator */}
              {isActive && (
                <span className="absolute -left-[22px] h-6 w-1 rounded-r-full bg-white" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Credits */}
      <div className="mt-auto flex flex-col items-center gap-4">
        {user && (
          <button
            onClick={() => router.push("/credits")}
            className={cn(
              "flex flex-col items-center gap-1 group relative transition-all duration-200",
              pathname === "/credits"
                ? "scale-110"
                : "hover:scale-105"
            )}
            title="Credits"
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center gap-1 rounded-full transition-all",
              pathname === "/credits"
                ? "bg-indigo-500/40 text-indigo-100 ring-2 ring-indigo-400/50"
                : "bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
            )}>
              <Coins className="h-4 w-4" />
            </div>
            <span className={cn(
              "text-[10px] font-medium",
              pathname === "/credits" ? "text-white/80" : "text-white/50"
            )}>{user.credits}</span>
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Credits &mdash; Click to manage
            </span>
          </button>
        )}

        <div className="relative group" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-chart-cyan to-chart-emerald text-white text-sm font-semibold ring-2 ring-white/20 transition-all hover:ring-white/40 hover:scale-105"
          >
            {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U"}
            
            {!isDropdownOpen && (
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Account Menu
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute left-full bottom-0 ml-4 w-52 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-100 animate-fade-in origin-bottom-left transition-all">
              <div className="px-3 py-3 mb-1 border-b border-slate-100/80">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push("/profile");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-corporate-blue/10 hover:text-corporate-blue transition-colors"
              >
                <UserIcon className="h-4 w-4" /> Profile Details
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-0.5"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
