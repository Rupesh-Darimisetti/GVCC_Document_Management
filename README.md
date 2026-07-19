# AI-Powered Knowledge Base Assistant

A production-oriented, secure, full-stack web application that allows users to upload unstructured files (PDF, TXT, MD), parse their contents into an indexed document store, and interact with the data through a context-aware AI query window. Built using React, TypeScript, Node.js, Express, Mongoose, and styled with Tailwind CSS.

## 🚀 System Features

*   **Secure Authentication Gate:** JWT-based user authentication using state-of-the-art password hashing (`bcryptjs`).
*   **Asynchronous File Ingestion:** Backend validation and parsing of PDF, TXT, and Markdown files up to 15MB.
*   **Contextual Inference Engine:** Vectorless token-frequency matching context window calculation to prevent LLM token-limit crashes.
*   **Operational Telemetry Dashboard:** Aggregate telemetry indicators mapping indexed asset volumes and transaction logs.
*   **Adaptive Workspace:** Fully responsive interface featuring comprehensive loading, empty, and error fallback states.

---

## 🛠️ Infrastructure Setup

### Prerequisites
*   **Node.js** (v18.x or greater recommended)
*   **MongoDB** (Local standalone daemon or active MongoDB Atlas cluster URI string)

### Environment Configurations
Create an active variable file at `backend/.env` matching the blueprint below:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/kb-assistant
JWT_SECRET=super_secure_production_secret_key_1337