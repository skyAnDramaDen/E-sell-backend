# E-sell Marketplace Backend

A high-performance, real-time backend API for a React Native marketplace application. This server powers user authentication, listing management, and instant buyer-seller communication.

[![Regression Suite Test](https://github.com/skyAnDramaDen/E-sell-backend/actions/workflows/tests.yml/badge.svg)](https://github.com/skyAnDramaDen/E-sell-backend/actions/workflows/tests.yml)

---

## 🚀 Key Features

* **Real-Time Messaging:** Integrated **Socket.io** for live chat functionality between buyers and sellers.
* **Cloud Image Hosting:** Robust image upload system using **Multer** and **Google Cloud Storage (GCS Buckets)** for scalable file management.
* **Marketplace CRUD:** Full lifecycle management for product listings, including creation, editing, and advanced search filters.
* **Secure Authentication:** JWT-based auth flow with encrypted passwords and protected API routes.
* **User Profiles:** Customizable user profiles with cloud-hosted avatars.

## 🛠 Tech Stack

* **Runtime:** Node.js (TypeScript)
* **Framework:** Express.js
* **Database:** PostgreSQL (via Neon Console)
* **File Storage:** Google Cloud Storage (Bucket)
* **Middleware:** Multer (Multipart/form-data handling)
* **Real-Time:** Socket.io
* **Deployment:** Render
* **CI/CD & Testing:** GitHub Actions & Newman (Postman)

## 🧪 Automated Testing & CI/CD

This project implements a professional **Regression Suite** to ensure stability with every update:
* **Workflow:** Every push to GitHub triggers an automated test runner.
* **Coverage:** Tests include Login/Auth validation, User existence checks, and API response integrity.
* **Cloud Readiness:** Configured with a dedicated `/health` route and binds to `0.0.0.0` for reliable Render deployment.

---

## ⚙️ Installation & Local Development

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/skyAnDramaDen/E-sell-backend.git](https://github.com/skyAnDramaDen/E-sell-backend.git)
   cd E-sell-backend