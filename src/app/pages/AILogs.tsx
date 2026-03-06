import { useState, useEffect } from "react";
import { GlassCard } from "../components/GlassCard";
import { Search, X, FileText, RefreshCw } from "lucide-react";
import { getAILogs } from "../lib/api";

interface LogEntry {
  id: string;
  module_name: string;
  prompt: string;
  raw_response: string | null;
  parsed_json: Record<string, any> | null;
  created_at: string;
}

export function AILogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filterModule, setFilterModule] = useState("all");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAILogs(searchQuery, filterModule);
      if (response.success && response.data) {
        setLogs(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch AI logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterModule]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const truncate = (text: string, maxLen: number = 60) => {
    if (!text) return "";
    return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-3">AI Processing Logs</h1>
            <p className="text-[#6B7280]">
              View and analyze all AI-generated responses and processing history
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-[#1A1A1A] hover:bg-[#F1F8F4] hover:border-[#4CAF50] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <GlassCard className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent appearance-none min-w-[200px]"
            >
              <option value="all">
                All Modules
              </option>
              <option value="Category Generator">
                Category Generator
              </option>
              <option value="Proposal Generator">
                Proposal Generator
              </option>
            </select>
          </div>
        </GlassCard>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <span>{error}</span>
          </div>
        )}

        {/* Logs Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 text-[#4CAF50] mx-auto mb-4 animate-spin" />
                <p className="text-[#6B7280]">Loading logs...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#F8F9FA] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-[#1A1A1A] font-medium">Module Name</th>
                    <th className="px-6 py-4 text-left text-[#1A1A1A] font-medium hidden md:table-cell">
                      Prompt Preview
                    </th>
                    <th className="px-6 py-4 text-left text-[#1A1A1A] font-medium hidden lg:table-cell">
                      Response Preview
                    </th>
                    <th className="px-6 py-4 text-left text-[#1A1A1A] font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#4CAF50] rounded-full" />
                          <span className="text-[#1A1A1A]">{log.module_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280] hidden md:table-cell">
                        <div className="max-w-xs truncate">{truncate(log.prompt)}</div>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280] hidden lg:table-cell">
                        <div className="max-w-md truncate">
                          {truncate(log.raw_response || "")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280] whitespace-nowrap">
                        {formatTimestamp(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && logs.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="w-16 h-16 text-[#6B7280]/30 mx-auto mb-4" />
                <p className="text-[#6B7280]">
                  {searchQuery || filterModule !== "all"
                    ? "No logs found matching your criteria"
                    : "No AI logs yet. Generate some categories or proposals first!"}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <GlassCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#1A1A1A]">{selectedLog.module_name}</h2>
                <p className="text-[#6B7280] text-sm">{formatTimestamp(selectedLog.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-[#1A1A1A]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Full Prompt */}
              <div>
                <h3 className="text-[#1A1A1A] font-medium mb-3">Full Prompt</h3>
                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-200">
                  <p className="text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{selectedLog.prompt}</p>
                </div>
              </div>

              {/* Full Response */}
              <div>
                <h3 className="text-[#1A1A1A] font-medium mb-3">Full Response (JSON)</h3>
                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-200 overflow-x-auto">
                  <pre className="text-[#2E7D32] text-sm font-mono">
                    {selectedLog.parsed_json
                      ? JSON.stringify(selectedLog.parsed_json, null, 2)
                      : selectedLog.raw_response || "No response"}
                  </pre>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h3 className="text-[#1A1A1A] font-medium mb-3">Metadata</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F8F9FA] rounded-lg p-3 border border-gray-200">
                    <div className="text-[#6B7280] text-sm mb-1">Log ID</div>
                    <div className="text-[#1A1A1A] font-medium text-sm break-all">{selectedLog.id}</div>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-lg p-3 border border-gray-200">
                    <div className="text-[#6B7280] text-sm mb-1">Module</div>
                    <div className="text-[#1A1A1A] font-medium">{selectedLog.module_name}</div>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-lg p-3 border border-gray-200">
                    <div className="text-[#6B7280] text-sm mb-1">Timestamp</div>
                    <div className="text-[#1A1A1A] font-medium">{formatTimestamp(selectedLog.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}