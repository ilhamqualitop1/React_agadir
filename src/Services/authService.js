import axiosInstance from "../utils/axios";

// ==============================
// 🔹 Authentification / OTP
// ==============================
export const login = async ({ email, password }) => {
  const response = await axiosInstance.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const verifyOTP = async ({ email, otp }) => {
  const response = await axiosInstance.post("/auth/verify-otp", { email, otp });
  return response.data;
};

// ==============================
// 🔹 Utilisateurs (CRUD admin)
// ==============================
export const getAllUsers = async () => {
  const response = await axiosInstance.get("/admin/users");
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosInstance.post("/admin/users", userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/admin/users/${id}`);
  return response.data;
};
