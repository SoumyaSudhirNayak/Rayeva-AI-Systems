import { useState } from "react";
import { GlassCard } from "../components/GlassCard";
import { Upload, Sparkles, Save, Copy, Check, AlertCircle } from "lucide-react";
import { generateProductMetadata } from "../lib/api";

export function CategoryGenerator() {
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    image: null as File | null,
  });

  const [output, setOutput] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setIsSaved(false);

    try {
      const response = await generateProductMetadata(
        formData.productName,
        formData.description
      );

      if (response.success && response.data) {
        const d = response.data;
        setOutput({
          primaryCategory: d.primary_category,
          subCategory: d.sub_category,
          seoTags: d.seo_tags || [],
          sustainabilityFilters: d.sustainability_filters || [],
          json: {
            productName: d.name,
            primaryCategory: d.primary_category,
            subCategory: d.sub_category,
            tags: d.seo_tags || [],
            sustainability: d.sustainability_filters || [],
            metadata: {
              generatedBy: "AI Category Generator v2.1",
              timestamp: d.created_at || new Date().toISOString(),
              productId: d.id,
            },
          },
        });
        setIsSaved(true); // Auto-saved on generate
      } else {
        setError("Failed to generate metadata. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const copyJSON = () => {
    if (output) {
      navigator.clipboard.writeText(JSON.stringify(output.json, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-3">
            AI Auto-Category Generator
          </h1>
          <p className="text-[#6B7280]">
            Automatically generate product categories, SEO tags, and sustainability filters using AI
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
          {/* Left: Form */}
          <GlassCard className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">Product Information</h2>

            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-[#1A1A1A] mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#1A1A1A] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the product features and benefits (min 10 characters)"
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent resize-none"
                />
              </div>

              {/* Upload Image */}
              <div>
                <label className="block text-[#1A1A1A] mb-2">Upload Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-8 bg-white border-2 border-dashed border-gray-300 rounded-xl text-[#6B7280] hover:border-[#4CAF50] hover:bg-[#F1F8F4] transition-all cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{formData.image ? formData.image.name : "Click to upload image"}</span>
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!formData.productName || formData.description.length < 10 || isGenerating}
                className="w-full lg:sticky lg:bottom-0 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-[#4CAF50]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generating..." : "Generate Categories"}
              </button>
            </div>
          </GlassCard>

          {/* Right: Output */}
          <GlassCard className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">AI Output</h2>

            {!output ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Sparkles className="w-16 h-16 text-[#4CAF50]/30 mb-4" />
                <p className="text-[#6B7280]">
                  Fill in the product information and click Generate to see AI results
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Primary Category */}
                <div>
                  <label className="block text-[#6B7280] text-sm mb-2">Primary Category</label>
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white rounded-lg font-medium">
                    {output.primaryCategory}
                  </div>
                </div>

                {/* Sub Category */}
                <div>
                  <label className="block text-[#6B7280] text-sm mb-2">Sub Category</label>
                  <div className="text-[#1A1A1A] font-medium">{output.subCategory}</div>
                </div>

                {/* SEO Tags */}
                <div>
                  <label className="block text-[#6B7280] text-sm mb-3">SEO Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {output.seoTags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-sm border border-[#4CAF50]/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sustainability Filters */}
                <div>
                  <label className="block text-[#6B7280] text-sm mb-3">Sustainability Filters</label>
                  <div className="flex flex-wrap gap-2">
                    {output.sustainabilityFilters.map((filter: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#4CAF50] text-white rounded-full text-sm font-medium"
                      >
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>

                {/* JSON Preview */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[#6B7280] text-sm">JSON Preview</label>
                    <button
                      onClick={copyJSON}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#E8F5E9] text-[#2E7D32] rounded-lg text-sm hover:bg-[#4CAF50] hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-200 overflow-x-auto">
                    <pre className="text-[#2E7D32] text-sm font-mono">
                      {JSON.stringify(output.json, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Saved Indicator */}
                {isSaved && (
                  <div className="flex items-center gap-2 text-[#2E7D32] bg-[#E8F5E9] px-4 py-3 rounded-xl border border-[#4CAF50]/30">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Saved to database automatically</span>
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