import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}