// api/role.api.ts
import axios from "@/api/axios";

// Fetch all roles API
export const fetchAllRolesAPI = (params?: any) => {
  const urlBackend = "/api/v1/roles/fetch-all";
  return axios.get<IBackendRes<any>>(urlBackend, { params });
};

// Create role API
export const createRoleAPI = (roleData: {
  name: string;
  description: string;
  active: boolean;
  permissionIds: number[];
}) => {
  const urlBackend = "/api/v1/roles/create";
  return axios.post<IBackendRes<any>>(urlBackend, roleData);
};

// Update role API
export const updateRoleAPI = (
  roleId: number,
  roleData: {
    name: string;
    description: string;
    active: boolean;
    permissionIds: number[];
  }
) => {
  const urlBackend = `/api/v1/roles/${roleId}`;
  return axios.put<IBackendRes<any>>(urlBackend, roleData);
};

// Delete role API
export const deleteRoleAPI = (roleId: number) => {
  const urlBackend = `/api/v1/roles/${roleId}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};
