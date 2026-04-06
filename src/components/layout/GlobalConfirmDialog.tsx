"use client";

import { useConfirmStore } from "@/store/confirmStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";

export function GlobalConfirmDialog() {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmStore();

  const Icon = 
    options.variant === "danger" ? AlertTriangle : 
    options.variant === "warning" ? AlertCircle : Info;

  const iconColor = 
    options.variant === "danger" ? "text-red-500" : 
    options.variant === "warning" ? "text-amber-500" : "text-blue-500";
    
  const buttonVariant = options.variant === "danger" ? "destructive" : "default";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-slate-100 ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg">{options.title}</DialogTitle>
          </div>
          <DialogDescription className="pt-3 pb-1 pl-12 text-slate-600">
            {options.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 sm:justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {options.cancelLabel || "Cancel"}
          </Button>
          <Button variant={buttonVariant} onClick={handleConfirm}>
            {options.confirmLabel || "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
