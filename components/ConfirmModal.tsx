"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure the element is in DOM before starting transition
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 200); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99998] transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0"
        )} 
        onClick={onCancel}
      />
      <div 
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[99999] flex flex-col overflow-hidden transition-all duration-200",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div className="p-5 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="pt-1">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </>
  );
}
