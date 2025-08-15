import { Outlet, useLocation } from "react-router";
import { useEffect, useState, useRef } from "react";
import Footer from "../components/common/footer";
import Header from "../components/common/header";
import ChatButton from "../components/molecules/chat/chatButton";
import ChatModalContainer from "../components/common/chatModalContainer";
import { ModalProvider, useModalContext } from "../contexts/modalContext";
import useUserStore from "../store/userStore";
import { getMemberInfo } from "../api/authApi";
import { useTokenRefresh } from "../hooks/useTokenRefresh";
import TokenManager from "../utils/tokenManager";
import "../utils/tokenDebug"; // 디버깅 도구 로드

function LayoutContent() {
  const { pathname } = useLocation();
  const { showChatModal, openChatModal, closeChatModal } = useModalContext();
  const [isInitializing, setIsInitializing] = useState(true);
  const chatModalRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, setMemberInfo } = useUserStore();

  // 토큰 자동 갱신 훅 사용 (초기화 완료 후에만 동작)
  useTokenRefresh(!isInitializing);

  // 앱 시작시 토큰 검증 및 로그인 상태 복원 + 토큰 갱신
  useEffect(() => {
    const restoreLoginState = async () => {
      const token = TokenManager.getToken();

      // 토큰은 있는데 로그인 상태가 아닌 경우
      if (token && !isLoggedIn) {
        try {
          console.log("토큰 발견, 사용자 정보 복원 시도...");

          // 새로고침 시 토큰 갱신 시도
          console.log("새로고침 시 토큰 갱신 시도...");
          const refreshSuccess = await TokenManager.refreshToken();

          if (refreshSuccess) {
            console.log("새로고침 시 토큰 갱신 성공");
          } else {
            console.log("새로고침 시 토큰 갱신 실패, 기존 토큰 사용");
          }

          // 토큰 갱신 성공/실패와 관계없이 사용자 정보 복원 시도
          const userInfo = await getMemberInfo();
          setMemberInfo(userInfo);
          console.log("로그인 상태 복원 성공:", userInfo.nickname);
        } catch (error) {
          console.log("토큰 무효, 삭제:", error);
          TokenManager.removeToken();
        }
      }

      setIsInitializing(false);
    };

    restoreLoginState();
  }, []); // 앱 시작시 한 번만

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  // 채팅 버튼 클릭 핸들러 - 토글 기능
  const handleChatButtonClick = () => {
    if (showChatModal) {
      closeChatModal();
    } else {
      openChatModal();
    }
  };

  // 모달 외부 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (
      chatModalRef.current &&
      !chatModalRef.current.contains(e.target as Node)
    ) {
      closeChatModal();
    }
  };

  // 초기화 중일 때 로딩 화면
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">앱을 초기화하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 - 데스크톱에서만 고정 */}
      <div className="bg-white md:fixed md:top-0 md:left-0 md:right-0 md:z-50 md:shadow-sm">
        <div className="px-6 py-3 mx-auto max-w-screen-2xl sm:px-8 lg:px-12 xl:px-16">
          <Header />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="md:pt-16">
        {/* 모바일/태블릿에서는 pt-0, 데스크톱에서만 pt-16 */}
        <div className="px-6 py-2 mx-auto bg-gray-50 max-w-screen-2xl sm:px-8 lg:px-12 xl:px-16">
          <main className="pt-2 pb-8">
            <Outlet />
          </main>
          <ChatButton onClick={handleChatButtonClick} />
        </div>
      </div>

      {/* 푸터 - 화면 가로 꽉차게 */}
      <Footer />

      {/* 채팅 모달 오버레이 */}
      {showChatModal && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-end p-4"
          onClick={handleOverlayClick}
        >
          <div
            ref={chatModalRef}
            className="border border-gray-400 shadow-lg w-80 h-[500px] rounded-lg overflow-hidden bg-white mb-24 mr-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatModalContainer onClose={closeChatModal} />
          </div>
        </div>
      )}
    </div>
  );
}

function Layout() {
  return (
    <ModalProvider>
      <LayoutContent />
    </ModalProvider>
  );
}

export default Layout;
