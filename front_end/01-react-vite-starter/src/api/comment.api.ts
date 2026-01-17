// api/comment.api.ts
import axios from "@/api/axios";

// Lấy comment theo postId
export const fetchCommentsByPostAPI = (postId: number) => {
  return axios.get(`/api/v1/comments`, { params: { postId } });
};

// Gửi comment mới
export const createCommentAPI = (
  postId: number,
  userId: number,
  content: string
) => {
  return axios.post(`/api/v1/comments/create`, null, {
    params: { postId, userId, content },
  });
};
