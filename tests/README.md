# QRasoi Production-Grade k6 Performance & Load Testing Suite

This repository contains a modular, production-grade performance and load testing framework built with **[Grafana k6](https://k6.io/)** for the QRasoi SaaS digital menu and ordering platform.

---

## 📁 Directory Architecture

```
tests/
  ├── package.json               # Package definition & execution shortcuts
  ├── README.md                  # Comprehensive Performance Testing Guide
  ├── main.js                    # Primary integrated multi-role scenario entrypoint
  ├── config/
  │     ├── env.js               # Target environment & credential variables
  │     └── thresholds.js        # SLA thresholds & pass/fail quality gates
  ├── utils/
  │     ├── auth.js              # Token acquisition helpers (Owner, Chef, Admin 2FA)
  │     └── helpers.js           # Custom k6 metrics & mock data generators
  ├── scenarios/
  │     ├── customer_scenario.js # Customer browsing, order placement & tracking
  │     ├── owner_scenario.js    # Owner live order fetch, cashier payment verification
  │     ├── chef_scenario.js     # Kitchen KDS queue, item & order status updates
  │     └── admin_scenario.js    # Super Admin multi-tenant management
  └── profiles/
        ├── low_traffic.js       # Small restaurant scenario (5 VUs)
        ├── medium_traffic.js    # Busy restaurant scenario (25 VUs)
        ├── peak_hours.js        # Peak lunch/dinner rush (100 VUs)
        ├── login_burst.js       # Authentication & bcrypt stress test (30 VUs)
        ├── stress_test.js       # System failure limit discovery (200 VUs)
        └── soak_test.js         # Sustained stability soak test (20 VUs over 5m)
```

---

## 🚀 Prerequisites & Installation

### 1. Install k6 CLI

- **Windows (winget):**
  ```powershell
  winget install k6 --source winget
  ```
- **macOS (Homebrew):**
  ```bash
  brew install k6
  ```
- **Linux (Debian/Ubuntu):**
  ```bash
  sudo gpg -k
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```

---

## ⚙️ Environment Configuration

By default, tests target the live production deployment `https://qrasoi.onrender.com/api`.  
You can override the target URL or credentials using environment variables:

```powershell
# Windows PowerShell example for local backend
$env:TARGET_URL="http://localhost:5000/api"
$env:RESTAURANT_SLUG="dineverse-bistro"
k6 run main.js
```

---

## 🏃 Running Test Profiles

Run commands directly using `npm` or the `k6` CLI:

| Testing Profile | Purpose | Executing Command |
|---|---|---|
| **Integrated Suite** | Full multi-role restaurant day simulation | `npm run test` or `k6 run main.js` |
| **Low Traffic** | Small outlet simulation (5 VUs) | `npm run test:low` |
| **Medium Traffic** | Busy outlet simulation (25 VUs) | `npm run test:medium` |
| **Peak Rush Hours** | High-density lunch/dinner rush (100 VUs) | `npm run test:peak` |
| **Login Burst** | Bcrypt & Auth CPU stress test | `npm run test:burst` |
| **Stress Test** | System throughput limit discovery (200 VUs) | `npm run test:stress` |
| **Soak Test** | 5-minute memory leak & stability check | `npm run test:soak` |

---

## 📊 Key Performance Metrics & SLAs

| Metric | Target SLA / Threshold | Description |
|---|---|---|
| `http_req_failed` | `< 0.01` (< 1% Error Rate) | Percentage of HTTP 4xx/5xx failures |
| `http_req_duration` | `p(95) < 500ms`, `p(99) < 1500ms` | 95th & 99th percentile response latency |
| `public_menu_latency` | `p(95) < 100ms` | In-memory cache evaluation speed |
| `order_placement_latency` | `p(95) < 400ms` | End-to-end customer order placement speed |
| `payment_verify_latency` | `p(95) < 300ms` | Cashier payment verification speed |

---

## 📈 Exporting Reports

Export structured execution reports for CI/CD pipelines or performance auditing:

```bash
# Export JSON summary report
k6 run --summary-export=report.json main.js
```
