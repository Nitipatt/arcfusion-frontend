import { fetchConnectionsServer } from "@/lib/serverApi";
import { StoriesClient } from "@/components/dashboard/StoriesClient";
import { Database } from "lucide-react";
import Link from "next/link";

export default async function StoriesPage() {
  const conns = await fetchConnectionsServer();
  const hasConnection = conns.length > 0;

  if (!hasConnection) {
    return (
      <div className="ml-[72px] min-h-screen">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Missing Connection State */}
          <div className="mt-[10vh] mb-12 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50 p-12 text-center ring-1 ring-amber-100 animate-fade-in shadow-sm w-full max-w-2xl mx-auto">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/50">
              <Database className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              No Database Connection Found
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              To get started exploring insights and generating AI-powered dashboard reports, you need to connect your active database first.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-corporate-blue px-6 py-3 text-sm font-medium text-white transition-all hover:bg-corporate-blue-dark hover:shadow-lg"
            >
              Add Connection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <StoriesClient />;
}
