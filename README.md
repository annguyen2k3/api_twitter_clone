# Twitter Clone API

API Server mô phỏng các chức năng cốt lõi của Twitter, cung cấp RESTful API hỗ trợ quản lý người dùng, tweet, media, tìm kiếm, tin nhắn thời gian thực và nhiều tính năng khác.

## Tài liệu API

Xem đầy đủ tài liệu tại: [https://api-twitter-clone.io.vn/api-docs/](https://api-twitter-clone.io.vn/api-docs/)

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Runtime | Node.js, TypeScript |
| Web Framework | Express.js |
| Database | MongoDB |
| Cache & Queue | Redis + BullMQ |
| Real-time | Socket.io |
| File Storage | AWS S3 |
| Image Processing | Sharp |
| Authentication | JWT + bcrypt |
| API Documentation | Swagger (OpenAPI 3.0) |
| Logging | Winston |
| Rate Limiting | express-rate-limit + rate-limit-redis |

## Tính năng nổi bật

### Người dùng
- Đăng ký, đăng nhập, xác thực email
- Quản lý hồ sơ, theo dõi người dùng khác
- Tìm kiếm người dùng

### Tweets
- Tạo, chỉnh sửa, xóa tweet
- Upload media (hình ảnh, video)
- Xử lý video bất đồng bộ qua queue
- Hashtag, thả tim, bookmark

### Tìm kiếm
- Tìm kiếm tweet và người dùng
- Cache kết quả tìm kiếm với Redis

### Tin nhắn thời gian thực
- Chat trực tiếp qua Socket.io
- Hỗ trợ cuộc trò chuyện 1-1
- Cache cuộc trò chuyện với Redis

### Hệ thống
- Rate limiting theo IP
- Xử lý lỗi tập trung
- Middleware xác thực request
- Health check endpoint (`/health/queues`)

## API Endpoints

| Nhóm | Đường dẫn |
|---|---|
| Người dùng | `/users` |
| Tweets | `/tweets` |
| Media | `/medias` |
| Likes | `/likes` |
| Bookmarks | `/bookmarks` |
| Tìm kiếm | `/search` |
| Tin nhắn | `/conversations` |
| Static | `/static` |

## Cài đặt

```bash
npm install
```

## Chạy Development

```bash
npm run dev
```

## Build & Chạy Production

```bash
npm run build
npm start
```
