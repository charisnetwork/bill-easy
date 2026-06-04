/**
 * Native-aware PDF download utility
 *
 * On web:    Downloads via browser blob (existing behavior)
 * On Android: Uses Capacitor Filesystem + Share plugins to save and share the PDF
 *
 * Usage:
 *   import { downloadPdf } from '@/utils/pdfDownload';
 *   await downloadPdf(blobOrApiCall, 'Invoice-001.pdf');
 */

import { Capacitor } from '@capacitor/core';

// Dynamically import native plugins only on native platforms to avoid web bundle bloat
const getNativePlugins = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');
  return { Filesystem, Directory, Encoding, Share };
};

/**
 * Convert a Blob to base64 string
 */
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // strip data:...base64,
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

/**
 * Download a PDF — works on both web and Android.
 *
 * @param {Blob | Promise<Blob>} blobOrPromise  - The PDF blob or a promise that resolves to one
 * @param {string} filename                      - e.g. 'Invoice-001.pdf'
 */
export const downloadPdf = async (blobOrPromise, filename = 'document.pdf') => {
  try {
    // Resolve promise if needed
    const blob = blobOrPromise instanceof Promise
      ? (await blobOrPromise).data   // Axios response
      : blobOrPromise;

    if (Capacitor.isNativePlatform()) {
      // ── Android / iOS ──────────────────────────────────
      const plugins = await getNativePlugins();
      const { Filesystem, Directory, Share } = plugins;

      const base64 = await blobToBase64(blob);

      // Write to device Documents folder
      const result = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Documents,
        recursive: true
      });

      // Open native share sheet so user can share via WhatsApp, email, etc.
      await Share.share({
        title: filename,
        text: `Sharing ${filename}`,
        url: result.uri,
        dialogTitle: 'Share or Save PDF'
      });
    } else {
      // ── Web ────────────────────────────────────────────
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('[PDF Download] Error:', error);
    throw new Error('Failed to download PDF. Please try again.');
  }
};

/**
 * Open a URL — works on both web and Android.
 * On Android, opens in the in-app browser (Capacitor Browser plugin).
 *
 * @param {string} url
 */
export const openUrl = async (url) => {
  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};
