// api/post.api.ts
import axios from "@/api/axios";

// Fetch all posts API
export const fetchAllPostsAPI = (params?: any) => {
  const urlBackend = "/api/v1/posts/fetch-all";
  return axios.get<any>(urlBackend, { params });
};

// Delete post API
export const deletePostAPI = (postId: number) => {
  const urlBackend = `/api/v1/posts/${postId}`;
  return axios.delete<any>(urlBackend);
};

// Create post API (with file upload)
export const createPostAPI = (data: {
  content: string;
  userId: number;
  file?: File;
}) => {
  const formData = new FormData();
  formData.append("content", data.content);
  formData.append("userId", String(data.userId));
  if (data.file) formData.append("file", data.file);
  return axios.post<any>("/api/v1/posts/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
