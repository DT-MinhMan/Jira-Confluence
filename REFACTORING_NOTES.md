# 📝 NHẬT KÝ TÁI CẤU TRÚC VÀ HƯỚNG DẪN THỰC THI (HANDOVER NOTES)
> **Dự án**: AL-TASK (Jira + Confluence Clone)  
> **Mục tiêu**: Tinh gọn hệ thống, loại bỏ overengineering, đạt chuẩn Portfolio Fresher Fullstack chất lượng cao.  
> **Nhánh Git hiện tại**: `feature/portfolio-lean-refactor` (trên cả `backend` và `frontend`).

---

## 📌 1. TỔNG QUAN NHỮNG GÌ ĐÃ HOÀN THÀNH (PHASE 0 - 2)

### 🟢 Phase 0: Baseline & Safety Verification
* **Git Isolation**: Tạo nhánh `feature/portfolio-lean-refactor` trên cả 2 repository `backend` và `frontend` để bảo vệ mã nguồn ban đầu.
* **Baseline Build**: Chạy build kiểm tra mã nguồn nguyên bản, đảm bảo 0 lỗi biên dịch trước khi refactor.

---

### 🟢 Phase 1: Loại bỏ hoàn toàn Redis & Hạ tầng thừa
* **Gỡ bỏ thư viện**:
  * Đã gỡ bỏ: `@socket.io/redis-adapter`, `cache-manager-redis-yet`, `redis`.
* **Socket.IO Native In-Memory Adapter**:
  * Cấu hình trong `backend/src/main.ts`:
    ```typescript
    app.useWebSocketAdapter(new IoAdapter(app));
    ```
  * Loại bỏ `src/infra/websocket/redis-socket-io.adapter.ts`.
* **In-Memory Cache**:
  * Chuyển đổi `backend/src/modules/cache/cache.module.ts` sang cache in-memory mặc định của NestJS (`CacheModule.register({ isGlobal: true, ttl: 60000, max: 1000 })`).
* **In-Memory Rate Limiting & Progressive Delay**:
  * Viết lại `backend/src/modules/auth/security/login-attempt-throttle.service.ts` dùng In-Memory sliding window và Map thay thế cho Redis Lua script.
  * Toàn bộ test suite bảo mật chạy pass 100%.
* **Xoá file hạ tầng thừa**:
  * Xoá thư mục `backend/src/infra/redis/`.
  * Xoá file `backend/docker-compose.redis.yml`.
  * Dọn dẹp biến môi trường Redis trong `backend/.env.example`.
* **Git Commit**: `6a5a9bd` (`feat(phase-1): remove redis, redis adapter, and configure in-memory fallback`).

---

### 🟢 Phase 2: Cắt gọt Module Chat & Video Call/Meeting (LiveKit)

#### Phía Backend:
* **Gỡ bỏ thư viện**: Gỡ bỏ `livekit-server-sdk`.
* **Xoá module**:
  * Xoá toàn bộ `backend/src/modules/chat/`.
  * Xoá toàn bộ `backend/src/modules/meetings/`.
  * Xoá `src/common/guards/socket-throttler.guard.ts`.
  * Xoá scripts seed stickers không còn dùng (`scripts/seed-stickers-from-json.ts`, `scripts/upload-stickers-to-cloudinary.ts`).
* **Tách rời dependencies liên quan (Decoupling)**:
  * `backend/src/modules/workspaces/services/workspaces.service.ts` & `workspaces.module.ts`: Gỡ bỏ `ChannelsService` và các references tạo kênh chat khi tạo workspace.
  * `backend/src/app.module.ts`: Gỡ bỏ `ChatModule` và `MeetingsModule`.
  * `backend/src/modules/attachments/services/attachment.service.ts`: Gỡ bỏ liên kết `ChannelDocument` (chỉ còn đính kèm file cho Task và Confluence Page).
  * `backend/src/modules/images/images.service.ts`: Gỡ bỏ liên kết channel images.
* **Sửa Unit Test Specs**:
  * Cập nhật constructor injection trong `workspace-avatar.service.spec.ts` và `attachment.service.spec.ts`.
* **Kết quả**: **52/52 test suites pass, 441/441 unit tests pass 100%**. `nest build` thành công rực rỡ với exit code 0.
* **Git Commits**: `23a5642` & `68dda40`.

#### Phía Frontend:
* **Gỡ bỏ thư viện**: Gỡ bỏ `@livekit/components-react`, `@livekit/components-styles`, `livekit-client`.
* **Xoá toàn bộ mã nguồn Chat & Meeting**:
  * Xoá thư mục `frontend/src/modules/client/chat/`.
  * Xoá thư mục `frontend/src/modules/client/meeting/`.
  * Xoá thư mục routes `frontend/app/(client)/chat/`.
  * Xoá thư mục routes `frontend/app/meeting/`.
  * Xoá Zustand store: `frontend/src/stores/chatStore.ts`.
  * Xoá Socket clients: `frontend/src/lib/socket/chat.client.ts` & `socket.chat.ts`.
* **Cập nhật Layout & Điều hướng (UI Clean)**:
  * `frontend/app/(client)/layout.tsx`: Bỏ `ChatRealtimeHandler`.
  * `frontend/src/modules/admin-shared/components/common/components/Sidebar.tsx`: Bỏ nút Chat, Chat Accordion, unread count và chuyển Documents về đúng index `mainNav[5]`.
  * `frontend/src/modules/workspace/shared/components/Header.tsx`: Bỏ Chat quick button và query kênh chat.
  * `frontend/src/modules/notifications/components/NotificationPanel.tsx`: Bỏ link routing điều hướng tới `/chat`.
  * `frontend/src/modules/auth/shared/hooks/useAuth.ts`: Bỏ `chatSocketClient.disconnect()`.
* **Kết quả**: Giảm hơn **8,800 dòng code dư thừa**. `next build` hoàn tất sạch sẽ, build thành công toàn bộ **30 static & dynamic routes** của ứng dụng.
* **Git Commit**: `8d91cb0` (`feat(phase-2): prune chat, meeting, and livekit from frontend`).

---

## 🧭 2. KIẾN TRÚC HIỆN TẠI (SYSTEM STATUS)

1. **Backend**:
   - Chạy Single-Instance NestJS port 5512 (hoặc cấu hình qua `.env`).
   - Kết nối trực tiếp MongoDB Atlas qua Mongoose.
   - Quản lý File Upload / Attachments qua Cloudinary Service.
   - Socket.IO Server dùng **Native In-Memory Adapter**. Các phòng socket hiện có:
     - `workspace:${workspaceId}`: Đồng bộ cập nhật workspace, danh sách thành viên.
     - `task:${taskId}`: Đồng bộ cập nhật chi tiết task, bình luận.
     - `user:${userId}`: Gửi thông báo trực tiếp cho cá nhân.
2. **Frontend**:
   - Next.js App Router (Client module trong `app/(client)/...`).
   - Quản lý trạng thái: TanStack React Query + Zustand stores (`useAuthStore`, `useWorkspaceStore`, `usePermissionStore`).
   - Kéo thả Kanban: `@dnd-kit` và `@hello-pangea/dnd`.
   - Biên tập văn bản Confluence: `@tiptap/react` + ProseMirror plugins.

---

## 🎯 3. HƯỚNG DẪN XỬ LÝ CHI TIẾT CHO CÁC PHASE TIẾP THEO

### 🔷 Phase 3: Hoàn Thiện & Đánh Bóng 5 Trụ Cột Cốt Lõi (Trọng Tâm Kế Tiếp)

#### 1. Trụ cột 1: Workspace & Phân Quyền (RBAC)
* **Mục tiêu**: Phân quyền minh bạch 3 vai trò: `Owner`, `Admin`, `Member`.
* **Vị trí code cần lưu ý**:
  * Backend: `src/common/guards/workspace-role.guard.ts`, `src/modules/workspaces/controllers/workspaces.controller.ts`.
  * Frontend: `src/modules/workspace/shared/hooks/useWorkspaces.ts`, các nút action như Delete Workspace, Change Role chỉ hiển thị khi có quyền tương ứng.

#### 2. Trụ cột 2: Jira Kanban Board (UX Realtime & Optimistic UI)
* **Mục tiêu**: Kéo thả task mượt mà (0ms delay), phản hồi lỗi có Rollback, đồng bộ Realtime giữa các client.
* **Vị trí code cần lưu ý**:
  * Frontend Board Component: `src/modules/workspace/shared/components/KanbanBoard.tsx` (hoặc tương đương trong workspace module).
  * Optimistic Update: Dùng `queryClient.setQueryData` trong `onMutate` của React Query khi kéo thả cột task. Nếu mutate lỗi, khôi phục `previousTasks` trong `onError`.
  * Realtime: Đảm bảo lắng nghe socket event `task.updated` / `task.moved` từ `socket.workspace.ts` để đồng bộ board của các thành viên khác đang mở cùng workspace.

#### 3. Trụ cột 3: Confluence Wiki / Document Tree
* **Mục tiêu**: Quản lý cây tài liệu phân cấp nhiều tầng (`parentId`), TipTap auto-save debounce.
* **Vị trí code cần lưu ý**:
  * Backend: `src/modules/pages/` (`pages.service.ts`, `pages.controller.ts`).
  * Frontend: `app/(client)/documents/`, `app/(client)/workspaces/[key]/pages/[slug]/`.
  * Auto-save UX: Khi gõ văn bản trong TipTap, sử dụng hook `useDebouncedCallback` (1.5s) gọi API PATCH nội dung trang, kèm badge trạng thái: *"Đang lưu..."* ➔ *"Đã lưu lúc HH:mm"*.

#### 4. Trụ cột 4: Liên kết Task ↔ Document (Tính năng ăn điểm phỏng vấn)
* **Mục tiêu**: Kết nối chặt chẽ giữa Jira và Confluence.
* **Thiết kế triển khai**:
  * **Backend Schema**:
    * Trong `TaskSchema` (`src/modules/tasks/schemas/task.schema.ts`): Thêm trường `linkedPageIds: [{ type: Types.ObjectId, ref: 'Page' }]`.
    * Trong `PageSchema` (`src/modules/pages/schemas/page.schema.ts`): Thêm trường `linkedTaskIds: [{ type: Types.ObjectId, ref: 'Task' }]` (hoặc truy vấn ngược).
  * **API**: Endpoint gán link `POST /tasks/:id/links/page` và `DELETE /tasks/:id/links/page/:pageId`.
  * **Frontend UI**:
    * Trong Task Modal: Thêm section *"Tài liệu liên quan (PRD/Spec)"*, có popover tìm kiếm nhanh trang Confluence và bấm link nhảy sang xem tài liệu.
    * Trong Confluence Page: Thêm sidebar hiển thị *"Các công việc đang tham chiếu tài liệu này"*.

#### 5. Trụ cột 5: Basic Dashboard (MongoDB Aggregation)
* **Mục tiêu**: Màn hình tổng quan hữu ích, tải cực nhanh (<50ms).
* **Thiết kế triển khai**:
  * Backend: Viết 1 Aggregation Pipeline duy nhất với `$facet` trong `src/modules/dashboard/` (hoặc `workspaces.service.ts`):
    ```typescript
    const stats = await this.taskModel.aggregate([
      { $match: { workspaceId: new Types.ObjectId(workspaceId), isDeleted: false } },
      {
        $facet: {
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          myTasks: [
            { $match: { assigneeId: new Types.ObjectId(userId) } },
            { $limit: 10 },
            { $project: { title: 1, status: 1, priority: 1, dueDate: 1 } }
          ],
        }
      }
    ]);
    ```
  * Frontend: Hiển thị 4 thẻ thống kê: Total Tasks, Completed, In Progress, To Do; kèm biểu đồ completion rate và danh sách công việc của tôi.

---

### 🔷 Phase 4: Tối Ưu Database & Bundle Size
* Tạo compound indexes trong MongoDB:
  * `db.tasks.createIndex({ workspaceId: 1, status: 1, isDeleted: 1 })`
  * `db.tasks.createIndex({ workspaceId: 1, assigneeId: 1 })`
  * `db.pages.createIndex({ workspaceId: 1, parentId: 1, isArchived: 1 })`
* Loại bỏ các câu query `.populate()` thừa thãi.
* Kiểm tra `next/dynamic` cho TipTap editor để giảm initial JS load của frontend.

---

### 🔷 Phase 5: Bộ Dữ Liệu Mẫu (Seed Script) & 1-Click Demo Login
* Viết script `pnpm run seed:portfolio`:
  * Tạo sẵn tài khoản: `demo@altask.dev` (Mật khẩu: `Demo@123456`).
  * Tạo 1 Workspace hoàn chỉnh với 20+ tasks và 5+ trang tài liệu phong phú.
* Thêm nút bấm *"Dùng thử ngay với tài khoản Demo"* ở màn hình Login để nhà tuyển dụng có thể trải nghiệm ngay mà không cần tốn thời gian đăng ký và xác thực email.

---

### 🔷 Phase 6: Triển Khai Cloud & Hồ Sơ Portfolio
* **Frontend**: Deploy lên Vercel.
* **Backend**: Deploy lên Render / Railway (Node.js single instance).
* **Database**: MongoDB Atlas M0.
* **README.md**: Trình bày kiến trúc hệ thống, link demo, giải thích lý do lựa chọn kiến trúc Lean (Trade-off: Single-instance Socket.IO vs Redis Cluster).
