// api/axios.ts
import axios from "axios";

// Tạo instance axios
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // ⚡ Bắt buộc để gửi cookie refresh_token
});

// =========================
// Request Interceptor
// =========================
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// =========================
// Response Interceptor
// =========================
instance.interceptors.response.use(
  function (response) {
    return response.data; // Trả về response.data
  },
  async function (error) {
    console.log("error lỗi lần 1", error);
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("gọi API refresh token");
        // Gọi API refresh token
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/refresh`,
          {
            withCredentials: true, // ⚡ Gửi cookie refresh_token
          }
        );

        console.log("refreshResponse: ", refreshResponse);

        // Lấy access token mới từ response
        const newAccessToken = refreshResponse.data.data.access_token;
        console.log("newAccessToken: ", newAccessToken);

        if (newAccessToken) {
          // Lưu token mới vào localStorage
          localStorage.setItem("access_token", newAccessToken);

          // Gắn lại token mới vào header của request cũ
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // Retry request cũ
          return instance(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);

        // Nếu refresh token thất bại → logout
        localStorage.removeItem("access_token");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    // Trả về lỗi nếu không phải 401
    if (error && error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default instance;
