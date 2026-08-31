# Kế Hoạch Triển Khai (Implementation Plan)

## Tổng Quan
Bạn yêu cầu 2 tính năng chính:
1. **Quản lý tài chính (Expenses)**: Cảnh báo tài chính khi chi phí vượt ngân sách (Budget).
2. **Lưu trữ File thực tế (Documents)**: Lưu nội dung file đính kèm vào thẳng MongoDB.

---

## User Review Required

> [!IMPORTANT]
> **Về việc lưu trữ File trong MongoDB:**
> Mặc định MongoDB có giới hạn dung lượng lưu trữ 16MB cho mỗi Document. Tôi sẽ thiết kế để lưu file dưới dạng **Base64 String** trong Collection `Documents` (phù hợp cho các file tài liệu nhỏ như PDF, Word, Ảnh < 10MB). 
> Bạn có đồng ý với cách tiếp cận lưu trực tiếp này không, hay muốn chuyển sang hệ thống lưu trữ ngoài (AWS S3, Local File System)?

---

## Các thay đổi đề xuất (Proposed Changes)

### 1. Quản lý Tài chính (Expenses & Warnings)

#### [MODIFY] `components/TaskDrawer.tsx`
- Trong `ExpensesTab`, tôi sẽ tính toán tổng chi phí (`totalExpenses`) và đối chiếu với ngân sách (`task.budget`).
- **Cảnh báo UI**: Nếu `totalExpenses > budget`, một Banner cảnh báo (Alert) màu đỏ sẽ hiện ra ngay đầu tab Expenses. Đồng thời hiển thị thanh Progress Bar thể hiện % chi tiêu so với ngân sách.

### 2. Upload File vào MongoDB

#### [MODIFY] `models/Document.ts`
- Thêm trường `file_data: { type: String }` để chứa nội dung file dạng Base64.
- Thêm trường `mime_type: { type: String }` để xác định định dạng file (PDF, PNG...).

#### [MODIFY] `actions/document.actions.ts`
- Cập nhật hàm `uploadDocument` để nhận chuỗi `file_data` và `mime_type`.
- Sau khi tạo xong Document, tự động cập nhật `file_url` thành đường dẫn API nội bộ (VD: `/api/documents/65abcd1234`).

#### [NEW] `app/api/documents/[id]/route.ts`
- Tạo một Route API mới chuyên phục vụ việc tải và xem file. Route này sẽ query MongoDB, lấy `file_data`, chuyển ngược lại thành nhị phân (Buffer) và trả về cho trình duyệt kèm `Content-Type` tương ứng.

#### [MODIFY] `components/TaskDrawer.tsx` (Tab Documents)
- Đổi form nhập thông tin file "mock" hiện tại thành một ô `<input type="file" />` thật.
- Khi người dùng chọn file, trình duyệt sẽ đọc file bằng `FileReader`, chuyển sang Base64 và gửi xuống Server Action.

---

## Verification Plan (Kế hoạch xác minh)
1. **Kiểm tra Tài chính**: Tạo 1 Task với Budget là $1000. Thêm Expense $1500. Kiểm tra xem Banner cảnh báo đỏ có xuất hiện không.
2. **Kiểm tra Upload File**: Mở tab Documents, chọn một bức ảnh nhỏ hoặc file PDF. Bấm upload. Sau đó bấm nút "View", hệ thống sẽ tải file đó trực tiếp từ MongoDB.
