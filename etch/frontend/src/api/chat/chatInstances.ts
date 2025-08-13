import axios from "axios";

// 채팅 서버 전용 Axios 인스턴스
export const chatAuthInstance = axios.create({
  baseURL: "http://localhost:8083",
  headers: {
    "Content-Type": "application/json",
  },
});

chatAuthInstance.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("access_token");
    const token = stored?.startsWith("Bearer ") ? stored.slice(7) : stored || "";
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


