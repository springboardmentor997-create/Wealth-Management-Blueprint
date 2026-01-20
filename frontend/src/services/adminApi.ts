/* ================================
   ADMIN API (FETCH VERSION)
================================ */

const BASE_URL = "http://localhost:5000/api/admin";

/* ================================
   TYPES
================================ */
export interface AdminStats {
  totalUsers: number;
  totalGoals: number;
  activePortfolios: number;
}

/* ================================
   API METHODS
================================ */
export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) {
      throw new Error("Failed to fetch admin stats");
    }
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }
    return res.json();
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete user");
    }
    return res.json();
  },
};
