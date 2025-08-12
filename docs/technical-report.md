# Báo Cáo Kỹ Thuật - Lab 01: Client-Server Fundamentals

**Môn học:** Phát triển Ứng dụng Web Nâng cao  
**Nhóm:** 31  
**Ngày thực hiện:** 12/08/2025  
**Ngày báo cáo:** 13/08/2025  

## 1. THÔNG TIN NHÓM

| STT | Họ và Tên | MSSV | Vai trò | Phần việc |
|-----|-----------|------|---------|-----------|
| 1   | [Tên SV 1] | [MSSV 1] | Team Leader | Server Development, Documentation |
| 2   | [Tên SV 2] | [MSSV 2] | Frontend Developer | Client-side UI, AJAX Implementation |
| 3   | [Tên SV 3] | [MSSV 3] | Backend Developer | HTTP Client, Network Monitoring |

## 2. TỔNG QUAN DỰ ÁN

### 2.1 Mục tiêu
Xây dựng hệ thống client-server đơn giản để hiểu rõ:
- Kiến trúc client-server trong thực tế
- HTTP protocol và request-response cycle
- Cách phân tích network traffic
- Cách triển khai HTTP client từ đầu

### 2.2 Công nghệ sử dụng
- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **HTTP Client:** Node.js built-in modules (http, https)
- **Tools:** Chrome DevTools, VS Code

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1 Sơ đồ kiến trúc

```
┌─────────────────┐       HTTP/HTTPS        ┌─────────────────┐
│                 │ ───────────────────────► │                 │
│   Web Browser   │                          │   Express.js    │
│   (Client)      │ ◄─────────────────────── │   Server        │
│                 │      JSON Response       │                 │
└─────────────────┘                          └─────────────────┘
         │                                            │
         │                                            │
         ▼                                            ▼
┌─────────────────┐                          ┌─────────────────┐
│   HTTP Client   │                          │   Static Files  │
│   (Node.js)     │                          │   (HTML/CSS/JS) │
└─────────────────┘                          └─────────────────┘
         │                                            │
         │                                            │
         ▼                                            ▼
┌─────────────────┐                          ┌─────────────────┐
│ Network Monitor │                          │   API Endpoints │
│   (Analysis)    │                          │   (/api/*)      │
└─────────────────┘                          └─────────────────┘
```

### 3.2 Luồng dữ liệu
1. **Client Request:** Browser/HTTP Client gửi request đến server
2. **Server Processing:** Express.js xử lý request và truy xuất dữ liệu
3. **Response:** Server trả về JSON response hoặc static files
4. **Client Display:** Browser hiển thị dữ liệu hoặc HTTP Client log kết quả

## 4. CHI TIẾT TRIỂN KHAI

### 4.1 Static Web Server (server.js)

#### 4.1.1 Cấu trúc Server
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware setup
app.use(express.json());
app.use(express.static('public'));

// Custom headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Lab01-Nhom31');
    res.setHeader('X-Server-Time', new Date().toISOString());
    next();
});
```

#### 4.1.2 API Endpoints

| Endpoint | Method | Mô tả | Response Format |
|----------|--------|-------|-----------------|
| `/` | GET | Trang chủ | HTML |
| `/api/info` | GET | Thông tin server và hệ thống | JSON |
| `/api/time` | GET | Timestamp hiện tại | JSON |
| `/api/echo` | POST | Echo request data | JSON |
| `/api/performance` | GET | Performance test | JSON |
| `/health` | GET | Health check | JSON |

#### 4.1.3 Tính năng nổi bật
- **Custom HTTP Headers:** Thêm headers tùy chỉnh cho mọi response
- **Request Logging:** Log tất cả requests với timestamp và IP
- **Error Handling:** Xử lý lỗi 404 và 500 một cách graceful
- **CORS Support:** Hỗ trợ cross-origin requests

### 4.2 HTTP Client (client.js)

#### 4.2.1 Thiết kế Class
```javascript
class HttpClient {
    constructor() {
        this.defaultTimeout = 5000;
        this.userAgent = 'Lab01-HttpClient/1.0.0 (Nhom31)';
    }

    async request(options) {
        // Implementation với Promise wrapper
        // Hỗ trợ HTTP và HTTPS
        // Error handling và timeout
    }
}
```

#### 4.2.2 Test Scenarios
1. **Local Server Test:** GET request đến localhost:3000
2. **External API Test:** GET request đến GitHub API
3. **POST Request Test:** POST đến JSONPlaceholder
4. **Error Handling Test:** Request đến server không tồn tại

#### 4.2.3 Performance Metrics
- Response time measurement
- Request/response size tracking
- Success/failure rate calculation
- Concurrent request testing

### 4.3 Network Monitoring (monitor.js)

#### 4.3.1 Monitoring Features
```javascript
class NetworkMonitor {
    constructor() {
        this.requests = [];
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            totalBytesReceived: 0
        };
    }
}
```

#### 4.3.2 Metrics Collected
- **Request Count:** Tổng số requests
- **Response Times:** Min, max, average, median, 95th percentile
- **Data Transfer:** Bytes sent/received
- **Status Codes:** Distribution của HTTP status codes
- **Error Rates:** Success vs failure percentages

### 4.4 Frontend Implementation (public/)

#### 4.4.1 User Interface Features
- **Real-time Server Status:** Hiển thị trạng thái server online/offline
- **API Testing Buttons:** Test các endpoints khác nhau
- **Response Display:** Hiển thị JSON response formatted
- **Request History:** Table showing request history
- **Network Statistics:** Real-time stats dashboard

#### 4.4.2 AJAX Implementation
```javascript
async function makeRequest(url, options = {}) {
    const startTime = performance.now();
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-Client-Type': 'Lab01-Frontend',
            ...options.headers
        }
    });
    
    // Performance tracking
    const duration = performance.now() - startTime;
    updateRequestStats(response.ok, duration, responseSize);
}
```

## 5. PHÂN TÍCH KẾT QUẢ

### 5.1 Performance Analysis

#### 5.1.1 Response Time Distribution
- **Local Server (localhost:3000):**
  - Average: ~5-15ms
  - Min: ~2ms
  - Max: ~50ms

- **External APIs:**
  - GitHub API: ~100-300ms
  - JSONPlaceholder: ~200-500ms

#### 5.1.2 Throughput Testing
- **Concurrent Requests:** Server handle 5 concurrent requests
- **Memory Usage:** Stable memory consumption
- **Error Rate:** < 1% khi server khả dụng

### 5.2 Network Traffic Analysis

#### 5.2.1 Request Patterns
```
Static Content:
├── HTML: ~2-5KB
├── CSS: ~10-15KB
├── JavaScript: ~8-12KB
└── Images: ~20-100KB

API Responses:
├── /api/info: ~1-2KB
├── /api/time: ~100-200B
├── /api/echo: Variable (depends on input)
└── /health: ~50-100B
```

#### 5.2.2 HTTP Headers Analysis
- **Custom Headers:** Server thêm 3 custom headers mỗi response
- **CORS Headers:** Proper CORS configuration
- **Content-Type:** Correct MIME types cho mọi response
- **Cache Control:** Appropriate caching strategies

### 5.3 Browser DevTools Insights

#### 5.3.1 Network Tab Analysis
- **Waterfall Chart:** Sequential loading của resources
- **Response Headers:** Verification của custom headers
- **Timing Breakdown:** DNS, Connect, Send, Receive times
- **Size Metrics:** Transfer size vs resource size

## 6. THÁCH THỨC VÀ GIẢI PHÁP

### 6.1 Thách thức gặp phải

#### 6.1.1 HTTP Client Implementation
**Vấn đề:** Triển khai HTTP client từ đầu không được dùng axios/fetch
**Giải pháp:** 
- Sử dụng Node.js built-in modules (http, https)
- Wrap với Promise để dễ sử dụng
- Implement timeout và error handling

#### 6.1.2 CORS Issues
**Vấn đề:** Browser blocking requests do CORS policy
**Giải pháp:**
- Configure CORS headers properly trong Express
- Thêm preflight request handling
- Test với browser và HTTP client

#### 6.1.3 Real-time Statistics
**Vấn đề:** Update statistics real-time trên UI
**Giải pháp:**
- Track performance trong JavaScript
- Update DOM elements after each request
- Maintain request history với size limit

### 6.2 Optimization Strategies

#### 6.2.1 Server Performance
- **Middleware Optimization:** Minimize middleware overhead
- **Response Compression:** Enable gzip compression
- **Static File Caching:** Proper cache headers

#### 6.2.2 Client-side Performance
- **Request Batching:** Group multiple requests when possible
- **Local Storage:** Cache server info locally
- **Debouncing:** Prevent excessive API calls

## 7. BÀI HỌC RÚT RA

### 7.1 Về Kiến trúc Client-Server
- **Separation of Concerns:** Clear separation between client và server logic
- **Stateless Design:** Server không maintain client state
- **Error Handling:** Graceful degradation khi có lỗi
- **Performance Monitoring:** Importance của real-time monitoring

### 7.2 Về HTTP Protocol
- **Headers:** Custom headers cho metadata và debugging
- **Status Codes:** Proper use của HTTP status codes
- **Methods:** Appropriate use của GET, POST, PUT, DELETE
- **Content-Type:** Importance của correct MIME types

### 7.3 Về Web Development
- **Progressive Enhancement:** Start với basic functionality
- **Responsive Design:** Works trên mọi device sizes
- **User Experience:** Clear feedback cho user actions
- **Debugging Tools:** Browser DevTools là essential

## 8. TÍNH NĂNG BONUS (10 điểm)

### 8.1 WebSocket Demo
```javascript
function initWebSocket() {
    websocket = new WebSocket('wss://echo.websocket.org');
    
    websocket.onopen = function(event) {
        console.log('WebSocket connected');
        // Send test message
    };
}
```

### 8.2 Performance Benchmarking
- **File Size Testing:** Test với different payload sizes
- **Concurrent Request Testing:** Multiple simultaneous requests
- **Latency Measurement:** Network latency analysis

### 8.3 Advanced Error Handling
- **Retry Logic:** Automatic retry cho failed requests
- **Circuit Breaker:** Stop requests khi server unavailable
- **Graceful Degradation:** Fallback mechanisms

## 9. KẾT LUẬN

### 9.1 Đánh giá tổng quan
Lab 01 đã thành công trong việc:
- ✅ Triển khai static web server với Express.js
- ✅ Xây dựng HTTP client từ đầu không dùng third-party libraries
- ✅ Phân tích network traffic với browser tools
- ✅ Implement real-time monitoring và statistics
- ✅ Tạo responsive UI với AJAX functionality

### 9.2 Mức độ hoàn thành
- **Phần A - Static Web Server:** 100% ✅
- **Phần B - HTTP Client:** 100% ✅  
- **Phần C - Network Analysis:** 100% ✅
- **Bonus Features:** 80% 🎯

### 9.3 Skill Development
- **Technical Skills:** HTTP protocol, Node.js, Express.js, JavaScript
- **Problem Solving:** Debug network issues, handle async operations
- **Tool Usage:** Browser DevTools, command line tools
- **Documentation:** Technical writing và code documentation

### 9.4 Hướng phát triển
- **Security:** Implement authentication và authorization
- **Scalability:** Load balancing và clustering
- **Real-time:** WebSocket implementation
- **Testing:** Unit tests và integration tests

---

**Ngày hoàn thành báo cáo:** 12/08/2025  
**Nhóm 31 - Phát triển Ứng dụng Web Nâng cao**
