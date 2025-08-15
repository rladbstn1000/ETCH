import TokenManager from "./tokenManager";

// 개발자 도구에서 토큰 상태 확인용 함수들
export const tokenDebug = {
  // 토큰 정보 출력
  showTokenInfo: () => {
    const token = TokenManager.getToken();
    const tokenInfo = TokenManager.getTokenInfo();
    
    console.group("🔐 Token Debug Info");
    console.log("Token exists:", !!token);
    console.log("Token (first 50 chars):", token?.substring(0, 50) + "...");
    console.log("Token info:", tokenInfo);
    
    if (tokenInfo) {
      const now = Date.now();
      const expirationTime = tokenInfo.issuedAt + tokenInfo.expiresIn;
      const remainingTime = expirationTime - now;
      const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
      
      console.log("Is expired:", TokenManager.isTokenExpired());
      console.log("Should refresh:", TokenManager.shouldRefreshToken());
      console.log("Remaining time:", `${remainingMinutes} minutes`);
      console.log("Expires at:", new Date(expirationTime).toLocaleString());
    }
    console.groupEnd();
  },

  // 강제로 토큰 갱신
  forceRefresh: async () => {
    console.log("🔄 Forcing token refresh...");
    const success = await TokenManager.refreshToken();
    console.log("Refresh result:", success ? "✅ Success" : "❌ Failed");
    tokenDebug.showTokenInfo();
  },

  // 토큰 상태 체크
  checkToken: async () => {
    console.log("🔍 Checking token...");
    const isValid = await TokenManager.checkAndRefreshToken();
    console.log("Token check result:", isValid ? "✅ Valid" : "❌ Invalid");
    tokenDebug.showTokenInfo();
  },

  // 토큰 제거 (테스트용)
  clearToken: () => {
    console.log("🗑️ Clearing token...");
    TokenManager.removeToken();
    tokenDebug.showTokenInfo();
  },

  // 만료된 토큰으로 시뮬레이션 (테스트용)
  simulateExpiredToken: () => {
    const token = TokenManager.getToken();
    if (token) {
      console.log("⏰ Simulating expired token...");
      // 1분 전 발급된 토큰으로 시뮬레이션 (30분 만료이므로 만료됨)
      TokenManager.setToken(token, -1); // -1분 = 이미 만료됨
      tokenDebug.showTokenInfo();
    }
  },
};

// 개발 환경에서만 global 객체에 추가
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as any).tokenDebug = tokenDebug;
  console.log("🔧 Token debug tools available at window.tokenDebug");
}