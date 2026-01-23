

# Wealth Management Blueprint

### Team 2 – Backend & Full Stack Implementation

This repository contains the **Wealth Management Blueprint** project developed as part of an **internship assignment**.
The project focuses on building a **full-stack wealth management platform** with a scalable backend and a modern frontend.

Branch: **Keerthana-Team2-Backend**

---

## 📌 Project Overview

The Wealth Management Blueprint is designed to help users manage their financial activities including:

* Portfolio tracking
* Investments & transactions
* Goals and simulations
* Reports and analytics
* Authentication & role-based access

The project follows **industry-standard backend architecture** and a **component-based frontend design**.

---

## 🏗️ Project Structure

```
wealth tracker/
├── docs/
│   └── market_sync.md
│
├── fastapi_backend/
│   ├── main.py
│   ├── database.py
│   ├── auth.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   ├── migrations/
│   ├── static/
│   ├── uploads/
│   ├── requirements.txt
│   └── alembic.ini
│
├── wealth_frontend/
│   ├── src/
│   ├── public/
│   ├── components.json
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
└── uploads/
```

---

## ⚙️ Tech Stack

### Backend

* **FastAPI**
* **PostgreSQL**
* **SQLAlchemy**
* **Alembic (Migrations)**
* **JWT Authentication**
* **Celery (Background Tasks)**

### Frontend

* **React + TypeScript**
* **Vite**
* **Tailwind CSS**
* **shadcn/ui**
* **Axios**

---

## 🔐 Key Features

* User authentication & authorization
* Portfolio & transaction management
* Investment recommendations
* Financial reports (PDF generation)
* Market data handling
* Admin dashboard
* Modular & scalable architecture

---

## 🚀 Setup Instructions

### Backend Setup

```bash
cd wealth tracker/fastapi_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd wealth tracker/wealth_frontend
npm install
npm run dev
```

---

## 📊 Database

* PostgreSQL
* Migrations handled using **Alembic**
* Schema designed for scalability and clarity

---

## 🧪 Development Notes

* Environment variables are documented in `.env.example`
* API routes are modularized using FastAPI routers
* Frontend follows reusable component patterns
* Clean separation between backend and frontend logic

---

## 👨‍💻 Internship Contribution

**Contributor:**
**Keerthana Sarvani Sathuluri**

**Branch:**
`Keerthana-Team2-Backend`

This branch contains the **backend implementation along with frontend integration**, developed as part of internship learning and evaluation.
.
