# Bill Easy Desktop - Offline-First Edition

A Windows desktop application for Bill Easy with offline-first architecture. Works without internet and syncs with the cloud when connected.

## Features

- ✅ **Offline-First**: Works completely without internet
- ✅ **Local SQLite Database**: All data stored locally
- ✅ **Automatic Sync**: Syncs with cloud when online
- ✅ **Sync Queue**: Pending changes queued for later upload
- ✅ **Conflict Resolution**: Handles concurrent edits
- ✅ **Windows Installer**: Professional NSIS installer

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Bill Easy Desktop                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  React UI   │  │  Services   │  │  Tauri/SQLite       │ │
│  │             │◄─┤  (CRUD)     │◄─┤  (Local DB)         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                │                                      │
│         │         ┌─────────────┐                            │
│         │         │ Sync Engine │                            │
│         │         │ - Queue     │                            │
│         │         │ - Retry     │                            │
│         │         │ - Conflict  │                            │
│         │         └──────┬──────┘                            │
│         │                │                                      │
│         └────────────────┘                                      │
│                          │  (when online)                      │
│                          ▼                                      │
│                   ┌─────────────┐                              │
│                   │Cloud Backend│                              │
│                   └─────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: React + Vite
- **Desktop**: Tauri (Rust-based, lightweight)
- **Database**: SQLite (via Tauri SQL Plugin)
- **Sync**: Custom sync engine with queue pattern
- **Build**: Windows NSIS Installer

## Quick Start

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (v18+)
2. Install [Rust](https://rustup.rs/)
3. Install Tauri CLI: `cargo install tauri-cli`

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

### Build Windows Installer

```bash
# Build the installer
npm run tauri:build

# The installer will be at:
# src-tauri/target/release/bundle/nsis/Bill-Easy_2.0.0_x64-setup.exe
```

## Database Schema

Each table includes sync fields:
- `id` - Cloud ID (UUID)
- `local_id` - Local UUID
- `sync_status` - 'pending' | 'syncing' | 'synced' | 'failed'
- `version` - For conflict detection
- `is_deleted` - Soft delete flag
- `created_at` / `updated_at` / `deleted_at`

### Tables

1. **companies** - Business profiles
2. **customers** - Customer directory
3. **products** - Product catalog with stock
4. **invoices** - Sales invoices
5. **invoice_items** - Line items
6. **payments** - Payment records
7. **sync_queue** - Pending operations
8. **sync_metadata** - Last sync timestamps

## Sync Flow

1. **On Startup**:
   - Load local data immediately
   - Render UI (no waiting)
   - Check network status
   - If online: sync in background

2. **Local Changes**:
   - Save to SQLite immediately
   - Add to sync_queue
   - Update sync_status to 'pending'
   - Try to sync if online

3. **Sync Process**:
   - Push pending changes (queue)
   - Pull latest from cloud
   - Handle conflicts (local-wins default)
   - Update sync_metadata

4. **Conflict Resolution**:
   - Compare versions
   - Compare timestamps
   - Apply strategy: 'local-wins' | 'remote-wins' | 'manual'

## Offline Behavior

| Feature | Offline | Online |
|---------|---------|--------|
| Create Invoice | ✅ Local only | ✅ Local + Cloud |
| View Invoices | ✅ From cache | ✅ From cache |
| Edit Customer | ✅ Queued | ✅ Synced |
| View Reports | ✅ Local data | ✅ Local data |
| Sync Status | ⏳ Pending | ✅ Synced |

## Configuration

Set these environment variables or use the Settings page:

```env
API_BASE_URL=https://bill-easy-production-v4.up.railway.app/api
AUTH_TOKEN=your_jwt_token_here
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run Vite dev server |
| `npm run build` | Build production bundle |
| `npm run tauri:dev` | Run Tauri in dev mode |
| `npm run tauri:build` | Build Windows installer |
| `npm run tauri:build:win` | Build Windows MSI/NSIS |

## Project Structure

```
desktop-app/
├── src/
│   ├── components/       # React components
│   ├── services/         # Business logic & DB
│   ├── styles/           # CSS files
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── src-tauri/
│   ├── src/main.rs       # Rust backend
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri config
├── index.html
├── package.json
└── vite.config.js
```

## Troubleshooting

### Build fails on Windows

Make sure you have:
- Visual Studio Build Tools (C++ workload)
- Windows SDK
- Rust MSVC toolchain: `rustup default stable-x86_64-pc-windows-msvc`

### Database locked

SQLite database is single-writer. If you get "database is locked":
1. Close other connections
2. Check for long-running transactions
3. Use WAL mode (already enabled)

### Sync not working

1. Check Settings → enter valid auth token
2. Click "Sync Now" manually
3. Check console for errors
4. Verify internet connection

## License

MIT
