// Loaded from a file (not inline) so the Content-Security-Policy needs no 'unsafe-inline' for scripts.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-HMTBF15XC3');

// Suppress a noisy DOMException raised by some browser extensions.
window.addEventListener('error', function (e) {
  if (e.error instanceof DOMException && e.error.name === 'DataCloneError' && e.message && e.message.includes('PerformanceServerTiming')) {
    e.stopImmediatePropagation(); e.preventDefault();
  }
}, true);
