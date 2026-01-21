# Wealth Management & Goal Tracker - Frontend

React frontend application for the Wealth Management & Goal Tracker system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create a `.env` file:
```bash
VITE_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Features

- 🔐 JWT Authentication (Login/Register)
- 👤 User Profile Management
- 🎯 Goals Management (CRUD operations)
- 💼 Portfolio Management
- 📊 Dashboard with statistics
- 🎨 Modern UI with Tailwind CSS
- 🔒 Protected Routes

## Project Structure

```
src/
├── components/     # Reusable components
│   ├── Layout.jsx
│   └── ProtectedRoute.jsx
├── contexts/       # React contexts
│   └── AuthContext.jsx
├── pages/          # Page components
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   ├── Goals.jsx
│   └── Portfolio.jsx
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Technologies

- React 18
- React Router 6
- Tailwind CSS 3
- Axios for API calls
- Vite for build tooling

