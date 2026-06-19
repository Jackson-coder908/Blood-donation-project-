# LifeFlow 🩸
> An Intelligent Web-Based Blood Donation Management & Spatial Matchmaking System.

LifeFlow is a full-stack web application designed to streamline blood donation workflows, enforce automated medical eligibility checks, and map real-time donor-to-hospital tracking. Built as a native desktop web app using modern JavaScript, asynchronous Node.js APIs, and an optimized relational database, LifeFlow eliminates manually screened registry errors and bridges the gap between active donors and critical healthcare institutions across Kerala.

---

## 🚀 Key Features

### 🩺 1. Automated Medical Eligibility Guardrails
The registration pipeline performs instantaneous pre-flight health calculations on the client side before any network traffic is hit, ensuring data integrity:
* **Age Verification:** Dynamically computes precise calendar age from the donor's Date of Birth (DOB). Automatically blocks registration for individuals outside the safe $< 18$ or $> 65$ age limits.
* **Weight Constraints:** Evaluates body mass thresholds, strictly enforcing a minimum metric limit of **50 kg** for safe volunteer collection.
* **90-Day Cooldown Validation:** Tracks historical records. If a donor indicates a prior donation, the system calculates the exact epoch millisecond differential between their past donation date and their preferred appointment date, enforcing a strict **90-day systemic lock**.

### 🗺️ 2. Real-Time Spatial Matchmaking (Geographic Intelligence)
* **Leaflet Map Architecture:** Integrated with asynchronous OpenStreetMap tiles to provide a visual interface of key medical collection centers throughout Kerala.
* **Haversine Algorithmic Engine:** Uses the mathematical Haversine spherical formula to process user coordinate metrics via the HTML5 Geolocation API, computing distances instantly to pinpoint and snap the user to the nearest hospital camp.

### 🌓 3. Contextual UX Framework
* **Conditional Form Reflow:** Features a dynamic interactive layout that smoothly exposes or hides advanced tracking elements (like the date selection picker) based on categorical toggle fields, keeping inputs clean.

---

## 🛠️ System Architecture & Tech Stack
* **Frontend:** Semantic HTML5, Modular CSS3 Custom Properties, LeafletJS Engine, Native Geolocation API.
* **Backend Runtime:** Node.js with Express.js micro-framework.
* **Database Management Layer:** SQLite3 managed via `better-sqlite3` execution patterns for synchronous file-blocking performance.

---

## 📊 Database Schema Blueprint

The `donors` table structures data types optimized for health audits:

| Field Name | Storage Class | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique internal registry index |
| `name` | `TEXT` | `NOT NULL` | Unified string value (`firstName` + `lastName`) |
| `bloodType` | `TEXT` | `NOT NULL` | Evaluated grouping identifier ($A+$, $O-$, etc.) |
| `city` | `TEXT` | `DEFAULT "Unknown"` | Logged targeting center caught via Leaflet map |
| `phone` | `TEXT` | `NOT NULL` | Direct communication contact string |
| `age` | `INTEGER` | `NOT NULL` | Systemically calculated donor age metric |
| `weight` | `INTEGER` | `NOT NULL` | Quantified physical mass in kilograms |
| `lastDonationDate`| `TEXT` | `NULLABLE` | Standard ISO string representation of history |

---

## 🛠️ Setup and Installation

Follow these steps to launch the application stack locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your workspace environment.

### 2. Dependency Resolution
Clone the project repository, navigate into your development path, and trigger package initialization:
```bash
npm install