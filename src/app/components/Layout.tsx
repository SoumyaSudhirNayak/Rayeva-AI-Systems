import { Outlet, Link, useLocation } from "react-router";
import { Menu, X, Sparkles, FileText, FileBarChart, Database } from "lucide-react";
import { useState } from "react";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Sparkles },
    { name: "Category Generator", href: "/category-generator", icon: FileText },
    { name: "Proposal Generator", href: "/proposal-generator", icon: FileBarChart },
    { name: "AI Logs", href: "/ai-logs", icon: Database },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#1A1A1A] font-semibold">SustainCommerce</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[#1A1A1A] p-2 hover:bg-[#E8F5E9] rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[#1A1A1A] font-semibold">SustainCommerce</h1>
              <p className="text-[#6B7280] text-xs">AI Platform</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#4CAF50]/30"
                      : "text-[#6B7280] hover:bg-[#F1F8F4] hover:text-[#2E7D32]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#4CAF50]/30"
                      : "text-[#6B7280] hover:bg-[#F1F8F4] hover:text-[#2E7D32]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-[73px] lg:pt-0">
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-[73px]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}