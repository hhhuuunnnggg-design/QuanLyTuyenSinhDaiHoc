// api/user.api.ts
import axios from "@/api/axios";

// Create user API
export const createUserAPI = (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
}) => {
  const urlBackend = "/api/v1/users/add-user";
  return axios.post<IBackendRes<any>>(urlBackend, userData);
};

// Update user API
export const updateUserAPI = (
  userId: number,
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
  }
) => {
  const urlBackend = `/api/v1/users/${userId}`;
  return axios.put<IBackendRes<any>>(urlBackend, userData);
};

// Delete user API
export const deleteUserAPI = (userId: number) => {
  const urlBackend = `/api/v1/users/${userId}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

// Change user activity (block/unblock) API
export const changeUserActivityAPI = (userId: number) => {
  const urlBackend = `/api/v1/users/changeActivity/${userId}`;
  return axios.put<IBackendRes<any>>(urlBackend);
};

// Admin create user API
export const adminCreateUserAPI = (userData: {
  email: string;
  password: string;
  roleId?: number;
}) => {
  const urlBackend = "/api/v1/users/admin/create";
  return axios.post<IBackendRes<any>>(urlBackend, userData);
};

// Admin update user API
export const adminUpdateUserAPI = (
  userId: number,
  userData: {
    email: string;
    password?: string;
    roleId?: number;
  }
) => {
  const urlBackend = `/api/v1/users/admin/${userId}`;
  return axios.put<IBackendRes<any>>(urlBackend, userData);
};
