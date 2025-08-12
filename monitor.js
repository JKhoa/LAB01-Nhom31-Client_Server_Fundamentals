const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

/**
 * Network Monitor - Tiện ích giám sát hiệu suất mạng
 * Lab 01 - Client-Server Fundamentals
 * Nhóm 31
 */
class NetworkMonitor {
    constructor() {
        this.requests = [];
        this.startTime = Date.now();
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalBytesReceived: 0,
            totalBytesSent: 0
        };
    }

    /**
     * Monitor một HTTP request
     */
    monitorRequest(url, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            const parsedUrl = new URL(url);
            const isHttps = parsedUrl.protocol === 'https:';
            const httpModule = isHttps ? https : http;

            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: method,
                headers: {
                    'User-Agent': 'NetworkMonitor/1.0.0 (Lab01-Nhom31)',
                    'Accept': '*/*'
                }
            };

            if (data) {
                const postData = JSON.stringify(data);
                options.headers['Content-Type'] = 'application/json';
                options.headers['Content-Length'] = Buffer.byteLength(postData);
                this.stats.totalBytesSent += Buffer.byteLength(postData);
            }

            console.log(`📡 Monitoring ${method} request to: ${url}`);

            const req = httpModule.request(options, (res) => {
                const endTime = performance.now();
                const duration = endTime - startTime;

                let responseData = '';
                let bytesReceived = 0;

                res.on('data', (chunk) => {
                    responseData += chunk;
                    bytesReceived += chunk.length;
                });

                res.on('end', () => {
                    const requestInfo = {
                        url: url,
                        method: method,
                        statusCode: res.statusCode,
                        duration: duration,
                        bytesReceived: bytesReceived,
                        bytesSent: data ? Buffer.byteLength(JSON.stringify(data)) : 0,
                        timestamp: new Date().toISOString(),
                        headers: res.headers,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    };

                    this.addRequest(requestInfo);
                    this.updateStats();

                    console.log(`📊 Request completed: ${res.statusCode} in ${duration.toFixed(2)}ms`);

                    resolve({
                        ...requestInfo,
                        data: responseData
                    });
                });
            });

            req.on('error', (error) => {
                const endTime = performance.now();
                const duration = endTime - startTime;

                const requestInfo = {
                    url: url,
                    method: method,
                    error: error.message,
                    duration: duration,
                    timestamp: new Date().toISOString(),
                    success: false
                };

                this.addRequest(requestInfo);
                this.updateStats();

                console.log(`❌ Request failed: ${error.message}`);
                reject(error);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    /**
     * Thêm request vào danh sách monitor
     */
    addRequest(requestInfo) {
        this.requests.push(requestInfo);
        this.stats.totalRequests++;

        if (requestInfo.success) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
        }

        if (requestInfo.bytesReceived) {
            this.stats.totalBytesReceived += requestInfo.bytesReceived;
        }
    }

    /**
     * Cập nhật thống kê
     */
    updateStats() {
        const successfulRequests = this.requests.filter(r => r.success && r.duration);
        if (successfulRequests.length > 0) {
            const totalDuration = successfulRequests.reduce((sum, r) => sum + r.duration, 0);
            this.stats.averageResponseTime = totalDuration / successfulRequests.length;
        }
    }

    /**
     * Lấy thống kê chi tiết
     */
    getStats() {
        const now = Date.now();
        const uptime = now - this.startTime;

        return {
            ...this.stats,
            uptime: uptime,
            requestsPerSecond: (this.stats.totalRequests / (uptime / 1000)).toFixed(2),
            successRate: ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2),
            averageResponseTime: this.stats.averageResponseTime.toFixed(2),
            totalBytesReceived: this.formatBytes(this.stats.totalBytesReceived),
            totalBytesSent: this.formatBytes(this.stats.totalBytesSent)
        };
    }

    /**
     * Hiển thị báo cáo chi tiết
     */
    generateReport() {
        const stats = this.getStats();

        console.log('\n📊 NETWORK MONITORING REPORT');
        console.log('='.repeat(50));
        console.log(`⏱️  Monitoring Duration: ${(stats.uptime / 1000).toFixed(2)}s`);
        console.log(`📈 Total Requests: ${stats.totalRequests}`);
        console.log(`✅ Successful: ${stats.successfulRequests}`);
        console.log(`❌ Failed: ${stats.failedRequests}`);
        console.log(`🎯 Success Rate: ${stats.successRate}%`);
        console.log(`⚡ Requests/Second: ${stats.requestsPerSecond}`);
        console.log(`⏰ Average Response Time: ${stats.averageResponseTime}ms`);
        console.log(`📥 Data Received: ${stats.totalBytesReceived}`);
        console.log(`📤 Data Sent: ${stats.totalBytesSent}`);

        // Response time distribution
        if (this.requests.length > 0) {
            console.log('\n📊 Response Time Distribution:');
            const responseTimes = this.requests
                .filter(r => r.success && r.duration)
                .map(r => r.duration)
                .sort((a, b) => a - b);

            if (responseTimes.length > 0) {
                console.log(`   Min: ${responseTimes[0].toFixed(2)}ms`);
                console.log(`   Max: ${responseTimes[responseTimes.length - 1].toFixed(2)}ms`);
                console.log(`   Median: ${this.getMedian(responseTimes).toFixed(2)}ms`);
                console.log(`   95th Percentile: ${this.getPercentile(responseTimes, 95).toFixed(2)}ms`);
            }
        }

        // Status code distribution
        const statusCodes = {};
        this.requests.forEach(r => {
            if (r.statusCode) {
                statusCodes[r.statusCode] = (statusCodes[r.statusCode] || 0) + 1;
            }
        });

        if (Object.keys(statusCodes).length > 0) {
            console.log('\n📋 Status Code Distribution:');
            Object.entries(statusCodes).forEach(([code, count]) => {
                console.log(`   ${code}: ${count} requests`);
            });
        }

        console.log('='.repeat(50));

        return {
            stats,
            requests: this.requests.slice(-10), // Last 10 requests
            responseTimes: this.requests
                .filter(r => r.success && r.duration)
                .map(r => ({ url: r.url, duration: r.duration }))
        };
    }

    /**
     * Format bytes thành readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Tính median
     */
    getMedian(arr) {
        const mid = Math.floor(arr.length / 2);
        return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    }

    /**
     * Tính percentile
     */
    getPercentile(arr, percentile) {
        const index = Math.ceil((percentile / 100) * arr.length) - 1;
        return arr[index];
    }

    /**
     * Reset all stats
     */
    reset() {
        this.requests = [];
        this.startTime = Date.now();
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalBytesReceived: 0,
            totalBytesSent: 0
        };
        console.log('🔄 Monitor stats reset');
    }
}

/**
 * Demo và test network monitoring
 */
async function runMonitoringDemo() {
    const monitor = new NetworkMonitor();

    console.log('🚀 Network Monitoring Demo - Nhóm 31');
    console.log('📅 ' + new Date().toLocaleString('vi-VN'));
    console.log('='.repeat(60));

    try {
        // Test với local server
        console.log('\n🔬 Testing Local Server Endpoints...');

        const localEndpoints = [
            'http://localhost:3000/api/info',
            'http://localhost:3000/api/time',
            'http://localhost:3000/health',
            'http://localhost:3000/api/performance'
        ];

        for (const endpoint of localEndpoints) {
            try {
                await monitor.monitorRequest(endpoint);
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
            } catch (error) {
                console.log(`⚠️  Could not reach ${endpoint}: ${error.message}`);
            }
        }

        // Test với external APIs
        console.log('\n🌐 Testing External APIs...');

        const externalEndpoints = [
            'https://api.github.com/zen',
            'https://httpbin.org/get',
            'https://jsonplaceholder.typicode.com/posts/1'
        ];

        for (const endpoint of externalEndpoints) {
            try {
                await monitor.monitorRequest(endpoint);
                await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
            } catch (error) {
                console.log(`⚠️  External API error ${endpoint}: ${error.message}`);
            }
        }

        // Test POST request
        console.log('\n📤 Testing POST Request...');
        try {
            await monitor.monitorRequest(
                'https://jsonplaceholder.typicode.com/posts',
                'POST', {
                    title: 'Network Monitor Test',
                    body: 'Testing POST request from Nhom 31',
                    userId: 1
                }
            );
        } catch (error) {
            console.log(`⚠️  POST request error: ${error.message}`);
        }

        // Performance test với multiple concurrent requests
        console.log('\n⚡ Performance Test - Concurrent Requests...');
        const concurrentPromises = [];
        for (let i = 0; i < 5; i++) {
            concurrentPromises.push(
                monitor.monitorRequest('https://httpbin.org/delay/1')
                .catch(error => console.log(`Concurrent request ${i + 1} failed: ${error.message}`))
            );
        }

        await Promise.allSettled(concurrentPromises);

    } catch (error) {
        console.log('❌ Demo error:', error.message);
    }

    // Generate final report
    const report = monitor.generateReport();

    // Save report to file
    const fs = require('fs');
    const reportData = {
        timestamp: new Date().toISOString(),
        nhom: 31,
        lab: 'Lab01-NetworkMonitoring',
        ...report
    };

    try {
        fs.writeFileSync('network-monitoring-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n💾 Report saved to: network-monitoring-report.json');
    } catch (error) {
        console.log('⚠️  Could not save report:', error.message);
    }

    return report;
}

// Performance benchmarking cho different file sizes
async function performanceComparison() {
    const monitor = new NetworkMonitor();

    console.log('\n🔬 Performance Comparison - Different File Sizes');
    console.log('='.repeat(50));

    // Test với các file sizes khác nhau từ httpbin
    const testSizes = [
        { size: '1kb', url: 'https://httpbin.org/drip?numbytes=1024&duration=1' },
        { size: '10kb', url: 'https://httpbin.org/drip?numbytes=10240&duration=1' },
        { size: '100kb', url: 'https://httpbin.org/drip?numbytes=102400&duration=1' }
    ];

    for (const test of testSizes) {
        console.log(`\n📏 Testing ${test.size} download...`);
        try {
            const startTime = performance.now();
            await monitor.monitorRequest(test.url);
            const endTime = performance.now();
            console.log(`✅ ${test.size} completed in ${(endTime - startTime).toFixed(2)}ms`);
        } catch (error) {
            console.log(`❌ ${test.size} test failed: ${error.message}`);
        }
    }

    return monitor.generateReport();
}

// Export cho sử dụng trong các modules khác
module.exports = NetworkMonitor;

// Chạy demo nếu file được execute trực tiếp
if (require.main === module) {
    runMonitoringDemo()
        .then(() => performanceComparison())
        .then(() => {
            console.log('\n🎉 Network monitoring demo completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Demo error:', error);
            process.exit(1);
        });
}