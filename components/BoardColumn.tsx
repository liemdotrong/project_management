"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import React from "react";
import { CircleDashed, CircleDot, CheckCircle2, Circle, Clock } from "lucide-react";

export default function BoardColumn({ 
  id, 
  title, 
  children, 
  count = 0, 
  wipLimit = 0 
}: { 
  id: string, 
  title: string, 
  children: React.ReactNode,
  count?: number,
  wipLimit?: number
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const isOverLimit = wipLimit > 0 && count > wipLimit;

  // Determine Icon and Color based on ID
  const getHeaderStyle = () => {
    switch(id) {
      case 'BACKLOG': return { icon: <CircleDashed size={16} className="text-slate-400" />, color: "text-slate-600" };
      case 'TODO': return { icon: <Circle size={16} className="text-blue-500" />, color: "text-blue-700" };
      case 'IN_PROGRESS': return { icon: <Clock size={16} className="text-amber-500" />, color: "text-amber-700" };
      case 'IN_REVIEW': return { icon: <CircleDot size={16} className="text-purple-500" />, color: "text-purple-700" };
      case 'DONE': return { icon: <CheckCircle2 size={16} className="text-emerald-500" />, color: "text-emerald-700" };
      default: return { icon: <Circle size={16} className="text-slate-400" />, color: "text-slate-700" };
    }
  }

  const { icon, color } = getHeaderStyle();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-shrink-0 w-80 rounded-2xl transition-all duration-300 border",
        "bg-slate-100/50",
        isOver ? "ring-2 ring-indigo-400 bg-indigo-50/30 border-indigo-200" : "border-slate-200/60",
        isOverLimit && isOver ? "ring-rose-400 bg-rose-50/50 border-rose-200" : "" 
      )}
    >
      <div className="flex justify-between items-center p-3 border-b border-slate-200/60 mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className={cn("font-semibold text-sm tracking-tight", color)}>{title}</h3>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded-full text-xs font-bold shadow-sm",
          isOverLimit ? "bg-rose-100 text-rose-700" : "bg-white text-slate-500 border border-slate-200"
        )}>
          {count} {wipLimit > 0 && <span className="text-slate-400 font-medium">/ {wipLimit}</span>}
        </div>
      </div>
      
      {/* Hide scrollbar but keep scrollable */}
      <div className="flex-1 overflow-y-auto min-h-[150px] p-2 hide-scrollbar">
        {children}
      </div>
    </div>
  );
}