# Music Personal — Nền tảng nghe nhạc Full-stack

Web nghe nhạc full-stack: khám phá, streaming, playlist, yêu thích, follow nghệ sĩ.
Phân quyền 3 vai trò: **User / Artist / Admin**.

## Tính năng

### User
- Đăng ký / đăng nhập / đăng xuất (session + cookie)
- Nghe nhạc trực tuyến, xem lịch sử nghe
- Tìm kiếm bài hát, album, nghệ sĩ
- Playlist cá nhân (tạo / sửa / xóa / thêm bài)
- Yêu thích bài hát, bình luận
- Follow nghệ sĩ, quản lý hồ sơ (avatar, thông tin)
- Gửi báo cáo nội dung vi phạm

### Artist
- Upload bài hát + ảnh bìa (Cloudinary)
- Quản lý, chỉnh sửa, xóa bài đã đăng
- Xem dashboard nội dung của mình

### Admin
- Quản lý bài hát, album, nghệ sĩ, người dùng
- Duyệt / nâng cấp User lên Artist
- Theo dõi dữ liệu hệ thống, xử lý báo cáo

## Công nghệ

| Layer | Stack |
|---|---|
| Frontend | React 19, React Router 7, Vite, TailwindCSS 4, Zustand, Axios |
| Backend | Node.js, Express 4, EJS (legacy views), express-session + connect-mongo |
| Database | MongoDB + Mongoose |
| Storage | Cloudinary (audio + ảnh, qua multer-storage-cloudinary) |
| Auth | Session-based, cookie HttpOnly, bcryptjs |
| Mail | Nodemailer (OTP xác thực, reset mật khẩu) |
| Bảo mật | Helmet, express-rate-limit, express-mongo-sanitize |
| Test | Vitest + Supertest + mongodb-memory-server |

## Cấu trúc dự án

```text
.
├── src/                  # Backend Express
│   ├── app.js            # Entry point, middleware, session, CORS, error handler
│   ├── config/           # db.js, cloudinary.js
│   ├── routes/           # auth, songs, playlists, search, artist, admin, user, report
│   ├── controllers/
│   ├── services/         # auth, song, playlist, mailer, otp, notify...
│   ├── models/           # User, Song, Playlist, Comment, Follow, ...
│   └── middlewares/      # auth, validate
├── frontend/             # React + Vite SPA
│   └── src/              # components, views, stores (zustand), services, routes
├── scripts/
│   └── seed.js           # Seed dữ liệu mẫu (chỉ dùng local/dev)
└── tests/                # Vitest
```

## Yêu cầu

- Node.js >= 18
- MongoDB (local hoặc Atlas)
- Tài khoản Cloudinary (để upload audio/ảnh)
- SMTP (tùy chọn, để gửi OTP/email; nếu thiếu API trả `emailed: false`)

## Cài đặt nhanh

### 1. Backend

```bash
npm install
cp .env.example .env   # file mẫu không commit, tự tạo local theo bảng bên dưới
npm run dev            # chạy ở http://localhost:3000
```

> `.env.example` và `.agent/` đã được gỡ khỏi git và đưa vào `.gitignore`.
> File vẫn nằm local, không còn bị push lên GitHub.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # chạy ở http://localhost:5173
```

Backend đã bật CORS cho `http://localhost:5173`, `http://localhost:5174` và URL Vercel trong `src/app.js`.

## Biến môi trường (Backend)

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `PORT` | Không (mặc định 3000) | Cổng backend |
| `NODE_ENV` | Không | `development` / `production` |
| `MONGO_URI` | Có | Connection string MongoDB |
| `SESSION_SECRET` | Có (prod) | Chuỗi ngẫu nhiên dài cho session |
| `CLIENT_URL` / `FRONTEND_URL` | Có (prod) | URL frontend để cấu hình CORS + cookie |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Có (nếu upload) | Thông tin Cloudinary |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Tùy chọn | Gửi OTP / reset mật khẩu |
| `SEED_SOURCE_URI`, `SEED_ADMIN_PASSWORD`, `SEED_USER_PASSWORD` | Chỉ cho `scripts/seed.js` | Không bao giờ commit giá trị thật |

Cookie prod: `secure: true`, `sameSite: none`. Dev: `sameSite: lax`.

## Script

```bash
# backend (thư mục gốc)
npm start        # chạy production
npm run dev      # chạy dev (nodemon)
npm test         # vitest run
npm run test:watch

# frontend (thư mục frontend/)
npm run dev
npm run build
npm run preview
npm run lint
```

Seed dữ liệu mẫu:

```bash
node scripts/seed.js
```

Chỉ dùng ở local/dev. Không bật seed ở production với dữ liệu thật.

## API chính

| Method + Path | Mô tả |
|---|---|
| `GET /health` | Health check (DB up/down, uptime) |
| `POST /register`, `POST /login`, `POST /logout` | Auth |
| `GET /songs`, `GET /music` | Danh sách / stream nhạc |
| `GET /search` | Tìm kiếm (có rate-limit) |
| `GET/POST/PATCH/DELETE /playlists` | Playlist cá nhân |
| `GET/POST /artist` | Dashboard nghệ sĩ |
| `GET/POST/PATCH /admin` | Quản trị hệ thống |
| `POST /reports` | Gửi báo cáo |

Chi tiết xem từng file trong `src/routes/`.

## Deploy

- Backend: Render / Railway / VPS — set đầy đủ `MONGO_URI`, `SESSION_SECRET`, `FRONTEND_URL`, Cloudinary, SMTP.
- Frontend: Vercel — trỏ `VITE_API_URL` (hoặc tương đương) về URL backend, bật `credentials: include` khi gọi API session.
