# 🏢 RentMate — Decentralized Student Room and PG Finder Platform

RentMate is an enterprise-grade, full-stack MERN application designed to eliminate urban housing friction for students and young working professionals moving into new educational or corporate hubs. Developed by Team **ZeroLag** as part of our summer engineering internship evaluation framework, the platform bridges the gap between accommodation seekers and verified property hosts by completely removing brokers, implementing geospatial map discovery, and providing dynamic inventory management tracking.

---

## 👥 Team ZeroLag Contributors
* **Vikash Chaurasiya** — *Founder & System Architect*
* **Amit Gupta** — *Core Backend & API Engineer*
* **Darshika Bhasker** — *Lead UI/UX & Frontend Developer*
* **Dhruv Chaudhary** — *Database Administrator & Cloud Architect*

---

## 🛠️ Core Technology Stack
* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose Data Modeling)[cite: 1]
* **Asset Storage:** Cloudinary CDN Media Pipelines[cite: 1]

---

## ✨ Minimum Viable Product (MVP) Features
* **Geospatial Discovery:** Map-integrated search filters tracking proximity to college campuses and transit hubs[cite: 1].
* **Live Inventory Monitoring:** Real-time bed availability status tracking across shared property units[cite: 1].
* **Multi-Sided Dashboards:** Specialized control panels for Tenants (wishlists, inquiries) and Hosts (listing creation, asset uploads)[cite: 1].
* **Lifestyle Profile Matching:** Prefiltered preferences helping relocatees isolate roommates by diet, curfew, and lifestyle habits[cite: 1].

---

## 📂 Codebase Monorepo Topography

```text
rentmate-app/
├── backend/
│   ├── config/             # Database connectivity & environment variables[cite: 1]
│   ├── controllers/        # Express request orchestration handlers[cite: 1]
│   ├── models/             # Mongoose structural data schemas[cite: 1]
│   ├── routes/             # Exposed REST API endpoints[cite: 1]
│   ├── middleware/         # Token validation & Multer multi-part pipelines[cite: 1]
│   └── server.js           # Main application entry file[cite: 1]
└── frontend/
    ├── public/             # Static public web assets[cite: 1]
    └── src/
        ├── components/     # Atomic reusable interface blocks[cite: 1]
        ├── pages/          # Consolidated routing views (Home, Dashboard, Search)[cite: 1]
        ├── context/        # Global state provider contexts (JWT Auth)[cite: 1]
        └── services/       # Aggregated Axios client network requests[cite: 1]
```
---

## ⚡ Quick Deployment & Setup Instructions
Prerequisites
Ensure you have Node.js and npm installed locally, alongside a live MongoDB Atlas URI string.

1. Backend Configuration
Navigate to the server folder and configure environmental variables:

```Bash
cd rentmate-app/backend
npm install
```
Create a .env file in the root of the backend folder:

```Code snippet

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_json_web_token_hash
CLOUDINARY_URL=your_cloudinary_cdn_setup_url
Start the application server:
```

Bash
```
npm run start
```
2. Frontend Configuration

Open a secondary terminal window and install the UI dependencies:

```Bash
cd rentmate-app/frontend
npm install
npm start
```
The browser will automatically launch the interface portal at http://localhost:3000.

---

## 📈 Sustainable Business Monetization Matrix

Unlike traditional brokers, RentMate utilizes a diversified 6-tiered digital optimization system:

* **Featured Listings (50%):** Premium position slots purchased by property hosts to boost discovery volume.
* **Owner Subscription (25%):** Tiered plans for commercial wardens handling massive multi-bed portfolios.
* **Advertisements (10%):** Hyper-localized spaces for regional food nodes, laundry systems, and packers.
* **Rental Agreements (5%):** Automated creation workflows for legally binding digital rental documents.
* **Tenant Verification (5%):** Premium automated background and identity status checks for fast check-ins.
* **Affiliate Networks (5%):** Integration frameworks with student furniture and appliance renting options.

---
