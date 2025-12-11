import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Only initialize Firebase when real environment variables are provided.
// Add your Firebase config to a `.env` file at the project root with keys
// prefixed by `VITE_` (example below). Do NOT commit `.env` to version control.
//
// Example `.env`:
// VITE_FIREBASE_API_KEY=your_api_key_here
// VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
// VITE_FIREBASE_PROJECT_ID=your_project_id_here
// VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
// VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
// VITE_FIREBASE_APP_ID=your_app_id_here

let app;
let auth;

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
if (apiKey) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // console.log('Firebase initialized')
  } catch (error) {
    console.warn("Firebase initialization warning:", error.message);
  }
} else {
  console.info("Firebase not initialized: VITE_FIREBASE_API_KEY not set.");
}

export { auth, app };
