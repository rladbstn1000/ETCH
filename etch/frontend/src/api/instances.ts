import axios from "axios";
import { BASE_API } from "./BASE_API";
import useUserStore from "../store/userStore"; // useUserStore import

// 인증이 필요 없는 경우를 위한 기본 인스턴스
export const defaultInstance = axios.create({
  baseURL: BASE_API,
  withCredentials: true, // 쿠키를 포함한 요청을 허용
  headers: {
    "Content-Type": "application/json",
  },
});

// 인증이 필요한 경우를 위한 인스턴스
export const authInstance = axios.create({
  baseURL: BASE_API,
  withCredentials: true, // 쿠키를 포함한 요청을 허용
  headers: {
    "Content-Type": "application/json",
  },
});

// authInstance에만 요청 인터셉터를 추가합니다.
authInstance.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("access_token");
    const token = stored?.startsWith("Bearer ") ? stored.slice(7) : stored || "";
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// authInstance에 응답 인터셉터를 추가합니다.
authInstance.interceptors.response.use(
  // 1. 성공적인 응답은 그대로 반환
  (response) => {
    return response;
  },
  // 2. 에러가 발생한 응답을 처리
  async (error) => {
    const originalRequest = error.config;
    console.log("API 요청 실패:", error);
    console.log("원래 요청 정보:", originalRequest);
    // 401 에러이고, 재시도한 요청이 아닐 경우에만 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정 (무한 루프 방지)
      console.log("토큰 갱신 시도 중...");
      try {
        // '/auth/reissue' API 호출 (defaultInstance 사용)
        // Refresh Token은 쿠키로 자동 전송되므로, 요청 본문은 비워둡니다.
        const reissueResponse = await defaultInstance.post("/auth/reissue", {});
        console.log("토큰 갱신 성공:", reissueResponse);
        // 응답 헤더에서 새로운 Access Token 추출 (Axios는 헤더 이름을 소문자로 정규화합니다.)
        const newAccessToken = reissueResponse.headers["authorization"];
        console.log("새로운 Access Token:", newAccessToken);
        if (!newAccessToken) {
          throw new Error("새로운 Access Token이 갱신 응답 헤더에 없습니다.");
        }

        // 새로운 Access Token을 localStorage에 저장
        localStorage.setItem("access_token", newAccessToken);

        // 원래 실패했던 요청의 헤더에 새로운 토큰을 설정
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // 원래 요청을 다시 시도
        return authInstance(originalRequest);
      } catch (refreshError) {
        console.error("토큰 갱신 실패:", refreshError);
        // 리프레시 토큰 만료 또는 재발급 실패 시 로그아웃 처리
        useUserStore.getState().logout(); // Zustand의 logout 함수 호출
        window.location.href = "/login"; // 로그인 페이지로 리다이렉트
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
