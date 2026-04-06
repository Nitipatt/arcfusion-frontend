"use client";

import { useState } from "react";
import {
  Coins,
  Sparkles,
  Zap,
  Crown,
  Rocket,
  Plus,
  Check,
  Loader2,
  TrendingUp,
  Gift,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { topupCredits } from "@/lib/api";

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    amount: 10,
    icon: Zap,
    color: "from-sky-400 to-blue-500",
    bgLight: "bg-sky-50",
    ringColor: "ring-sky-200",
    textColor: "text-sky-700",
    iconBg: "bg-sky-100",
    description: "Great for trying things out",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    amount: 50,
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    ringColor: "ring-violet-200",
    textColor: "text-violet-700",
    iconBg: "bg-violet-100",
    description: "Perfect for regular exploration",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    amount: 200,
    icon: Crown,
    color: "from-amber-400 to-orange-500",
    bgLight: "bg-amber-50",
    ringColor: "ring-amber-200",
    textColor: "text-amber-700",
    iconBg: "bg-amber-100",
    description: "For power users & teams",
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    amount: 500,
    icon: Rocket,
    color: "from-emerald-400 to-teal-500",
    bgLight: "bg-emerald-50",
    ringColor: "ring-emerald-200",
    textColor: "text-emerald-700",
    iconBg: "bg-emerald-100",
    description: "Unlimited-feeling access",
    popular: false,
  },
];

export default function CreditsPage() {
  const { user, addCredits } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [checkoutData, setCheckoutData] = useState<{ amount: number; id: string; name: string } | null>(null);

  const initiateTopup = (amount: number, packageId: string, packageName?: string) => {
    setCheckoutData({
      amount,
      id: packageId,
      name: packageName || (packageId === "custom" ? "Custom Amount" : packageId),
    });
  };

  const confirmTopup = async () => {
    if (!checkoutData) return;
    const { amount, id } = checkoutData;
    setLoading(id);
    setSuccess(null);
    setError(null);
    try {
      await topupCredits(amount);
      addCredits(amount);
      setSuccess(`Successfully added ${amount} credits!`);
      if (id === "custom") {
        setCustomAmount("");
      }
      setCheckoutData(null);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add credits");
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(null);
    }
  };

  const handleCustomTopup = () => {
    const amount = parseInt(customAmount);
    if (!amount || amount < 1 || amount > 1000) {
      setError("Please enter a valid amount between 1 and 1000");
      setTimeout(() => setError(null), 3000);
      return;
    }
    initiateTopup(amount, "custom");
  };

  return (
    <div className="ml-[72px] min-h-screen">
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Coins className="h-8 w-8 text-corporate-blue" />
            Credits
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your credits and add more to keep exploring your data with
            AI.
          </p>
        </div>

        {/* Balance Card */}
        <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-corporate-blue via-corporate-blue-light to-indigo-500 p-8 text-white shadow-lg">
          {/* Decorative elements */}
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -right-2 top-10 h-20 w-20 rounded-full bg-white/5" />
          <div className="absolute left-1/2 -bottom-10 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70 mb-1">
                Current Balance
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tight">
                  {user?.credits ?? 0}
                </span>
                <span className="text-lg font-medium text-white/60">
                  credits
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
                <TrendingUp className="h-4 w-4" />
                <span>Each question costs 1 credit</span>
              </div>
            </div>
            <div className="hidden sm:flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Coins className="h-12 w-12 text-white/80" />
            </div>
          </div>
        </div>

        {/* Success / Error Messages */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200 animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Check className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-emerald-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 ring-1 ring-red-200 animate-fade-in">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Credit Packages */}
        <section className="mb-10">
          <h2 className="mb-5 text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Gift className="h-5 w-5 text-corporate-blue" />
            Credit Packages
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CREDIT_PACKAGES.map((pkg, index) => {
              const Icon = pkg.icon;
              const isLoading = loading === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => initiateTopup(pkg.amount, pkg.id, pkg.name)}
                  disabled={loading !== null}
                  className={`group relative flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm ring-1 ${pkg.ringColor} transition-all duration-300 hover:shadow-md hover:ring-2 hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm animate-fade-in`}
                  style={{
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                        <Sparkles className="h-3 w-3" />
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${pkg.iconBg} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`h-7 w-7 ${pkg.textColor}`} />
                  </div>

                  {/* Package Name */}
                  <h3 className="text-sm font-bold text-slate-700 mb-1">
                    {pkg.name}
                  </h3>

                  {/* Amount */}
                  <div className="mb-0.5 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-800">
                      {pkg.amount}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      credits
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-3 text-sm font-semibold text-corporate-blue bg-corporate-blue/10 px-3 py-1 rounded-full">
                    ${(pkg.amount * 0.10).toFixed(2)}
                  </div>

                  {/* Description */}
                  <p className="mb-4 text-xs text-slate-400 text-center leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Button */}
                  <div
                    className={`w-full rounded-xl bg-gradient-to-r ${pkg.color} py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-300 group-hover:shadow-md`}
                  >
                    {isLoading ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    ) : (
                      "Add Credits"
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Custom Amount */}
        <section className="mb-10">
          <h2 className="mb-5 text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Plus className="h-5 w-5 text-corporate-blue" />
            Custom Amount
          </h2>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="mb-4 text-sm text-slate-500">
              Need a specific number of credits? Enter any amount between 1 and
              1,000.
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Coins className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="custom-credit-amount"
                  type="number"
                  min={1}
                  max={1000}
                  placeholder="Enter amount..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCustomTopup();
                  }}
                  className="rounded-xl pl-10 h-11"
                />
              </div>
              <Button
                id="custom-topup-button"
                onClick={handleCustomTopup}
                disabled={loading !== null || !customAmount}
                className="bg-corporate-blue text-white hover:bg-corporate-blue-dark rounded-xl h-11 px-6"
              >
                {loading === "custom" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Credits
              </Button>
            </div>
          </div>
        </section>

        {/* Info Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 p-6 ring-1 ring-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            How Credits Work
          </h3>
          <ul className="space-y-2 text-sm text-slate-500">
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-corporate-blue/10 text-corporate-blue text-[10px] font-bold">
                1
              </span>
              Each question you ask about your data costs 1 credit.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-corporate-blue/10 text-corporate-blue text-[10px] font-bold">
                2
              </span>
              Follow-up questions within the same conversation also cost 1
              credit each.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-corporate-blue/10 text-corporate-blue text-[10px] font-bold">
                3
              </span>
              Credits never expire — use them at your own pace.
            </li>
          </ul>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog
        open={!!checkoutData}
        onOpenChange={(open) => {
          if (!open && loading === null) {
            setCheckoutData(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase credits for your account.
            </DialogDescription>
          </DialogHeader>
          {checkoutData && (
            <div className="py-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 shadow-sm">
                <div className="flex items-center justify-between font-medium mb-3">
                  <span className="text-slate-500">Package</span>
                  <span className="text-slate-800 font-semibold">{checkoutData.name}</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500">Credits Included</span>
                  <span className="text-slate-800 font-semibold flex items-center">
                    {checkoutData.amount}
                    <Coins className="ml-1.5 h-4 w-4 text-corporate-blue" />
                  </span>
                </div>
                <div className="my-4 h-px bg-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Total Amount</span>
                  <span className="text-xl font-bold text-slate-800">
                    ${(checkoutData.amount * 0.10).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCheckoutData(null)}
              disabled={loading !== null}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              className="bg-corporate-blue text-white hover:bg-corporate-blue-dark rounded-xl"
              onClick={confirmTopup}
              disabled={loading !== null}
            >
              {loading !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Complete Purchase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
