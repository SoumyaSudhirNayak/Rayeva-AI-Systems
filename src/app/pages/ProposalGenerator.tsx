import { useState } from "react";
import { GlassCard } from "../components/GlassCard";
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { generateB2BProposal } from "../lib/api";

export function ProposalGenerator() {
  const formatINR = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value || 0);

  const [formData, setFormData] = useState({
    budget: "",
    purpose: "",
    quantity: "",
  });

  const [output, setOutput] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    products: true,
    budget: true,
    cost: true,
    impact: true,
    json: false,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setIsSaved(false);

    try {
      const response = await generateB2BProposal(
        parseFloat(formData.budget),
        formData.purpose,
        parseInt(formData.quantity)
      );

      if (response.success && response.data) {
        const d = response.data;

        // Transform snake_case from API to camelCase for display
        const products = (d.products || d.product_mix || []).map((p: any) => ({
          name: p.name,
          category: p.category,
          quantity: p.quantity,
          unitPrice: p.unit_price ?? p.unitPrice,
          total: p.total,
          sustainabilityScore: p.sustainability_score ?? p.sustainabilityScore,
        }));

        const allocationRaw = d.budgetAllocation || d.budget_allocation || d.allocation || [];
        const palette = ["#4CAF50", "#2E7D32", "#1B5E20", "#388E3C", "#66BB6A"];
        const budgetAllocation = Array.isArray(allocationRaw)
          ? allocationRaw.map((b: any, i: number) => ({
              name: b.name,
              value: b.value,
              color: b.color ?? palette[i % palette.length],
            }))
          : typeof allocationRaw === "object" && allocationRaw
            ? Object.entries(allocationRaw).map(([name, value], i) => ({
                name,
                value: typeof value === "number" ? value : Number(value),
                color: palette[i % palette.length],
              }))
            : [];

        const cb = d.costBreakdown || d.cost_breakdown || {};
        const costBreakdown = {
          subtotal: cb.subtotal || 0,
          tax: cb.tax || 0,
          shipping: cb.shipping || 0,
          total: cb.total || 0,
        };

        const is = d.impactSummary || d.impact_summary || {};
        const impactSummary = {
          co2Saved: is.co2_saved ?? is.co2Saved ?? "0 kg",
          treesPlanted: is.trees_planted ?? is.treesPlanted ?? 0,
          plasticReduced: is.plastic_reduced ?? is.plasticReduced ?? "0%",
          overallScore: is.overall_score ?? is.overallScore ?? 0,
        };

        setOutput({
          products,
          budgetAllocation,
          costBreakdown,
          impactSummary,
        });
        setIsSaved(true); // Auto-saved on generate
      } else {
        setError("Failed to generate proposal. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const copyJSON = () => {
    if (output) {
      navigator.clipboard.writeText(JSON.stringify(output, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-3">B2B Proposal Generator</h1>
          <p className="text-[#6B7280]">
            Generate intelligent B2B proposals with budget allocation and sustainability impact
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Desktop: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel: Form */}
          <GlassCard className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">Proposal Details</h2>

            <div className="space-y-6">
              {/* Budget */}
              <div>
                <label className="block text-[#1A1A1A] mb-2">Budget (INR)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="Enter budget amount (₹)"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-[#1A1A1A] mb-2">Purpose</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent appearance-none"
                >
                  <option value="">
                    Select purpose
                  </option>
                  <option value="office-supplies">
                    Office Supplies
                  </option>
                  <option value="restaurant-equipment">
                    Restaurant Equipment
                  </option>
                  <option value="retail-inventory">
                    Retail Inventory
                  </option>
                  <option value="corporate-gifts">
                    Corporate Gifts
                  </option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[#1A1A1A] mb-2">Total Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!formData.budget || !formData.purpose || !formData.quantity || isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-[#4CAF50]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generating..." : "Generate Proposal"}
              </button>
            </div>
          </GlassCard>

          {/* Right Panel: Output */}
          <GlassCard className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">Proposal Dashboard</h2>

            {!output ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Sparkles className="w-16 h-16 text-[#4CAF50]/30 mb-4" />
                <p className="text-[#6B7280]">
                  Enter proposal details and click Generate to see results
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Suggested Product Mix */}
                <div className="bg-[#F8F9FA] rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection("products")}
                    className="w-full flex items-center justify-between px-4 py-3 text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">Suggested Product Mix</span>
                    {expandedSections.products ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.products && (
                    <div className="px-4 pb-4 space-y-3">
                      {output.products.map((product: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-[#1A1A1A] font-medium">{product.name}</div>
                              <div className="text-[#6B7280] text-sm">{product.category}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[#1A1A1A] font-semibold">
                                {formatINR(product.total)}
                              </div>
                              <div className="text-[#6B7280] text-sm">
                                {formatINR(product.unitPrice)} × {product.quantity}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex-1 h-2 bg-[#F1F8F4] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]"
                                style={{ width: `${product.sustainabilityScore}%` }}
                              />
                            </div>
                            <span className="text-[#4CAF50] text-sm font-medium">
                              {product.sustainabilityScore}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget Allocation Chart */}
                <div className="bg-[#F8F9FA] rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection("budget")}
                    className="w-full flex items-center justify-between px-4 py-3 text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">Budget Allocation</span>
                    {expandedSections.budget ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.budget && (
                    <div className="px-4 pb-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={output.budgetAllocation}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {output.budgetAllocation.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            wrapperStyle={{ color: "#6B7280", fontSize: "14px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="bg-[#F8F9FA] rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection("cost")}
                    className="w-full flex items-center justify-between px-4 py-3 text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">Cost Breakdown</span>
                    {expandedSections.cost ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.cost && (
                    <div className="px-4 pb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[#6B7280]">
                          <span>Subtotal</span>
                          <span>{formatINR(output.costBreakdown.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#6B7280]">
                          <span>Tax (8%)</span>
                          <span>{formatINR(output.costBreakdown.tax)}</span>
                        </div>
                        <div className="flex justify-between text-[#6B7280]">
                          <span>Shipping</span>
                          <span>{formatINR(output.costBreakdown.shipping)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between text-[#1A1A1A] font-semibold text-lg">
                            <span>Total</span>
                            <span>{formatINR(output.costBreakdown.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Impact Summary */}
                <div className="bg-gradient-to-br from-[#E8F5E9] to-[#F1F8F4] rounded-xl border border-[#4CAF50]/30 overflow-hidden">
                  <button
                    onClick={() => toggleSection("impact")}
                    className="w-full flex items-center justify-between px-4 py-3 text-[#1A1A1A] hover:bg-[#E8F5E9] transition-colors"
                  >
                    <span className="font-medium">Sustainability Impact</span>
                    {expandedSections.impact ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.impact && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 text-center border border-[#4CAF50]/20">
                          <div className="text-2xl font-bold text-[#4CAF50]">
                            {output.impactSummary.co2Saved}
                          </div>
                          <div className="text-[#6B7280] text-sm">CO₂ Saved</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-[#4CAF50]/20">
                          <div className="text-2xl font-bold text-[#4CAF50]">
                            {output.impactSummary.treesPlanted}
                          </div>
                          <div className="text-[#6B7280] text-sm">Trees Planted</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-[#4CAF50]/20">
                          <div className="text-2xl font-bold text-[#4CAF50]">
                            {output.impactSummary.plasticReduced}
                          </div>
                          <div className="text-[#6B7280] text-sm">Plastic Reduced</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-[#4CAF50]/20">
                          <div className="text-2xl font-bold text-[#4CAF50]">
                            {output.impactSummary.overallScore}%
                          </div>
                          <div className="text-[#6B7280] text-sm">Overall Score</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* JSON Preview */}
                <div className="bg-[#F8F9FA] rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection("json")}
                    className="w-full flex items-center justify-between px-4 py-3 text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">JSON Preview</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyJSON();
                        }}
                        className="px-2 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded hover:bg-[#4CAF50] hover:text-white transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {expandedSections.json ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                  {expandedSections.json && (
                    <div className="px-4 pb-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-200 overflow-x-auto max-h-64 overflow-y-auto">
                        <pre className="text-[#2E7D32] text-sm font-mono">
                          {JSON.stringify(output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Saved Indicator */}
                {isSaved && (
                  <div className="flex items-center gap-2 text-[#2E7D32] bg-[#E8F5E9] px-4 py-3 rounded-xl border border-[#4CAF50]/30">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Proposal saved to database</span>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
