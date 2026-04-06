"use client";

import { useState } from "react";
import { X, Check, Copy, Mail, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicChart } from "@/components/charts/DynamicChart";
import { useAuthStore } from "@/store/authStore";
import { addRecentShareApi, shareStoryApi } from "@/lib/api";
import type { ChatResponse } from "@/lib/api";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ChatResponse | null;
  storyId?: string;
}

export function ShareModal({ open, onOpenChange, data, storyId }: ShareModalProps) {
  const { user, setUser } = useAuthStore();
  
  const [message, setMessage] = useState(
    "Could you please review these insights?"
  );
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [newEmail, setNewEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const shareableLink = typeof window !== "undefined" ? window.location.href : "";
  const recentShares = user?.recent_share_emails || [];

  const handleToggleSelect = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddNewContact = async () => {
    if (!newEmail || !newEmail.includes("@")) return;
    
    setIsAdding(true);
    try {
      const name = newEmail.split("@")[0];
      const avatar = name.slice(0, 2).toUpperCase();
      const newContact = { name, email: newEmail, role: "Guest", avatar };
      
      const updatedUser = await addRecentShareApi(newContact);
      setUser(updatedUser);
      
      setSelectedEmails((prev) => new Set(prev).add(newEmail));
      setNewEmail("");
    } catch (err) {
      console.error("Failed to add contact", err);
    }
    setIsAdding(false);
  };

  const handleSendViaEmail = async () => {
    if (selectedEmails.size === 0) return;
    
    // Attempt to persist the share array 
    if (storyId && storyId !== "new") {
      try {
        await shareStoryApi(storyId, Array.from(selectedEmails));
      } catch (err) {
        console.error("Failed to track shared story", err);
      }
    }

    const emails = Array.from(selectedEmails).join(",");
    const subject = encodeURIComponent(data?.insight_title || "Dashboard Insight");
    const body = encodeURIComponent(`${message}\n\nLink: ${shareableLink}`);
    
    // Use BCC to hide recipients from each other
    window.location.href = `mailto:?bcc=${emails}&subject=${subject}&body=${body}`;
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setSelectedEmails(new Set()), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl border-0 p-0 shadow-2xl [&>button]:hidden">
        {/* Header */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-slate-800">
                Share Insight
              </DialogTitle>
            </DialogHeader>
            <button
              onClick={handleClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preview */}
          {data && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                {data.echarts_config &&
                Object.keys(data.echarts_config).length > 0 ? (
                  <DynamicChart option={data.echarts_config} height={48} />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300 text-xs">
                    📊
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-snug">
                {data.insight_title}
              </p>
            </div>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Shareable Link Box */}
          <div className="px-5 pt-4">
             <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Shareable Link
            </p>
            <div className="flex items-center gap-2">
              <Input 
                readOnly 
                value={shareableLink} 
                className="h-9 text-xs text-slate-500 bg-slate-50" 
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLink}
                className="h-9 px-3 shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
              </Button>
            </div>
          </div>

          {/* Message */}
          <div className="px-5 pt-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add an optional message..."
              className="min-h-[60px] resize-none rounded-xl border-slate-200 text-sm focus:border-corporate-blue/30 focus:ring-corporate-blue/20"
            />
          </div>

          {/* Add Contact */}
          <div className="px-5 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Add Recipient
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-9 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddNewContact();
                }}
              />
              <Button 
                onClick={handleAddNewContact} 
                disabled={isAdding || !newEmail.includes("@")}
                className="h-9 w-9 p-0 shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contacts */}
          <div className="px-5 pb-5 pt-4">
            {recentShares.length > 0 && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent Contacts
              </p>
            )}
            <div className="space-y-1">
              {recentShares.map((contact: any, index: number) => {
                const isSelected = selectedEmails.has(contact.email);
                return (
                  <div
                    key={`${contact.email}-${index}`}
                    onClick={() => handleToggleSelect(contact.email)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer transition-colors ${
                      isSelected ? "bg-corporate-blue/5 border border-corporate-blue/20" : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-semibold text-slate-600">
                        {contact.avatar || contact.name?.slice(0, 2).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 leading-tight">
                          {contact.name || contact.email.split("@")[0]}
                        </p>
                        <p className="text-xs text-slate-400">{contact.email}</p>
                      </div>
                    </div>
                    <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                      isSelected ? "border-corporate-blue bg-corporate-blue text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 rounded-b-2xl flex justify-between items-center">
          <p className="text-xs text-slate-500">
            {selectedEmails.size} recipient{selectedEmails.size !== 1 ? "s" : ""} selected
          </p>
          <Button
            onClick={handleSendViaEmail}
            disabled={selectedEmails.size === 0}
            className="rounded-xl bg-corporate-blue hover:bg-corporate-blue-dark text-white shadow-sm flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Open Mail Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
