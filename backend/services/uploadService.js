const multer = require("multer");
const path = require("path");

// Use memory storage for GCS uploads
const gcsStorage = multer.memoryStorage();

/* ---------- FILE FILTER ---------- */

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG or PDF allowed"), false);
  }
};

/* ---------- EXPORT MULTER ---------- */

// Logos, signatures, QR codes and purchase bills (images or PDF): 2 MB is plenty.
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
exports.MAX_UPLOAD_BYTES = MAX_UPLOAD_BYTES;

exports.uploadImportFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
      "application/vnd.ms-excel", 
      "text/csv"
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel or CSV files allowed"), false);
    }
  }
});

exports.uploadLogo = multer({
  storage: gcsStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter
});

exports.uploadSignature = multer({
  storage: gcsStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter
});

exports.uploadQRCode = multer({
  storage: gcsStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter
});

exports.uploadPurchaseFile = multer({
  storage: gcsStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter
});
