## Giới thiệu dự án

Music Streaming Platform là một ứng dụng nghe nhạc full-stack cho phép người dùng khám phá, phát trực tuyến và quản lý nhạc trên nền tảng web.

Hệ thống hỗ trợ 3 vai trò người dùng:

* **User**: Nghe nhạc, thích bài hát và tạo playlist cá nhân
* **Artist**: Upload và quản lý bài hát / album của mình
* **Admin**: Quản lý nội dung và người dùng trên toàn hệ thống

## Tính năng chính

### Người dùng (User)

* Đăng ký / đăng nhập tài khoản
* Phát nhạc trực tuyến
* Tìm kiếm bài hát, album, nghệ sĩ
* Thêm bài hát vào playlist cá nhân
* Yêu thích bài hát

### Nghệ sĩ (Artist)

* Upload bài hát mới
* Upload ảnh bìa
* Quản lý bài hát và album

### Quản trị viên (Admin)

* Quản lý bài hát, album và nghệ sĩ
* Nâng cấp tài khoản User thành Artist
* Quản lý tài khoản người dùng
* Theo dõi dữ liệu hệ thống

## Công nghệ sử dụng

* Frontend: React, JavaScript, Tailwind CSS
* Backend: Node.js, Express
* Database: MongoDB
* Authentication: Session-based Authentication, Cookie
* Cloud Storage: Cloudinary
* State Management: Zustand

## Demo Admin

Hệ thống sử dụng đăng nhập chung cho tất cả tài khoản. 
Sau khi xác thực thành công, quyền truy cập vào các tính năng và route sẽ được phân theo role (User / Artist / Admin).

* Tài khoản demo: admin@gmail.com
* Mk: 123
