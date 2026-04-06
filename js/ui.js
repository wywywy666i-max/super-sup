// ============================================================
// UI UTILITIES & HELPER FUNCTIONS
// ============================================================

/**
 * UI Manager
 */
class UIManager {
    constructor() {
        this.toasts = [];
        this.modals = new Map();
        this.loading = false;
    }

    /**
     * Show Toast Notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);
        this.toasts.push(toast);

        setTimeout(() => {
            toast.style.animation = 'slideInLeft 0.3s ease-out reverse';
            setTimeout(() => {
                toast.remove();
                this.toasts = this.toasts.filter(t => t !== toast);
            }, 300);
        }, duration);

        return toast;
    }

    /**
     * Show Loading Spinner
     */
    showLoading(text = 'Loading...') {
        if (this.loading) return;

        this.loading = true;
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        overlay.innerHTML = `
            <div style="text-align: center;">
                <div class="loader"></div>
                <p style="color: white; margin-top: 1rem;">${text}</p>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    /**
     * Hide Loading Spinner
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
            this.loading = false;
        }
    }

    /**
     * Show Modal
     */
    showModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9998;
        `;

        const box = document.createElement('div');
        box.style.cssText = `
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            box-shadow: var(--shadow-lg);
        `;

        box.innerHTML = `
            <h2>${title}</h2>
            <div style="margin: 1.5rem 0;">${content}</div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                ${buttons.map((btn, idx) => `
                    <button class="btn-${btn.type || 'secondary'}" data-action="${idx}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>
        `;

        modal.appendChild(box);
        document.body.appendChild(modal);

        // Handle button clicks
        buttons.forEach((btn, idx) => {
            const button = box.querySelector(`[data-action="${idx}"]`);
            button.addEventListener('click', () => {
                if (btn.callback) btn.callback();
                modal.remove();
            });
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        return modal;
    }

    /**
     * Format Currency
     */
    formatCurrency(value, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }

    /**
     * Format Number
     */
    formatNumber(value, decimals = 2) {
        return parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    /**
     * Format Percentage
     */
    formatPercentage(value, decimals = 2) {
        return parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }) + '%';
    }

    /**
     * Format Date Time
     */
    formatDateTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get Color for Value
     */
    getColorForValue(value) {
        if (value > 0) return '#00cc88';
        if (value < 0) return '#ff3333';
        return '#a0aec0';
    }

    /**
     * Animate Number Change
     */
    animateNumber(element, start, end, duration = 1000) {
        const range = end - start;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (range * progress);

            element.textContent = this.formatNumber(current, 2);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Copy to Clipboard
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('✅ Copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('❌ Copy failed!', 'danger');
        });
    }

    /**
     * Validate Email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate Number
     */
    validateNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    /**
     * Create Table
     */
    createTable(headers, rows) {
        let html = '<table><thead><tr>';

        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });

        html += '</tr></thead><tbody>';

        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    /**
     * Download File
     */
    downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Debounce Function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle Function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep Clone Object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Merge Objects
     */
    mergeObjects(target, source) {
        return { ...target, ...source };
    }

    /**
     * Sleep Function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get Query Parameter
     */
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * Set Query Parameter
     */
    setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    }

    /**
     * Local Storage Helpers
     */
    storage = {
        set: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
        },
        get: (key, defaultValue = null) => {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        },
        remove: (key) => {
            localStorage.removeItem(key);
        },
        clear: () => {
            localStorage.clear();
        }
    }

    /**
     * Session Storage Helpers
     */
    session = {
        set: (key, value) => {
            sessionStorage.setItem(key, JSON.stringify(value));
        },
        get: (key, defaultValue = null) => {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        },
        remove: (key) => {
            sessionStorage.removeItem(key);
        },
        clear: () => {
            sessionStorage.clear();
        }
    }
}

/**
 * Initialize UI Manager
 */
const ui = new UIManager();

// Export for use
window.UI = ui;

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        ui.showToast('✅ Auto-saved', 'success', 2000);
    }

    // Ctrl+H for help
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        ui.showModal('Quick Help', `
            <p><strong>Keyboard Shortcuts:</strong></p>
            <ul>
                <li>Ctrl+S: Save/Auto-save</li>
                <li>Ctrl+H: Show this help</li>
                <li>1-5: Navigate to pages</li>
            </ul>
        `, [{ text: 'Close', type: 'primary' }]);
    }

    // Number keys for page navigation
    if (e.key >= '1' && e.key <= '5') {
        const page = parseInt(e.key);
        if (window.app) {
            window.app.loadPage(page);
        }
    }
});

// Add page visibility detection
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App hidden');
    } else {
        console.log('App visible');
        // Resume updates
    }
});