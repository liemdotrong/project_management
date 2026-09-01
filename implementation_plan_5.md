# Mục tiêu
Hoàn thiện tính năng Cập nhật (Sửa) và Xóa (Delete) cho các mục con (Sub-tabs) bên trong Task Drawer dành cho role PM.

## Proposed Changes

### 1. Actions Layer (Backend)
Bổ sung các hàm Server Actions còn thiếu để xử lý nghiệp vụ Sửa/Xóa. Các thao tác này sẽ kiểm tra Session và ghi log vào `ActivityLog`.

- **Risk Actions** (`actions/risk.actions.ts`)
  - Hàm `updateRisk`: Đã có, chỉ cần tái sử dụng.
  - Hàm `deleteRisk`: Bổ sung thêm, xóa Risk và log `DELETED_RISK`.
- **Expense Actions** (`actions/expense.actions.ts`)
  - Hàm `updateExpense`: Bổ sung thêm, cập nhật Category/Amount và log `UPDATED_EXPENSE`.
  - Hàm `deleteExpense`: Bổ sung thêm, xóa Expense và log `DELETED_EXPENSE`.
- **Opportunity Actions** (`actions/opportunity.actions.ts`)
  - Hàm `updateOpportunity`: Bổ sung thêm, cập nhật các trường và trạng thái, log `UPDATED_OPPORTUNITY`.
  - Hàm `deleteOpportunity`: Bổ sung thêm, xóa Opportunity và log `DELETED_OPPORTUNITY`.
- **Document Actions** (`actions/document.actions.ts`)
  - Hàm `deleteDocument`: Bổ sung thêm để cho phép người dùng gỡ bỏ file đính kèm sai. Cập nhật log `DELETED_DOCUMENT`. (Sẽ không hỗ trợ sửa file mà chỉ có xóa và upload lại để đơn giản hóa quy trình).

### 2. UI Layer (Frontend)
Cập nhật `components/TaskDrawer.tsx` để hiển thị nút Sửa / Xóa cho PM.

- Dựa trên quyền `subTabPermissions.can_update` và `subTabPermissions.can_delete` được truyền vào, hệ thống sẽ render các nút thao tác tương ứng (Icon Edit/Trash) trên từng thẻ item.
- Khi bấm Sửa:
  - Sẽ mở inline-form (form nội bộ thay thế item đó) thay vì mở modal mới, giúp trải nghiệm liền mạch.
  - Form cho phép cập nhật nhanh và lưu trữ lại.

> [!WARNING]
> Quyền `can_delete` và `can_update` chỉ được cấp cho role PM (hoặc Admin tùy theo config sau này). Role Member chỉ có quyền `can_create`.

## Open Questions

1. Đối với **Document (Tài liệu)**, tôi dự định chỉ thiết kế chức năng **Xóa** (nếu upload nhầm thì xóa đi upload lại) chứ không làm form Sửa tên file. Việc này có phù hợp với luồng công việc hiện tại không?
2. Khi tiến hành **Xóa**, bạn có muốn hệ thống hiện ra 1 hộp thoại xác nhận (Confirm Alert) trước khi xóa thật không, hay là sẽ bấm xóa ngay lập tức?
