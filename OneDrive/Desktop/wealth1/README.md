# Wealth App

A React application (Wealth App) with Tailwind CSS styling and Firebase backend for user authentication.

## Project Structure

```
wealth-app/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── firebase.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   └── Navbar.jsx
│   └── pages/
│       ├── Login.jsx
│       ├── Register.jsx
│       └── Home.jsx
├── index.html
├── package.json
├── tailwind.config.cjs
├── postcss.config.cjs
├── .gitignore
└── .env
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Running the Project

```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Features

- User authentication with Firebase
- Login and registration pages
- Protected routes using `AuthContext.jsx`
- Responsive design with Tailwind CSS
- Navigation bar component

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Firebase
- PostCSS & Autoprefixer

## License

MIT
