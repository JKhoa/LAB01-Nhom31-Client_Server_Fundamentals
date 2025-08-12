# Lab 01 - Client-Server Fundamentals
## Nhóm 31

### Thành viên nhóm
- [Tên thành viên 1] - [MSSV]
- [Tên thành viên 2] - [MSSV]
- [Tên thành viên 3] - [MSSV] (nếu có)

### Mô tả bài lab
Bài thực hành về kiến thức cơ bản Client-Server architecture, bao gồm:
- Static Web Server với Express.js
- HTTP Client tự triển khai
- Network Traffic Analysis

### Cấu trúc dự án
```
BTNhom-1/
├── README.md
├── package.json
├── server.js          # HTTP Server chính
├── client.js          # HTTP Client tự triển khai
├── monitor.js         # Network monitoring utility
├── public/
│   ├── index.html     # Trang chủ
│   ├── style.css      # CSS styling
│   └── script.js      # Client-side JavaScript
├── screenshots/
│   └── README.md      # Screenshots cho báo cáo
└── docs/
    └── technical-report.md  # Báo cáo kỹ thuật
```

### Cài đặt và chạy dự án

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Chạy server:**
```bash
npm start
# hoặc
node server.js
```

3. **Test HTTP Client:**
```bash
node client.js
```

4. **Chạy Network Monitor:**
```bash
node monitor.js
```

### Tính năng chính

#### Static Web Server (server.js)
- Chạy trên port 3000
- Phục vụ static files từ thư mục public/
- API endpoint `/api/info` trả về thông tin server
- Custom HTTP headers
- Xử lý lỗi 404, 500

#### HTTP Client (client.js)
- Hỗ trợ GET và POST methods
- Xử lý HTTP và HTTPS requests
- Built-in error handling
- Test cases cho các scenarios khác nhau

#### Network Monitoring (monitor.js)
- Theo dõi hiệu suất mạng
- Phân tích request patterns
- Performance benchmarking

### API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Trang chủ |
| GET | `/api/info` | Thông tin server và hệ thống |
| GET | `/api/time` | Timestamp hiện tại |
| POST | `/api/echo` | Echo lại data được gửi |

### Công nghệ sử dụng
- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **HTTP Client:** Node.js built-in modules (http, https)
- **Monitoring:** Performance API, Network Analysis

### Demo và Testing
1. Truy cập http://localhost:3000 để xem giao diện web
2. Click các nút để test AJAX calls
3. Chạy client.js để test HTTP client
4. Sử dụng Browser DevTools để phân tích network traffic

### Báo cáo
Chi tiết về kiến trúc, implementation và analysis có trong file `docs/technical-report.md`

### Ngày thực hiện
- **Thực hành:** Thứ Ba, 12/08/2025
- **Báo cáo:** Thứ Tư, 13/08/2025

---
**Môn học:** Phát triển Ứng dụng Web Nâng cao  
**Giảng viên:** [Tên giảng viên]  
**Học kỳ:** [Học kỳ]
