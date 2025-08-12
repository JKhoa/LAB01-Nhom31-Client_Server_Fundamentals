/**
 * Client-side JavaScript cho Lab 01 - Client-Server Fundamentals
 * Nhóm 31 - Phát triển Ứng dụng Web Nâng cao
 */

// Global variables
let requestStats = {
    totalRequests: 0,
    totalResponseTime: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalDataTransferred: 0
};

let requestHistory = [];
let websocket = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Lab 01 Client-Side App - Nhóm 31');
    console.log('📅 Initialized at:', new Date().toLocaleString('vi-VN'));

    initializeApp();
    updateTimestamp();
    checkServerStatus();

    // Update timestamp every second
    setInterval(updateTimestamp, 1000);

    // Check server status every 30 seconds
    setInterval(checkServerStatus, 30000);
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Set initial values
    updateStats();

    // Add event listeners
    setupEventListeners();

    // Initial server info load
    setTimeout(testServerInfo, 1000);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Custom request form
    const methodSelect = document.getElementById('http-method');
    const bodyTextarea = document.getElementById('request-body');

    if (methodSelect && bodyTextarea) {
        methodSelect.addEventListener('change', function() {
            const isPostPut = ['POST', 'PUT'].includes(this.value);
            bodyTextarea.style.display = isPostPut ? 'block' : 'none';

            if (isPostPut && !bodyTextarea.value.trim()) {
                bodyTextarea.value = JSON.stringify({
                    message: "Test message from Nhóm 31",
                    timestamp: new Date().toISOString(),
                    method: this.value
                }, null, 2);
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    testServerInfo();
                    break;
                case '2':
                    e.preventDefault();
                    testTimestamp();
                    break;
                case '3':
                    e.preventDefault();
                    testEcho();
                    break;
                case '4':
                    e.preventDefault();
                    testPerformance();
                    break;
                case 'r':
                    e.preventDefault();
                    clearStats();
                    break;
            }
        }
    });
}

/**
 * Update current timestamp display
 */
function updateTimestamp() {
    const timestampElement = document.getElementById('current-time');
    if (timestampElement) {
        const now = new Date();
        timestampElement.textContent = now.toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

/**
 * Check server status
 */
async function checkServerStatus() {
    const statusElement = document.getElementById('server-status');
    const statusDot = statusElement ? .querySelector('.status-dot');
    const statusText = statusElement ? .querySelector('span:last-child');

    try {
        const response = await fetch('/health');
        const data = await response.json();

        if (response.ok) {
            statusDot ? .classList.remove('error');
            if (statusText) statusText.textContent = 'Online';
            console.log('✅ Server is online');
        } else {
            throw new Error('Server returned error status');
        }
    } catch (error) {
        statusDot ? .classList.add('error');
        if (statusText) statusText.textContent = 'Offline';
        console.log('❌ Server is offline:', error.message);
    }
}

/**
 * Show loading overlay
 */
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('show');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

/**
 * Make HTTP request with monitoring
 */
async function makeRequest(url, options = {}) {
    const startTime = performance.now();

    try {
        showLoading();

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Type': 'Lab01-Frontend',
                'X-Request-ID': generateRequestId(),
                ...options.headers
            }
        });

        const endTime = performance.now();
        const duration = endTime - startTime;

        let responseData;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        // Calculate data size
        const responseSize = new Blob([JSON.stringify(responseData)]).size;
        const requestSize = options.body ? new Blob([options.body]).size : 0;

        // Update stats
        updateRequestStats(true, duration, responseSize + requestSize);

        // Add to history
        addToRequestHistory({
            timestamp: new Date().toISOString(),
            method: options.method || 'GET',
            url: url,
            status: response.status,
            duration: duration,
            size: responseSize + requestSize,
            success: response.ok
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return {
            data: responseData,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            duration: duration
        };

    } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        updateRequestStats(false, duration, 0);

        addToRequestHistory({
            timestamp: new Date().toISOString(),
            method: options.method || 'GET',
            url: url,
            status: 'Error',
            duration: duration,
            size: 0,
            success: false,
            error: error.message
        });

        throw error;
    } finally {
        hideLoading();
    }
}

/**
 * Generate unique request ID
 */
function generateRequestId() {
    return 'req_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * Update request statistics
 */
function updateRequestStats(success, duration, size) {
    requestStats.totalRequests++;
    requestStats.totalResponseTime += duration;
    requestStats.totalDataTransferred += size;

    if (success) {
        requestStats.successfulRequests++;
    } else {
        requestStats.failedRequests++;
    }

    updateStats();
}

/**
 * Update stats display
 */
function updateStats() {
    const totalElement = document.getElementById('total-requests');
    const avgTimeElement = document.getElementById('avg-response-time');
    const successRateElement = document.getElementById('success-rate');
    const dataTransferredElement = document.getElementById('data-transferred');

    if (totalElement) totalElement.textContent = requestStats.totalRequests;

    if (avgTimeElement) {
        const avgTime = requestStats.totalRequests > 0 ?
            requestStats.totalResponseTime / requestStats.totalRequests :
            0;
        avgTimeElement.textContent = `${avgTime.toFixed(2)}ms`;
    }

    if (successRateElement) {
        const successRate = requestStats.totalRequests > 0 ?
            (requestStats.successfulRequests / requestStats.totalRequests * 100) :
            100;
        successRateElement.textContent = `${successRate.toFixed(1)}%`;
    }

    if (dataTransferredElement) {
        dataTransferredElement.textContent = formatBytes(requestStats.totalDataTransferred);
    }
}

/**
 * Add request to history table
 */
function addToRequestHistory(request) {
    requestHistory.unshift(request);

    // Keep only last 20 requests
    if (requestHistory.length > 20) {
        requestHistory = requestHistory.slice(0, 20);
    }

    updateHistoryTable();
}

/**
 * Update history table display
 */
function updateHistoryTable() {
    const tbody = document.querySelector('#request-history');
    if (!tbody) return;

    if (requestHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No requests yet...</td></tr>';
        return;
    }

    tbody.innerHTML = requestHistory.map(req => `
        <tr>
            <td title="${req.timestamp}">${new Date(req.timestamp).toLocaleTimeString('vi-VN')}</td>
            <td><span class="method-badge method-${req.method?.toLowerCase() || 'get'}">${req.method || 'GET'}</span></td>
            <td title="${req.url}">${truncateUrl(req.url)}</td>
            <td class="${req.success ? 'status-success' : 'status-error'}">${req.status}</td>
            <td>${req.duration?.toFixed(2) || 0}ms</td>
            <td>${formatBytes(req.size || 0)}</td>
        </tr>
    `).join('');
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncate URL for display
 */
function truncateUrl(url) {
    if (url.length <= 30) return url;
    return url.substring(0, 27) + '...';
}

/**
 * Display response in the response box
 */
function displayResponse(data, title = 'Response') {
    const responseElement = document.getElementById('api-response');
    if (responseElement) {
        const formattedData = typeof data === 'object' ?
            JSON.stringify(data, null, 2) :
            data;

        responseElement.textContent = `=== ${title} ===\n${formattedData}`;
        responseElement.scrollTop = 0;
    }
}

// API Testing Functions

/**
 * Test server info endpoint
 */
async function testServerInfo() {
    try {
        console.log('🔍 Testing server info endpoint...');
        const response = await makeRequest('/api/info');

        // Update server info display
        updateServerInfoDisplay(response.data);

        displayResponse(response.data, 'Server Information');
        console.log('✅ Server info test successful');

    } catch (error) {
        console.error('❌ Server info test failed:', error);
        displayResponse({ error: error.message }, 'Error');
    }
}

/**
 * Update server info display
 */
function updateServerInfoDisplay(data) {
    const elements = {
        'platform': data.server ? .platform || 'Unknown',
        'node-version': data.server ? .nodeVersion || 'Unknown',
        'uptime': data.server ? .uptime ? `${Math.floor(data.server.uptime / 3600)}h ${Math.floor((data.server.uptime % 3600) / 60)}m` : 'Unknown',
        'memory-usage': data.server ? .memoryUsage ? `${Math.round(data.server.memoryUsage.heapUsed / 1024 / 1024)}MB` : 'Unknown'
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

/**
 * Test timestamp endpoint
 */
async function testTimestamp() {
    try {
        console.log('🕒 Testing timestamp endpoint...');
        const response = await makeRequest('/api/time');

        displayResponse(response.data, 'Timestamp Information');
        console.log('✅ Timestamp test successful');

    } catch (error) {
        console.error('❌ Timestamp test failed:', error);
        displayResponse({ error: error.message }, 'Error');
    }
}

/**
 * Test echo endpoint
 */
async function testEcho() {
    try {
        console.log('📢 Testing echo endpoint...');

        const testData = {
            message: 'Hello from Lab 01 - Nhóm 31',
            timestamp: new Date().toISOString(),
            testData: {
                numbers: [1, 2, 3, 4, 5],
                boolean: true,
                nested: { key: 'value' }
            }
        };

        const response = await makeRequest('/api/echo', {
            method: 'POST',
            body: JSON.stringify(testData)
        });

        displayResponse(response.data, 'Echo Response');
        console.log('✅ Echo test successful');

    } catch (error) {
        console.error('❌ Echo test failed:', error);
        displayResponse({ error: error.message }, 'Error');
    }
}

/**
 * Test performance endpoint
 */
async function testPerformance() {
    try {
        console.log('⚡ Testing performance endpoint...');
        const response = await makeRequest('/api/performance');

        displayResponse(response.data, 'Performance Test Result');
        console.log('✅ Performance test successful');

    } catch (error) {
        console.error('❌ Performance test failed:', error);
        displayResponse({ error: error.message }, 'Error');
    }
}

/**
 * Send custom request
 */
async function sendCustomRequest() {
    const method = document.getElementById('http-method') ? .value || 'GET';
    const url = document.getElementById('request-url') ? .value || '/api/time';
    const body = document.getElementById('request-body') ? .value;

    try {
        console.log(`🔧 Sending custom ${method} request to ${url}...`);

        const options = { method };

        if (['POST', 'PUT'].includes(method) && body) {
            try {
                JSON.parse(body); // Validate JSON
                options.body = body;
            } catch (e) {
                throw new Error('Invalid JSON in request body');
            }
        }

        const response = await makeRequest(url, options);

        displayResponse({
            method: method,
            url: url,
            status: response.status,
            headers: response.headers,
            data: response.data,
            duration: `${response.duration.toFixed(2)}ms`
        }, 'Custom Request Response');

        console.log('✅ Custom request successful');

    } catch (error) {
        console.error('❌ Custom request failed:', error);
        displayResponse({ error: error.message }, 'Custom Request Error');
    }
}

/**
 * Clear statistics
 */
function clearStats() {
    requestStats = {
        totalRequests: 0,
        totalResponseTime: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalDataTransferred: 0
    };

    requestHistory = [];

    updateStats();
    updateHistoryTable();

    console.log('🔄 Statistics cleared');

    const responseElement = document.getElementById('api-response');
    if (responseElement) {
        responseElement.textContent = 'Statistics cleared. Click a button to test APIs...';
    }
}

/**
 * Initialize WebSocket connection (Bonus feature)
 */
function initWebSocket() {
    const wsStatusElement = document.getElementById('ws-status');
    const wsMessagesElement = document.getElementById('ws-messages');
    const connectButton = document.getElementById('ws-connect');

    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
        return;
    }

    try {
        wsStatusElement.textContent = 'Connecting...';
        wsStatusElement.className = 'ws-status connecting';
        connectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

        // Try to connect to a WebSocket echo server for demo
        websocket = new WebSocket('wss://echo.websocket.org');

        websocket.onopen = function(event) {
            console.log('✅ WebSocket connected');
            wsStatusElement.textContent = 'Connected';
            wsStatusElement.className = 'ws-status connected';
            connectButton.innerHTML = '<i class="fas fa-unlink"></i> Disconnect';

            // Send a test message
            const message = {
                type: 'greeting',
                from: 'Lab01-Nhom31',
                timestamp: new Date().toISOString(),
                message: 'Hello from WebSocket client!'
            };

            websocket.send(JSON.stringify(message));
            addWebSocketMessage('Sent: ' + JSON.stringify(message, null, 2), 'sent');
        };

        websocket.onmessage = function(event) {
            console.log('📨 WebSocket message received:', event.data);
            addWebSocketMessage('Received: ' + event.data, 'received');
        };

        websocket.onclose = function(event) {
            console.log('📴 WebSocket disconnected');
            wsStatusElement.textContent = 'Disconnected';
            wsStatusElement.className = 'ws-status';
            connectButton.innerHTML = '<i class="fas fa-plug"></i> Connect WebSocket';
        };

        websocket.onerror = function(error) {
            console.error('❌ WebSocket error:', error);
            wsStatusElement.textContent = 'Connection Error';
            wsStatusElement.className = 'ws-status error';
            connectButton.innerHTML = '<i class="fas fa-plug"></i> Connect WebSocket';
        };

    } catch (error) {
        console.error('❌ WebSocket initialization failed:', error);
        wsStatusElement.textContent = 'Not supported';
        wsStatusElement.className = 'ws-status error';
        connectButton.innerHTML = '<i class="fas fa-plug"></i> Connect WebSocket';
    }
}

/**
 * Add message to WebSocket messages display
 */
function addWebSocketMessage(message, type) {
    const wsMessagesElement = document.getElementById('ws-messages');
    if (wsMessagesElement) {
        const timestamp = new Date().toLocaleTimeString('vi-VN');
        const messageElement = document.createElement('div');
        messageElement.className = `ws-message ws-message-${type}`;
        messageElement.textContent = `[${timestamp}] ${message}`;

        wsMessagesElement.appendChild(messageElement);
        wsMessagesElement.scrollTop = wsMessagesElement.scrollHeight;

        // Keep only last 50 messages
        while (wsMessagesElement.children.length > 50) {
            wsMessagesElement.removeChild(wsMessagesElement.firstChild);
        }
    }
}

// Export functions for testing in console
window.lab01 = {
    testServerInfo,
    testTimestamp,
    testEcho,
    testPerformance,
    sendCustomRequest,
    clearStats,
    initWebSocket,
    makeRequest,
    requestStats,
    requestHistory
};

console.log('📋 Available functions in window.lab01:', Object.keys(window.lab01));
console.log('💡 Keyboard shortcuts: Ctrl+1-4 for tests, Ctrl+R to clear stats');