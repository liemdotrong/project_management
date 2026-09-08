import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-[9999]">
      <div className="relative w-16 h-16 animate-spin mb-4">
        {/* We use an img tag for the favicon.ico */}
        <img src="/favicon.ico" alt="Loading..." className="w-full h-full object-contain" />
      </div>
      <p className="text-slate-600 font-medium tracking-wide animate-pulse">Đang tải dữ liệu...</p>
    </div>
  );
}
