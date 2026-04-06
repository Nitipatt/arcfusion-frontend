"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Database,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  Plug,
  AlertCircle,
  Server,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { DatabaseConnection, ConnectionTestResult } from "@/lib/api";
import {
  fetchConnections,
  createConnection,
  updateConnection,
  deleteConnection,
  activateConnection,
  testConnection,
} from "@/lib/api";
import { useConfirm } from "@/hooks/useConfirm";

const DEFAULT_FORM: Omit<DatabaseConnection, "id" | "is_active"> = {
  name: "",
  host: "localhost",
  port: 5432,
  database: "",
  user: "postgres",
  password: "",
  schema: "public",
  sslmode: "disable",
};

export default function SettingsPage() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { confirm } = useConfirm();

  const loadConnections = useCallback(async () => {
    try {
      const data = await fetchConnections();
      setConnections(data);
    } catch {
      console.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(form);
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: "Test request failed", tables: [] });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await updateConnection(editingId, form);
      } else {
        await createConnection(form);
      }
      await loadConnections();
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Connection",
      description: "Are you sure you want to delete this database connection? This action cannot be undone.",
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    
    await deleteConnection(id);
    await loadConnections();
  };

  const handleActivate = async (id: string) => {
    await activateConnection(id);
    await loadConnections();
  };

  const handleEdit = (conn: DatabaseConnection) => {
    setForm({
      name: conn.name,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      user: conn.user,
      password: conn.password,
      schema: conn.schema,
      sslmode: conn.sslmode,
    });
    setEditingId(conn.id);
    setShowForm(true);
    setTestResult(null);
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowForm(false);
    setTestResult(null);
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="ml-[72px] min-h-screen">
      <div className="mx-auto max-w-4xl px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Database className="h-8 w-8 text-corporate-blue" />
            Database Connections
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Connect to your databases and query them using natural language.
            Like DBeaver, but powered by AI.
          </p>
        </div>

        {/* Active Connection Banner */}
          {connections.find((c) => c.is_active) && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Plug className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Active: {connections.find((c) => c.is_active)?.name}
              </p>
              <p className="text-xs text-emerald-600">
                {connections.find((c) => c.is_active)?.host}:
                {connections.find((c) => c.is_active)?.port} /{" "}
                {connections.find((c) => c.is_active)?.database}
              </p>
            </div>
          </div>
        )}

        {/* Add Connection Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-corporate-blue text-white hover:bg-corporate-blue-dark rounded-xl h-10 px-5"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Connection
          </Button>
        )}

        {/* Connection Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Edit Connection" : "New Connection"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Connection Name
                </label>
                <Input
                  placeholder="My Production DB"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Host</label>
                <Input
                  placeholder="localhost"
                  value={form.host}
                  onChange={(e) => updateField("host", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Port</label>
                <Input
                  type="number"
                  placeholder="5432"
                  value={form.port}
                  onChange={(e) => updateField("port", parseInt(e.target.value) || 5432)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Database Name
                </label>
                <Input
                  placeholder="arcfusion"
                  value={form.database}
                  onChange={(e) => updateField("database", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Schema</label>
                <Input
                  placeholder="public"
                  value={form.schema}
                  onChange={(e) => updateField("schema", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Username</label>
                <Input
                  placeholder="postgres"
                  value={form.user}
                  onChange={(e) => updateField("user", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Password</label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">SSL Mode</label>
                <select
                  value={form.sslmode}
                  onChange={(e) => updateField("sslmode", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-corporate-blue/20"
                >
                  <option value="disable">Disable</option>
                  <option value="require">Require</option>
                  <option value="verify-ca">Verify CA</option>
                  <option value="verify-full">Verify Full</option>
                </select>
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`mt-4 rounded-xl p-4 text-sm ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-red-50 text-red-700 ring-1 ring-red-200"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {testResult.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {testResult.message}
                </div>
                {testResult.tables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {testResult.tables.map((t) => (
                      <Badge
                        key={t}
                        className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-mono text-emerald-700 hover:bg-emerald-200"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center gap-3">
              <Button
                onClick={handleTest}
                disabled={testing || !form.host || !form.database}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg h-9"
              >
                {testing ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plug className="mr-2 h-3.5 w-3.5" />
                )}
                Test Connection
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name || !form.database}
                className="bg-corporate-blue text-white hover:bg-corporate-blue-dark rounded-lg h-9"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="mr-2 h-3.5 w-3.5" />
                )}
                {editingId ? "Update" : "Save"}
              </Button>
              <Button onClick={resetForm} className="text-slate-500 hover:bg-slate-100 rounded-lg h-9 bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Connections List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading connections...
            </div>
          ) : connections.length === 0 && !showForm ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
              <Server className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700">No connections yet</h3>
              <p className="mt-1 text-sm text-slate-400">
                Add a database connection to start querying with AI
              </p>
            </div>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.id}
                className={`rounded-2xl bg-white p-5 shadow-sm ring-1 transition-all ${
                  conn.is_active
                    ? "ring-emerald-300 bg-emerald-50/30"
                    : "ring-slate-100 hover:ring-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        conn.is_active ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    >
                      <Database
                        className={`h-5 w-5 ${
                          conn.is_active ? "text-white" : "text-slate-500"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{conn.name}</h3>
                        {conn.is_active && (
                          <Badge className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-200">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        {conn.host}:{conn.port} / {conn.database}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!conn.is_active && (
                      <Button
                        onClick={() => handleActivate(conn.id)}
                        className="h-8 rounded-lg bg-emerald-50 px-3 text-xs text-emerald-700 hover:bg-emerald-100"
                      >
                        <Plug className="mr-1 h-3 w-3" />
                        Activate
                      </Button>
                    )}
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === conn.id ? null : conn.id)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      {expandedId === conn.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === conn.id && (
                  <div className="mt-4 border-t border-slate-100 pt-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-slate-400">Schema</span>
                        <p className="font-mono text-slate-600">{conn.schema}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">SSL Mode</span>
                        <p className="font-mono text-slate-600">{conn.sslmode}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">User</span>
                        <p className="font-mono text-slate-600">{conn.user}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        onClick={() => handleEdit(conn)}
                        className="h-7 rounded-md bg-slate-100 px-3 text-xs text-slate-600 hover:bg-slate-200"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(conn.id)}
                        className="h-7 rounded-md bg-red-50 px-3 text-xs text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
