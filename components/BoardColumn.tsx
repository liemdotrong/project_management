"use client";

import { useDroppable } from "@dnd-kit/core";

export default function BoardColumn({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id, // ID của cột chính là trạng thái (VD: 'TODO')
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-w-[250px] p-4 rounded-xl bg-slate-100 ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
        >
            <h3 className="font-bold text-slate-700 mb-4">{title}</h3>
            <div className="min-h-[200px]">
                {children}
            </div>
        </div>
    );
}