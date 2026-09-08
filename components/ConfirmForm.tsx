"use client";

import { ReactNode, useState, useRef } from "react";
import ConfirmModal from "./ConfirmModal";

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  actionName: string;      // e.g., "Thêm Project", "Xóa Task"
  entityName?: string;     // Explicit name if known (e.g., for Delete actions)
  entityNameField?: string; // Input field name to extract the name dynamically (e.g., for Create actions)
  children: ReactNode;
  className?: string;
}

export default function ConfirmForm({ action, actionName, entityName, entityNameField, children, className }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [extractedName, setExtractedName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const isConfirmedRef = useRef(false);

  return (
    <>
      <form 
        ref={formRef}
        action={action} 
        className={className}
        onSubmit={(e: any) => {
          if (!isConfirmedRef.current) {
            e.preventDefault();
            const name = entityName || (entityNameField ? e.target[entityNameField]?.value : "") || "này";
            setExtractedName(name);
            setShowModal(true);
          } else {
            isConfirmedRef.current = false; // Reset cho lần sau
          }
        }}
      >
        {children}
      </form>

      <ConfirmModal
        isOpen={showModal}
        title="Xác nhận thao tác"
        message={`Bạn có muốn thực hiện thao tác ${actionName} ${extractedName}?`}
        onConfirm={() => {
          setShowModal(false);
          isConfirmedRef.current = true;
          // Trigger form submission
          formRef.current?.requestSubmit();
        }}
        onCancel={() => {
          setShowModal(false);
        }}
      />
    </>
  );
}
