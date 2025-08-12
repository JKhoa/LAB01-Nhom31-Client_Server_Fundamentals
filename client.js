const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

/**
 * HTTP Client Class - Tự triển khai không sử dụng axios/fetch
 * Lab 01 - Client-Server Fundamentals
 * Nhóm 31
 */
class HttpClient {
    constructor() {
        this.defaultTimeout = 5000;
        this.userAgent = 'Lab01-HttpClient/1.0.0 (Nhom31)';
    }

    /**
     * Thực hiện HTTP request
     * @param {Object} options - Request options
     * @returns {Promise} Promise với response data
     */
    request(options) {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(options.url);
            const isHttps = parsedUrl.protocol === 'https:';
            const httpModule = isHttps ? https : http;

            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.path,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'application/json, text/plain, */*',
                    ...options.headers
                },
                timeout: options.timeout || this.defaultTimeout
            };

            // Nếu có data, thêm Content-Length và Content-Type
            if (options.data) {
                const postData = typeof options.data === 'string' ?
                    options.data :
                    JSON.stringify(options.data);

                requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
                requestOptions.headers['Content-Type'] =
                    requestOptions.headers['Content-Type'] || 'application/json';
            }

            console.log(`\n📡 Making ${requestOptions.method} request to: ${options.url}`);
            console.log(`🔗 Headers:`, requestOptions.headers);

            const startTime = Date.now();
            const req = httpModule.request(requestOptions, (res) => {
                const endTime = Date.now();
                const duration = endTime - startTime;

                console.log(`📊 Response Status: ${res.statusCode} ${res.statusMessage}`);
                console.log(`⏱️  Response Time: ${duration}ms`);
                console.log(`📥 Response Headers:`, res.headers);

                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = {
                            status: res.statusCode,
                            statusText: res.statusMessage,
                            headers: res.headers,
                            data: this.parseResponse(data, res.headers['content-type']),
                            config: requestOptions,
                            duration: duration,
                            url: options.url
                        };

                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            console.log(`✅ Request successful`);
                            resolve(response);
                        } else {
                            console.log(`❌ Request failed with status ${res.statusCode}`);
                            reject(new Error(`Request failed with status ${res.statusCode}: ${res.statusMessage}`));
                        }
                    } catch (error) {
                        console.log(`❌ Error parsing response:`, error.message);
                        reject(error);
                    }
                });
            });

            req.on('timeout', () => {
                console.log(`⏰ Request timeout after ${requestOptions.timeout}ms`);
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.on('error', (error) => {
                console.log(`❌ Request error:`, error.message);
                reject(error);
            });

            // Gửi data nếu có
            if (options.data) {
                const postData = typeof options.data === 'string' ?
                    options.data :
                    JSON.stringify(options.data);
                req.write(postData);
            }

            req.end();
        });
    }

    /**
     * Parse response data dựa trên content-type
     */
    parseResponse(data, contentType) {
        if (!data) return null;

        if (contentType && contentType.includes('application/json')) {
            try {
                return JSON.parse(data);
            } catch (e) {
                return data;
            }
        }

        return data;
    }

    /**
     * GET request
     */
    get(url, options = {}) {
        return this.request({
            url,
            method: 'GET',
            ...options
        });
    }

    /**
     * POST request
     */
    post(url, data, options = {}) {
        return this.request({
            url,
            method: 'POST',
            data,
            ...options
        });
    }

    /**
     * PUT request
     */
    put(url, data, options = {}) {
        return this.request({
            url,
            method: 'PUT',
            data,
            ...options
        });
    }

    /**
     * DELETE request
     */
    delete(url, options = {}) {
        return this.request({
            url,
            method: 'DELETE',
            ...options
        });
    }
}

/**
 * Test scenarios cho HTTP Client
 */
async function runTests() {
    const client = new HttpClient();

    console.log('🧪 Bắt đầu test HTTP Client');
    console.log('='.repeat(60));

    // Test 1: GET request đến local server
    try {
        console.log('\n🔬 Test 1: GET request đến local server');
        const response1 = await client.get('http://localhost:3000/api/info');
        console.log('📋 Server Info:', {
            timestamp: response1.data.timestamp,
            platform: response1.data.server.platform,
            nodeVersion: response1.data.server.nodeVersion
        });
    } catch (error) {
        console.log('❌ Test 1 failed:', error.message);
        console.log('💡 Đảm bảo server đang chạy: npm start');
    }

    // Test 2: GET request đến external API (GitHub)
    try {
        console.log('\n🔬 Test 2: GET request đến GitHub API');
        const response2 = await client.get('https://api.github.com/users/octocat');
        console.log('📋 GitHub User:', {
            login: response2.data.login,
            name: response2.data.name,
            public_repos: response2.data.public_repos,
            followers: response2.data.followers
        });
    } catch (error) {
        console.log('❌ Test 2 failed:', error.message);
    }

    // Test 3: POST request đến JSONPlaceholder
    try {
        console.log('\n🔬 Test 3: POST request đến JSONPlaceholder');
        const postData = {
            title: 'Lab 01 Test Post',
            body: 'Testing HTTP Client from Nhom 31',
            userId: 1
        };

        const response3 = await client.post('https://jsonplaceholder.typicode.com/posts', postData);
        console.log('📋 Created Post:', {
            id: response3.data.id,
            title: response3.data.title,
            userId: response3.data.userId
        });
    } catch (error) {
        console.log('❌ Test 3 failed:', error.message);
    }

    // Test 4: POST request đến local server
    try {
        console.log('\n🔬 Test 4: POST request đến local server');
        const echoData = {
            message: 'Hello from HTTP Client',
            nhom: 31,
            timestamp: new Date().toISOString()
        };

        const response4 = await client.post('http://localhost:3000/api/echo', echoData);
        console.log('📋 Echo Response:', response4.data.received);
    } catch (error) {
        console.log('❌ Test 4 failed:', error.message);
    }

    // Test 5: Error handling - request đến server không tồn tại
    try {
        console.log('\n🔬 Test 5: Error handling - server không khả dụng');
        await client.get('http://localhost:9999/nonexistent');
    } catch (error) {
        console.log('✅ Error handling working:', error.message);
    }

    // Test 6: Timeout test
    try {
        console.log('\n🔬 Test 6: Timeout test');
        await client.get('http://httpbin.org/delay/10', { timeout: 2000 });
    } catch (error) {
        console.log('✅ Timeout handling working:', error.message);
    }

    console.log('\n🎉 Hoàn thành tất cả tests!');
    console.log('='.repeat(60));
}

/**
 * Performance benchmark
 */
async function performanceBenchmark() {
    const client = new HttpClient();
    console.log('\n⚡ Performance Benchmark');
    console.log('='.repeat(40));

    const urls = [
        'http://localhost:3000/api/time',
        'http://localhost:3000/api/info',
        'http://localhost:3000/health'
    ];

    for (const testUrl of urls) {
        try {
            const requests = [];
            const startTime = Date.now();

            // Thực hiện 5 requests song song
            for (let i = 0; i < 5; i++) {
                requests.push(client.get(testUrl));
            }

            const responses = await Promise.all(requests);
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const avgTime = responses.reduce((sum, res) => sum + res.duration, 0) / responses.length;

            console.log(`📊 ${testUrl}:`);
            console.log(`   Tổng thời gian: ${totalTime}ms`);
            console.log(`   Thời gian trung bình: ${avgTime.toFixed(2)}ms`);
            console.log(`   Requests thành công: ${responses.length}/5`);
        } catch (error) {
            console.log(`❌ Benchmark failed for ${testUrl}:`, error.message);
        }
    }
}

// Chạy tests nếu file được execute trực tiếp
if (require.main === module) {
    console.log('🚀 Lab 01 - HTTP Client Testing');
    console.log('👥 Nhóm 31');
    console.log('📅 ' + new Date().toLocaleString('vi-VN'));

    runTests()
        .then(() => performanceBenchmark())
        .then(() => {
            console.log('\n✨ Tất cả tests đã hoàn thành!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = HttpClient;