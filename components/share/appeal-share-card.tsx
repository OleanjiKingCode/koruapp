"use client";

import { forwardRef } from "react";
import { TrendUpIcon, TrendDownIcon, CheckIcon } from "@/components/icons";
import type { Appeal } from "@/lib/types";

interface AppealShareCardProps {
  appeal: Appeal;
  variant?: "default" | "compact" | "vibrant" | "dark";
  className?: string;
}

// Format number with K/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// The main Appeal Share Card component
export const AppealShareCard = forwardRef<HTMLDivElement, AppealShareCardProps>(
  ({ appeal, variant = "default", className }, ref) => {
    const TrendIcon = appeal.trend === "up" ? TrendUpIcon : TrendDownIcon;
    const trendColor = appeal.trend === "up" ? "#9deb61" : "#ef4444";
    
    if (variant === "compact") {
      return (
        <div
          ref={ref}
          className={`w-[400px] h-[220px] relative overflow-hidden ${className}`}
          style={{ 
            background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c385ee] via-[#dab079] to-[#9deb61]" />
          
          <div className="relative z-10 h-full p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Appeal for</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-neutral-900">
                    @{appeal.targetHandle}
                  </h2>
                  <span 
                    className="px-2 py-0.5 rounded-md text-xs font-semibold"
                    style={{ background: "#c385ee20", color: "#c385ee" }}
                  >
                    {appeal.category}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">{appeal.targetName}</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end" style={{ color: trendColor }}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">+{appeal.trendValue}%</span>
                </div>
              </div>
            </div>
            
            {/* Request */}
            <p className="text-sm text-neutral-600 line-clamp-2 flex-1">
              "{appeal.request}"
            </p>
            
            {/* Stats bar */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-neutral-900">${formatNumber(appeal.totalPledged)}</p>
                  <p className="text-xs text-neutral-400">pledged</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#c385ee]">{appeal.backers}</p>
                  <p className="text-xs text-neutral-400">backers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#c385ee] to-[#9deb61] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">K</span>
                </div>
                <span className="text-neutral-400 text-sm font-medium">koru</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (variant === "vibrant") {
      return (
        <div
          ref={ref}
          className={`w-[480px] h-[300px] relative overflow-hidden rounded-3xl ${className}`}
          style={{ 
            background: "linear-gradient(135deg, #c385ee 0%, #8b5cf6 50%, #6366f1 100%)",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-black/10 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-[#9deb61]/30 rounded-full blur-2xl" />
          
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }} />
          
          <div className="relative z-10 h-full p-8 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white">
                  {appeal.targetName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    @{appeal.targetHandle}
                  </h2>
                  <p className="text-sm text-white/60">{appeal.targetName}</p>
                </div>
              </div>
              
              <div 
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
              >
                {appeal.category}
              </div>
            </div>
            
            {/* Request quote */}
            <div className="flex-1 flex items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <p className="text-lg text-white font-medium leading-relaxed">
                  "{appeal.request}"
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-end justify-between pt-4">
              <div className="flex gap-8">
                <div>
                  <p className="text-4xl font-black text-white">
                    ${formatNumber(appeal.totalPledged)}
                  </p>
                  <p className="text-sm text-white/50 font-medium">Total Pledged</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-[#9deb61]">
                    {appeal.backers}
                  </p>
                  <p className="text-sm text-white/50 font-medium">Backers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20">
                  <TrendIcon className="w-4 h-4" style={{ color: appeal.trend === "up" ? "#9deb61" : "#fca5a5" }} />
                  <span className="text-sm font-bold text-white">+{appeal.trendValue}%</span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/10">
              <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
                <span className="text-[#c385ee] text-xs font-bold">K</span>
              </div>
              <span className="text-white/60 text-sm font-medium">koruapp.xyz</span>
            </div>
          </div>
        </div>
      );
    }
    
    if (variant === "dark") {
      return (
        <div
          ref={ref}
          className={`w-[480px] h-[320px] relative overflow-hidden rounded-3xl ${className}`}
          style={{ 
            background: "#0a0a0a",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          {/* Border glow */}
          <div className="absolute inset-0 rounded-3xl" style={{
            background: "linear-gradient(135deg, #dab079, #c385ee, #9deb61)",
            padding: "1px"
          }}>
            <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-[23px]" />
          </div>
          
          {/* Glow spots */}
          <div className="absolute top-0 left-1/3 w-48 h-48 bg-[#dab079] rounded-full blur-[120px] opacity-15" />
          <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-[#c385ee] rounded-full blur-[100px] opacity-10" />
          
          <div className="relative z-10 h-full p-8 flex flex-col">
            {/* Top label */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#dab079] animate-pulse" />
                <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Live Appeal</span>
              </div>
              <span 
                className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ background: "rgba(218,176,121,0.15)", color: "#dab079" }}
              >
                {appeal.category}
              </span>
            </div>
            
            {/* Main content */}
            <div className="flex items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#dab079]/20 to-[#c385ee]/20 flex items-center justify-center border border-white/5">
                <span className="text-3xl font-black text-[#dab079]">
                  {appeal.targetName.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  @{appeal.targetHandle}
                </h2>
                <p className="text-sm text-white/40">{appeal.targetName}</p>
              </div>
              
              {/* Trend indicator */}
              <div className="flex items-center gap-1.5" style={{ color: trendColor }}>
                <TrendIcon className="w-5 h-5" />
                <span className="text-lg font-bold">+{appeal.trendValue}%</span>
              </div>
            </div>
            
            {/* Request */}
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 mb-6">
              <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">Request</p>
              <p className="text-white font-medium">"{appeal.request}"</p>
            </div>
            
            {/* Stats */}
            <div className="flex-1 flex items-end">
              <div className="w-full flex justify-between items-end">
                <div className="flex gap-8">
                  <div>
                    <p className="text-3xl font-black text-[#dab079]">
                      ${formatNumber(appeal.totalPledged)}
                    </p>
                    <p className="text-xs text-white/30 mt-1">Pledged</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">
                      {appeal.backers}
                    </p>
                    <p className="text-xs text-white/30 mt-1">Backers</p>
                  </div>
                </div>
                
                {/* Koru branding */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c385ee] via-[#dab079] to-[#9deb61] flex items-center justify-center">
                    <span className="text-black text-sm font-bold">K</span>
                  </div>
                  <span className="text-white/50 text-sm font-medium">koru</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Default variant - Clean professional design
    return (
      <div
        ref={ref}
        className={`w-[480px] h-[300px] relative overflow-hidden rounded-3xl ${className}`}
        style={{ 
          background: "linear-gradient(145deg, #fefefe 0%, #f8f8f8 100%)",
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 4px 60px rgba(0,0,0,0.08)"
        }}
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#dab079] via-[#c385ee] to-[#9deb61]" />
        
        {/* Decorative background shape */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#dab079]/10 to-[#c385ee]/10 rounded-full" />
        
        <div className="relative z-10 h-full p-8 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Avatar circle */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#dab079] to-[#c385ee] flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-white">
                  {appeal.targetName.charAt(0)}
                </span>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-neutral-900">
                    @{appeal.targetHandle}
                  </h2>
                </div>
                <p className="text-sm text-neutral-500">{appeal.targetName}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span 
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ background: "#c385ee15", color: "#c385ee" }}
              >
                {appeal.category}
              </span>
              <div className="flex items-center gap-1" style={{ color: trendColor }}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-bold">+{appeal.trendValue}%</span>
              </div>
            </div>
          </div>
          
          {/* Request */}
          <div className="bg-neutral-50 rounded-xl p-4 mb-5 border border-neutral-100">
            <p className="text-neutral-700 font-medium leading-relaxed">
              "{appeal.request}"
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex-1 flex items-end">
            <div className="w-full flex justify-between items-end">
              <div className="flex gap-8">
                <div>
                  <p className="text-4xl font-black text-neutral-900">
                    ${formatNumber(appeal.totalPledged)}
                  </p>
                  <p className="text-sm text-neutral-400">Total Pledged</p>
                </div>
                <div className="pl-8 border-l border-neutral-200">
                  <p className="text-4xl font-black text-[#c385ee]">
                    {appeal.backers}
                  </p>
                  <p className="text-sm text-neutral-400">Backers</p>
                </div>
              </div>
              
              {/* Branding */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c385ee] via-[#dab079] to-[#9deb61] flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-black">K</span>
                </div>
                <span className="text-neutral-400 text-sm font-semibold">koruapp.xyz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AppealShareCard.displayName = "AppealShareCard";

export default AppealShareCard;

