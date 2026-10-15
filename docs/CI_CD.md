# 🚀 Tài liệu CI/CD Pipeline (TaskFlow)

Tài liệu này mô tả chi tiết pipeline CI/CD cho toàn bộ hệ thống Monorepo TaskFlow (`backend`, `frontend`, `admin`), được thiết kế chuẩn mực phục vụ mục đích học tập và làm Portfolio chuyên nghiệp.

---

## 📌 1. Tổng quan Kiến Trúc CI/CD

Repository là một **Monorepo** gồm 3 module độc lập:
- **`backend`**: NestJS 11 + MongoDB (REST API + Realtime Socket.IO).
- **`frontend`**: Next.js 15 App Router + React 19 (Client Web App).
- **`admin`**: Vite 8 + React 19 + Nginx (Super Admin Portal).

Toàn bộ quy trình tự động hóa được quản lý tập trung tại `.github/workflows/`:
1. [`.github/workflows/ci.yml`](file:///c:/Hoclaptrinh/ThucTap2/AL-TASK/.github/workflows/ci.yml): Tự động phát hiện thay đổi (`dorny/paths-filter`), chạy **Lint**, **Test / Typecheck**, **Build**, và **Kiểm tra Docker Build** cho từng module.
2. [`.github/workflows/cd.yml`](file:///c:/Hoclaptrinh/ThucTap2/AL-TASK/.github/workflows/cd.yml): Tự động build và phát hành (publish) các Docker image production lên **GitHub Container Registry (GHCR)** dưới namespace của chính tài khoản GitHub của bạn (`ghcr.io/<your-username>/...`).
3. [`docker-compose.yml`](file:///c:/Hoclaptrinh/ThucTap2/AL-TASK/docker-compose.yml): File điều phối container ở root giúp người review / tuyển dụng có thể chạy toàn bộ dự án (MongoDB, Backend, Frontend, Admin) chỉ với 1 câu lệnh.

---

## 🛠️ 2. Chi tiết Continuous Integration (CI)

Workflow: **`CI — Lint, Test & Build Check`** ([`ci.yml`](file:///c:/Hoclaptrinh/ThucTap2/AL-TASK/.github/workflows/ci.yml))

### Triggers:
- Push vào các nhánh: `main`, `master`, `dev`
- Pull Request vào các nhánh: `main`, `master`, `dev`, `production`
- Trigger thủ công: `workflow_dispatch` (Actions tab)

### Các Job thực thi:
| Module | Lint | Test / Type Check | Production Build | Docker Build Check |
|---|---|---|---|---|
| **Backend** | `pnpm run lint` (ESLint 9) | `pnpm run test` (54 suites, 466 tests) | `nest build` (SWC) | `docker/build-push-action` (push: false) |
| **Frontend** | `pnpm run lint` (Next Lint) | `pnpm exec tsc --noEmit` | `next build` (Standalone) | `docker/build-push-action` (push: false) |
| **Admin** | `pnpm run lint` (ESLint 9) | `pnpm run test` + `tsc -b` | `vite build` | `docker/build-push-action` (push: false) |

> **Cơ chế tối ưu hóa Monorepo**: Chỉ khi module nào có file thay đổi thì job của module đó mới được kích hoạt, giúp tiết kiệm thời gian chạy CI trên GitHub Actions Runner.

---

## 📦 3. Chi tiết Continuous Delivery (CD)

Workflow: **`CD — Build & Publish Docker Images`** ([`cd.yml`](file:///c:/Hoclaptrinh/ThucTap2/AL-TASK/.github/workflows/cd.yml))

### Triggers:
- Push vào nhánh `main` hoặc `production`
- Trigger thủ công qua `workflow_dispatch` với tùy chọn chọn service:
  - `all` (cả 3 service)
  - `backend`
  - `frontend`
  - `admin`

### Quy trình Publish Image:
1. Đăng nhập vào GHCR với quyền tự động cấp bởi GitHub Actions (`${{ secrets.GITHUB_TOKEN }}`).
2. Thiết lập Docker Buildx và cache GitHub Actions (`type=gha`).
3. Build Docker image multi-stage và gán nhãn: `latest` và `sha-<commit_hash>`.
4. Push Docker image lên GitHub Container Registry dưới tên tài khoản GitHub của bạn:
   - `ghcr.io/<your-username>/taskflow-backend:latest`
   - `ghcr.io/<your-username>/taskflow-frontend:latest`
   - `ghcr.io/<your-username>/taskflow-admin:latest`

> **Không yêu cầu bất kỳ VPS hay cấu hình Secret phức tạp**: Toàn bộ quy trình sử dụng token có sẵn của GitHub Actions runner, không tốn chi phí máy chủ bên ngoài mà vẫn chứng minh đầy đủ kỹ năng Docker & DevOps trong Portfolio.

---

## 💻 4. Chạy Thử Nghiệm Local với Docker Compose

Bất kỳ ai clone repository về đều có thể chạy toàn bộ hệ thống bằng Docker:

```bash
# Build và khởi chạy tất cả services (MongoDB, Backend, Frontend, Admin)
docker compose up --build -d

# Xem log các service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f admin

# Dừng hệ thống
docker compose down
```
