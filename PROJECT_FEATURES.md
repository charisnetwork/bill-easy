# Bill Easy - Complete Feature Documentation

> **For CLI Agents**: This document describes all features, architecture, and components of the Bill Easy GST Billing Platform.

---

## 📋 Project Overview

**Bill Easy** is a comprehensive GST-compliant billing and inventory management SaaS platform for Indian SMBs. It includes a customer-facing main application and a developer admin control center.

### Architecture
```
Monorepo Structure:
├── frontend/           # React + Vite customer UI
├── backend/            # Main Node.js/Express API
├── admin/              # Developer Admin Panel
│   ├── backend/        # Admin Node.js/Express API
│   └── frontend/       # Admin React UI (if any)
└── railway-monorepo.js # Gateway proxy for deployment
```

### Deployment
- **Platform**: Railway (single service monorepo)
- **Gateway**: `railway-monorepo.js` proxies requests to internal services
- **URL**: `https://bill-easy-production.up.railway.app`

---

## 🎯 Main Application Features

### 1. Authentication & User Management
| Feature | Description | Endpoint |
|---------|-------------|----------|
| User Registration | Create account with company | `POST /api/auth/register` |
| Login | JWT-based authentication | `POST /api/auth/login` |
| Profile Management | Update user details | `GET/PUT /api/auth/profile` |
| Password Change | Secure password update | `POST /api/auth/change-password` |
| Company Switching | Multi-business support | `POST /api/auth/switch-company/:id` |

**Files**:
- `backend/routes/auth.js`
- `backend/controllers/authController.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/RegisterPage.jsx`

### 2. Company/Business Management
| Feature | Description |
|---------|-------------|
| Business Profile | Company details, GST, address |
| Multi-Business | Add/manage multiple companies |
| Godown/Warehouse | Multiple storage locations |
| Stock Transfer | Transfer inventory between godowns |
| Invoice Customization | Branding, templates, colors |
| User Management | Add staff users with roles |

**Files**:
- `backend/routes/company.js`
- `frontend/src/pages/SettingsPage.jsx`
- `frontend/src/pages/AddBusinessPage.jsx`

### 3. Customer Management
| Feature | Description |
|---------|-------------|
| Customer CRUD | Add, edit, delete customers |
| GSTIN Lookup | Auto-fetch from GST number |
| Customer Ledger | Transaction history per customer |
| Outstanding Reports | Due amounts tracking |

**Files**:
- `backend/routes/customers.js`
- `frontend/src/pages/CustomersPage.jsx`

### 4. Supplier Management
| Feature | Description |
|---------|-------------|
| Supplier CRUD | Vendor management |
| GSTIN Lookup | Auto-fetch supplier details |
| Supplier Ledger | Purchase history |

**Files**:
- `backend/routes/suppliers.js`
- `frontend/src/pages/SuppliersPage.jsx`

### 5. Product & Inventory Management
| Feature | Description |
|---------|-------------|
| Product CRUD | Add/edit products with HSN, GST% |
| Categories | Organize by category |
| Stock Tracking | Real-time inventory levels |
| Multi-Godown | Stock per warehouse |
| Stock Adjustment | Manual corrections |
| Stock Movements | Audit trail |
| Bulk Import | CSV/Excel import |
| Low Stock Alerts | Notification triggers |

**Files**:
- `backend/routes/products.js`
- `frontend/src/pages/ProductsPage.jsx`

### 6. GST Invoicing
| Feature | Description |
|---------|-------------|
| Create Invoice | CGST/SGST/IGST calculation |
| Invoice Templates | Industry-specific formats |
| Item Types | Products + Services |
| Multiple Tax Rates | Per-item GST% |
| Discounts | Line-item and overall |
| TDS/TCS | Tax deduction/collection |
| Invoice Preview | Before saving |
| PDF Generation | Download/Print |
| Invoice Sharing | Email/WhatsApp |
| Payment Recording | Track payments against invoices |
| E-Way Bill | Generate transport docs |

**Files**:
- `backend/routes/invoices.js`
- `backend/controllers/invoiceController.js`
- `frontend/src/pages/CreateInvoicePage.jsx`
- `frontend/src/pages/InvoicesPage.jsx`
- `frontend/src/components/Invoice.jsx`
- `frontend/src/lib/industryConfig.js`

### 7. Purchase Management
| Feature | Description |
|---------|-------------|
| Purchase Orders | Create POs for suppliers |
| Purchase Entries | Record incoming stock |
| PDF Parsing | Auto-extract from supplier PDFs |
| Payment Tracking | Record purchase payments |
| Purchase Returns | Credit notes for purchases |

**Files**:
- `backend/routes/purchases.js`
- `backend/routes/purchaseOrders.js`
- `frontend/src/pages/CreatePurchasePage.jsx`
- `frontend/src/pages/PurchasesPage.jsx`

### 8. Quotations & Estimates
| Feature | Description |
|---------|-------------|
| Create Quotes | Send estimates to customers |
| Quote to Invoice | Convert accepted quotes |
| PDF Generation | Professional quotes |
| Expiry Dates | Validity tracking |

**Files**:
- `backend/routes/quotations.js`
- `frontend/src/pages/CreateQuotationPage.jsx`

### 9. Expense Management
| Feature | Description |
|---------|-------------|
| Expense Categories | Travel, utilities, etc. |
| Expense Entry | Track business expenses |
| Receipt Upload | Attach proofs |
| Expense Reports | Monthly/period summaries |

**Files**:
- `backend/routes/expenses.js`
- `frontend/src/pages/ExpensesPage.jsx`

### 10. Payments Management
| Feature | Description |
|---------|-------------|
| Payments In | Customer payments |
| Payments Out | Supplier payments |
| Payment Modes | Cash, UPI, Bank, etc. |
| Payment History | Full transaction log |

**Files**:
- `backend/routes/payments.js`
- `frontend/src/pages/PaymentsInPage.jsx`

### 11. E-Way Bills
| Feature | Description |
|---------|-------------|
| E-Way Generation | Transport documentation |
| Transporter Details | Vehicle/partner info |
| Distance Calculation | Auto-route calculation |
| Validity Tracking | Expiry notifications |

**Files**:
- `backend/routes/ewayBills.js`
- `frontend/src/pages/CreateEWayBillPage.jsx`

### 12. Credit Notes / Sales Returns
| Feature | Description |
|---------|-------------|
| Return Processing | Handle customer returns |
| Credit Note PDF | Documentation |
| Stock Reversal | Update inventory |

**Files**:
- `backend/routes/creditNotes.js`
- `frontend/src/pages/SalesReturnPage.jsx`

### 13. Reports & Analytics
| Feature | Description |
|---------|-------------|
| Dashboard Metrics | Daily/weekly summaries |
| Sales Reports | Period-wise sales analysis |
| Purchase Reports | Buy-side analytics |
| GST Reports | Input/Output GST summary |
| Profit & Loss | Financial statements |
| Stock Reports | Inventory valuation |
| Customer Outstanding | Receivables aging |
| Supplier Outstanding | Payables tracking |
| Export to Excel | Download reports |

**Files**:
- `backend/routes/reports.js`
- `frontend/src/pages/ReportsPage.jsx`
- `frontend/src/pages/DashboardPage.jsx`

### 14. Subscription & Plans
| Feature | Description |
|---------|-------------|
| Plan Tiers | Free Account, Premium (₹499), Enterprise (₹699) |
| Feature Gates | Plan-based access control |
| Razorpay Integration | Payment processing |
| Usage Tracking | Invoice/product limits |
| Coupon Support | Discount codes |
| Upgrade/Downgrade | Plan switching |

**Files**:
- `backend/routes/subscription.js`
- `backend/models/Plan.js`, `Subscription.js`
- `frontend/src/pages/SubscriptionPage.jsx`
- `frontend/src/utils/subscriptionGuard.js`

### 15. AI Assistant (Charis)
| Feature | Description |
|---------|-------------|
| Gemini 3 Flash | AI-powered chat assistant |
| Billing Q&A | GST, invoicing help |
| Plan Restriction | Premium+ only feature |

**Files**:
- `backend/routes/ai.js`
- `frontend/src/components/CharisAssistant.jsx`

### 16. Utility APIs
| Feature | Description | Endpoint |
|---------|-------------|----------|
| PIN Code Lookup | Auto-fill city/state from PIN | `GET /api/utils/pincode/:pincode` |
| GSTIN Verification | Auto-fetch business details | `GET /api/utils/gst/:gstin` |

**Files**:
- `backend/routes/utilities.js`
- `backend/controllers/utilityController.js`

---

## 🔐 Admin Panel (Developer Control Center)

**Access**: `/admin/api/*` (proxied via gateway)
**Port**: 3025 (internal)
**Default Login**: `pachu.mgd@gmail.com` / `nishu@143`

### Admin Features

| Feature | Description | Endpoint |
|---------|-------------|----------|
| **Dashboard Summary** | Active users, revenue, growth | `GET /admin/api/dashboard/summary` |
| **Revenue Analytics** | MRR, ARR, churn metrics | `GET /admin/api/dashboard/revenue` |
| **Subscriber Analytics** | User growth, activations | `GET /admin/api/dashboard/subscribers` |
| **Coupon Management** | Create/edit discount coupons | `POST/PUT/DELETE /admin/api/coupons` |
| **Coupon Analytics** | Usage stats per coupon | `GET /admin/api/coupons/:id/analytics` |
| **Affiliate Management** | Partner/affiliate tracking | `POST/GET /admin/api/affiliates` |
| **Plan Management** | Feature flags, pricing | `PATCH /admin/api/plans` |
| **Plan Pricing** | Dynamic pricing tiers | `POST/PUT/DELETE /admin/api/plan-pricing` |

**Files**:
- `admin/backend/server.js`
- `admin/backend/routes/adminRoutes.js`
- `admin/backend/controllers/analyticsController.js`
- `admin/backend/controllers/managementController.js`

### Admin Database Models
- **AdminUser**: Admin login credentials
- **Affiliate**: Partner/affiliate data
- **AffiliateReferral**: Referral tracking
- **Coupon**: Discount codes
- **CouponUsage**: Redemption history

---

## 🏗️ Technical Architecture

### Backend Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Sequelize ORM)
- **Auth**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **PDF Generation**: html-pdf-node (Puppeteer)
- **AI**: Google Generative AI (Gemini 3 Flash)
- **Email**: Nodemailer
- **Payments**: Razorpay

### Frontend Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Main Backend Models
```javascript
User, Company, Plan, Subscription, Customer, Supplier,
Product, Category, Godown, Invoice, InvoiceItem, Purchase,
PurchaseOrder, Quotation, Expense, Payment, EWayBill,
CreditNote, GstCache, StaffAttendance, StockMovement
```

---

## 🔧 Environment Variables

### Required for Main App
```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Payments
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI
GEMINI_API_KEY=your-google-ai-key

# Optional
FRONTEND_URL=https://your-domain.com
PORT=8080
```

### Required for Admin
```env
# Same as main PLUS:
ADMIN_SECRET=admin-api-secret-key
ALLOWED_ORIGINS=https://your-admin-domain.com
```

---

## 🚀 Deployment Configuration

### Railway (`railway.toml`)
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node railway-monorepo.js"
healthcheckPath = "/health"
healthcheckTimeout = 300
```

### Nixpacks (`nixpacks.toml`)
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.build]
cmds = [
    "cd frontend && npm install && npm run build",
    "cd backend && npm install",
    "cd admin/backend && npm install"
]
```

### Gateway Routing (`railway-monorepo.js`)
```
External Port 8080
├── /health              → Gateway health check
├── /api/*               → Main Backend (port 8001)
├── /admin/api/*         → Admin Backend (port 3025)
├── /uploads             → Static files
└── /*                   → Frontend SPA (dist/)
```

---

## 📁 Key File Reference

### Backend Routes
| File | Purpose |
|------|---------|
| `backend/routes/auth.js` | Authentication endpoints |
| `backend/routes/company.js` | Business management |
| `backend/routes/customers.js` | Customer CRUD |
| `backend/routes/suppliers.js` | Supplier CRUD |
| `backend/routes/products.js` | Inventory management |
| `backend/routes/invoices.js` | GST invoicing |
| `backend/routes/purchases.js` | Purchase entries |
| `backend/routes/quotations.js` | Quotes/estimates |
| `backend/routes/expenses.js` | Expense tracking |
| `backend/routes/payments.js` | Payment records |
| `backend/routes/reports.js` | Analytics reports |
| `backend/routes/subscription.js` | Plans & billing |
| `backend/routes/ewayBills.js` | Transport docs |
| `backend/routes/creditNotes.js` | Sales returns |
| `backend/routes/ai.js` | AI assistant |
| `backend/routes/utilities.js` | PIN/GST lookup |
| `backend/routes/staff.js` | Staff management |

### Frontend Pages
| File | Purpose |
|------|---------|
| `frontend/src/pages/LoginPage.jsx` | User login |
| `frontend/src/pages/RegisterPage.jsx` | Account creation |
| `frontend/src/pages/DashboardPage.jsx` | Main dashboard |
| `frontend/src/pages/SettingsPage.jsx` | Business settings |
| `frontend/src/pages/CustomersPage.jsx` | Customer management |
| `frontend/src/pages/SuppliersPage.jsx` | Supplier management |
| `frontend/src/pages/ProductsPage.jsx` | Inventory |
| `frontend/src/pages/CreateInvoicePage.jsx` | New invoice |
| `frontend/src/pages/InvoicesPage.jsx` | Invoice list |
| `frontend/src/pages/ReportsPage.jsx` | All reports |
| `frontend/src/pages/SubscriptionPage.jsx` | Plan management |

---

## 🔍 Common Debugging Notes

### API Path Issues
- **Correct**: `/api/utils/pincode/560001`
- **Wrong**: `/api/utilities/pincode/560001`

### Health Check
- Gateway: `GET /health`
- Main Backend: `GET /api/health`
- Admin Backend: `GET /admin/api/health`

### Plan Names
- Database uses: `'Free Account'` (not `'Free'`)
- Premium: `'Premium'`
- Enterprise: `'Enterprise'`

### JWT Required
Registration will fail with 500 if `JWT_SECRET` is not set in environment.

---

**Last Updated**: April 2026
**Version**: 1.0.0
