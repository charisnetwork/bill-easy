// Bill Easy Desktop App - Fixed Version (No iframe)
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

// Open external web app in default browser (NOT in iframe)
function openExternalApp(path = '') {
    const url = `${WEB_APP_URL}${path}`;
    
    // Use Electron's shell to open in default browser
    if (window.electronAPI) {
        window.electronAPI.openExternal(url);
    } else {
        // Fallback for regular browser
        window.open(url, '_blank');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N for new invoice
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openExternalApp('/invoices/new');
    }
});

// Check if running in Electron
if (window.electronAPI) {
    console.log('Running in Electron mode');
} else {
    console.log('Running in browser mode');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bill Easy Desktop App Loaded');
});
