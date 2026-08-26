"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task }: { task: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id, // ID của task sẽ được gửi đi khi kéo
    data: { currentStatus: task.status } // Lưu trạng thái hiện tại
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 mb-2 bg-white rounded-lg shadow cursor-grab active:cursor-grabbing border border-slate-200"
    >
      <h4 className="font-semibold text-slate-800">{task.title}</h4>
      <p className="text-sm text-slate-500 mt-1">{task.description}</p>
    </div>
  );
}