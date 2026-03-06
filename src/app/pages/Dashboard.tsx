import { Link } from "react-router";
import { GlassCard } from "../components/GlassCard";
import { Sparkles, Package, FolderTree, FileText, Leaf, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../lib/api";

export function Dashboard() {
  const [stats, setStats] = useState([
    { label: "Total Products", value: "–", icon: Package, color: "#4CAF50" },
    { label: "AI Categories Generated", value: "–", icon: FolderTree, color: "#2E7D32" },
    { label: "Proposals Created", value: "–", icon: FileText, color: "#1B5E20" },
    { label: "Sustainability Impact Score", value: "–", icon: Leaf, color: "#4CAF50" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        if (response.success && response.data) {
          const d = response.data;
          setStats([
            {
              label: "Total Products",
              value: d.total_products.toLocaleString(),
              icon: Package,
              color: "#4CAF50",
            },
            {
              label: "AI Categories Generated",
              value: d.ai_categories_generated.toLocaleString(),
              icon: FolderTree,
              color: "#2E7D32",
            },
            {
              label: "Proposals Created",
              value: d.proposals_created.toLocaleString(),
              icon: FileText,
              color: "#1B5E20",
            },
            {
              label: "Sustainability Impact Score",
              value: d.sustainability_score > 0 ? `${d.sustainability_score}%` : "N/A",
              icon: Leaf,
              color: "#4CAF50",
            },
          ]);
        }
      } catch (err) {
        // Silently fall back to placeholders
        console.error("Failed to load dashboard stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F8F4] to-[#E8F5E9] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#4CAF50]/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2E7D32]/20 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-white border border-[#4CAF50]/20 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#4CAF50]" />
              <span className="text-[#2E7D32] text-sm font-medium">AI-Powered Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight">
              AI-Powered Sustainable
              <br />
              <span className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] bg-clip-text text-transparent">
                Commerce Automation
              </span>
            </h1>

            <p className="text-[#6B7280] text-lg lg:text-xl max-w-3xl mx-auto mb-10">
              Automate product categorization with AI-driven metadata generation. Create intelligent
              B2B proposals with sustainability impact tracking. Streamline your eco-commerce workflow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/category-generator"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white px-8 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-[#4CAF50]/30 transition-all group"
              >
                Generate Metadata
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/proposal-generator"
                className="inline-flex items-center gap-2 bg-white text-[#2E7D32] px-8 py-4 rounded-xl font-medium border border-[#4CAF50]/30 hover:bg-[#E8F5E9] transition-all"
              >
                Create Proposal
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={index} className="p-6 hover:scale-105 transition-transform hover:shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#1A1A1A] mb-2">{stat.value}</div>
                  <div className="text-[#6B7280] text-sm">{stat.label}</div>
                </GlassCard>
              );
            })}
          </div>

          {/* Dashboard Preview Mockup */}
          <GlassCard className="p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#1A1A1A] mb-3">
                Enterprise Admin Dashboard Preview
              </h2>
              <p className="text-[#6B7280]">
                Comprehensive analytics and AI-powered insights for sustainable commerce
              </p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-6 lg:p-8 border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Placeholder 1 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#1A1A1A] font-medium">Category Distribution</span>
                    <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse" />
                  </div>
                  <div className="h-32 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-8 border-[#E8F5E9] border-t-[#4CAF50]" />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-[#1A1A1A]">
                      {stats[1].value}
                    </div>
                    <div className="text-[#6B7280] text-sm">Active Categories</div>
                  </div>
                </div>

                {/* Chart Placeholder 2 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#1A1A1A] font-medium">AI Processing</span>
                    <div className="w-2 h-2 bg-[#2E7D32] rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {[92, 87, 78, 95].map((value, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#6B7280]">Model {i + 1}</span>
                          <span className="text-[#1A1A1A]">{value}%</span>
                        </div>
                        <div className="h-2 bg-[#F1F8F4] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart Placeholder 3 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#1A1A1A] font-medium">Sustainability Score</span>
                    <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse" />
                  </div>
                  <div className="h-32 flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#E8F5E9"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#4CAF50"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="351.68"
                          strokeDashoffset="35.168"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#1A1A1A]">
                          {stats[3].value}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-[#6B7280] text-sm">
                    Overall Impact Rating
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}