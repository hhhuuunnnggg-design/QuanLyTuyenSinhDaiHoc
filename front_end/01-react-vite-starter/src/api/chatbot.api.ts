// api/chatbot.api.ts
import axios from "@/api/axios";

// Gửi tin nhắn và nhận phản hồi từ bot
export const sendChatbotMessageAPI = (userId: number, message: string) => {
  return axios.post("/api/v1/chatbot/send-message", { userId, message });
};

// Lấy lịch sử chat của user
export const fetchChatbotHistoryAPI = (userId: number) => {
  return axios.get(`/api/v1/chatbot/history/${userId}`);
};
