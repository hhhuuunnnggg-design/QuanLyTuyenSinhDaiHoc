// api/permission.api.ts
import axios from "@/api/axios";

// Create permission API
export const createPermissionAPI = (permissionData: {
  name: string;
  apiPath: string;
  method: string;
  module: string;
}) => {
  const urlBackend = "/api/v1/permissions/create";
  return axios.post<IBackendRes<any>>(urlBackend, permissionData);
};

// Update permission API
export const updatePermissionAPI = (
  permissionId: number,
  permissionData: {
    name: string;
    apiPath: string;
    method: string;
    module: string;
  }
) => {
  const urlBackend = `/api/v1/permissions/${permissionId}`;
  return axios.put<IBackendRes<any>>(urlBackend, permissionData);
};

// Delete permission API
export const deletePermissionAPI = (permissionId: number) => {
  const urlBackend = `/api/v1/permissions/${permissionId}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

// Fetch all permissions API
export const fetchAllPermissionsAPI = (params?: any) => {
  const urlBackend = "/api/v1/permissions/fetch-all";
  return axios.get<IBackendRes<any>>(urlBackend, { params });
};

// Fetch all methods (alias for fetchAllPermissionsAPI)
export const fetchAllMethod = () => {
  const urlBackend = "/api/v1/permissions/fetch-all";
  return axios.get<IBackendRes<any>>(urlBackend);
};
