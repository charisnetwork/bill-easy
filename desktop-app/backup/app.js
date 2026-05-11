// Bill Easy Desktop App
const WEB_APP_URL = 'https://charisbilleasy.store';

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active from all nav items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active to clicked item
        item.classList.add('active');
        
        // Hide all pages
        pages.forEach(page => page.classList.remove('active'));
        
        // Show selected page
        const pageName = item.getAttribute('data-page');
        const page = document.getElementById(`${pageName}-page`);
        if (page) {
            page.classList.add('active');
        }
        
        // Update page title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = item.querySelector('span:last-child').textContent;
        }
    });
});

// Open Web App in Modal
function openWebApp(path) {
    const modal = document.getElementById('webview-modal');
    const frame = document.getElementById('webview-frame');
    
    frame.src = `${WEB_APP_URL}${path}`;
    modal.classList.add('active');
}

// Close WebView
function closeWebView() {
    const modal = document.getElementById('webview-modal');
    const frame = document.getElementById('webview-frame');
    
    frame.src = '';
    modal.classList.remove('active');
}

// Create Invoice
function createInvoice() {
    openWebApp('/invoices/new');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeWebView();
    }
    
    // Ctrl/Cmd + N for new invoice
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createInvoice();
    }
});

// Check if running in Electron
if (window.electronAPI) {
    console.log('Running in Electron mode');
    
    // Use Electron's native APIs
    window.electronAPI.onNavigate((path) => {
        openWebApp(path);
    });
} else {
    console.log('Running in browser mode');
}

// Auto-refresh stats every 5 minutes
setInterval(() => {
    fetchStats();
}, 300000);

// Fetch stats from API
async function fetchStats() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${WEB_APP_URL}/api/reports/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateStats(data);
        }
    } catch (error) {
        console.log('Stats fetch error:', error);
    }
}

// Update stats on dashboard
function updateStats(data) {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = formatCurrency(data.todaySales || 0);
        statValues[1].textContent = data.totalInvoices || 0;
        statValues[2].textContent = data.totalProducts || 0;
        statValues[3].textContent = data.totalCustomers || 0;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bill Easy Desktop App Loaded');
    
    // Check for updates (if in Electron)
    if (window.electronAPI) {
        window.electronAPI.checkForUpdates();
    }
});

// Handle external links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
        e.preventDefault();
        if (window.electronAPI) {
            window.electronAPI.openExternal(e.target.href);
        } else {
            window.open(e.target.href, '_blank');
        }
    }
});
