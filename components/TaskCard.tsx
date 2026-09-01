"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, ArrowUpRight, Paperclip, ChevronsUp, ChevronUp, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaskCard({ task, onClick, permissions }: { task: any, onClick?: () => void, permissions?: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { currentStatus: task.column_id },
    disabled: permissions && !permissions.can_move
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const rollup = task.rollup || {};
  const isBudgetOverrun = (rollup.totalExpenses || 0) > (task.budget || 0) && (task.budget || 0) > 0;
  
  // Risk Indicator Color
  let riskColor = "bg-slate-50 text-slate-500 border-slate-200";
  if (rollup.maxRiskScore >= 15) riskColor = "bg-rose-50 text-rose-600 border-rose-200";
  else if (rollup.maxRiskScore >= 8) riskColor = "bg-amber-50 text-amber-600 border-amber-200";
  else if (rollup.maxRiskScore > 0) riskColor = "bg-emerald-50 text-emerald-600 border-emerald-200";

  const expensePercentage = task.budget ? Math.min(100, Math.round((rollup.totalExpenses / task.budget) * 100)) : 0;

  const PriorityIcon = () => {
    switch(task.priority) {
      case 'URGENT': return <ChevronsUp size={16} className="text-rose-600" />;
      case 'HIGH': return <ChevronUp size={16} className="text-amber-600" />;
      case 'LOW': return <ChevronDown size={16} className="text-slate-400" />;
      default: return <Minus size={16} className="text-blue-500" />; // MED
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "p-4 mb-3 bg-white rounded-xl border transition-all duration-200 group cursor-grab active:cursor-grabbing relative overflow-hidden",
        isDragging ? "opacity-70 ring-2 ring-indigo-500 shadow-2xl scale-[1.02] z-50" : "shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5",
        isBudgetOverrun ? "border-rose-300 ring-1 ring-rose-300" : "border-slate-200"
      )}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-medium text-slate-800 leading-snug flex-1">{task.title}</h4>
        
        {/* Risk Indicator */}
        {rollup.maxRiskScore > 0 && (
          <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 shrink-0", riskColor)}>
            <AlertCircle size={10} />
            <span>{rollup.maxRiskScore}</span>
          </div>
        )}
      </div>
      
      {/* Badges row */}
      {(rollup.totalOppValue > 0 || rollup.documentCount > 0) && (
        <div className="flex flex-wrap gap-2 mb-3 mt-3">
          {/* Opportunity Badge */}
          {rollup.totalOppValue > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-100">
              <ArrowUpRight size={12} />
              <span className="font-semibold">${rollup.totalOppValue.toLocaleString('en-US')}</span>
            </div>
          )}
          
          {/* Document Counter */}
          {rollup.documentCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              <Paperclip size={10} />
              <span className="font-semibold">{rollup.documentCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Expense Progress */}
      {task.budget > 0 && (
        <div className="mb-2 mt-3">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
            <span>Spent: ${rollup.totalExpenses?.toLocaleString('en-US') || 0}</span>
            <span className={isBudgetOverrun ? "text-rose-600 font-bold" : ""}>{expensePercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={cn("h-1.5 rounded-full transition-all duration-500", isBudgetOverrun ? "bg-rose-500" : "bg-indigo-500")}
              style={{ width: `${expensePercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer: Priority & Avatars */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center justify-center p-1 rounded hover:bg-slate-100 transition-colors" title={task.priority || 'MED'}>
          <PriorityIcon />
        </div>
        
        {/* Avatars */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((assignee: any, idx: number) => (
              <div key={idx} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-black/5">
                {assignee.name ? assignee.name.charAt(0) : 'U'}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600 shadow-sm ring-1 ring-black/5">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}