// frontend/src/services/api.ts

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ================================
   TYPES
================================ */

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface Goal {
  _id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  priority?: string;
  createdAt?: string;
}

/* ================================
   TOKEN MANAGEMENT
================================ */

export const getToken = () => localStorage.getItem("token");

export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const clearToken = () => {
  localStorage.removeItem("token");
};

/* ================================
   GENERIC API FETCH
================================ */

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data?.message || "Request failed",
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error) {
    return {
      error: "Network error",
      status: 0,
    };
  }
}

/* ================================
   AUTH API
================================ */

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
  }) =>
    apiFetch<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* ================================
   USER API (PROTECTED)
================================ */

export const usersApi = {
  getProfile: () => apiFetch<User>("/users/profile"),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/* ================================
   GOALS API (PROTECTED)
================================ */

export const goalsApi = {
  getAll: () => apiFetch<Goal[]>("/goals"),

  create: (data: Partial<Goal>) =>
    apiFetch<Goal>("/goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Goal>) =>
    apiFetch<Goal>(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/goals/${id}`, {
      method: "DELETE",
    }),
};
