import axios from 'axios';
import type { ChatRoom, ChatMessage, DirectChatRequest } from '../types/chat';

// 채팅 전용 axios 인스턴스 (별도의 base URL 사용)
const chatInstance = axios.create({
  baseURL: 'https://etch.it.kr/api/chat',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 채팅 인스턴스에 요청 인터셉터 추가 (토큰 자동 추가)
chatInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 채팅방 관리 API - 운영 환경 (nginx 프록시 대응)
export const chatApi = {
  // 모든 채팅방 목록 조회: GET /api/chat/chat/rooms
  getRooms: async (): Promise<ChatRoom[]> => {
    const response = await chatInstance.get('/chat/rooms');
    return response.data;
  },

  // 1:1 채팅방 생성: POST /api/chat/chat/direct
  createDirectChat: async (request: DirectChatRequest): Promise<ChatRoom> => {
    const response = await chatInstance.post('/chat/direct', request);
    return response.data;
  },

  // 그룹 채팅방 생성: POST /api/chat/chat/room
  createGroupRoom: async (roomName: string): Promise<ChatRoom> => {
    const response = await chatInstance.post(`/chat/room?name=${encodeURIComponent(roomName)}`);
    return response.data;
  },

  // 특정 채팅방 정보 조회: GET /api/chat/chat/room/{roomId}
  getRoom: async (roomId: string): Promise<ChatRoom> => {
    const response = await chatInstance.get(`/chat/room/${roomId}`);
    return response.data;
  },

  // 채팅방 메시지 내역 조회: GET /api/chat/chat/room/{roomId}/messages
  getRoomMessages: async (roomId: string): Promise<ChatMessage[]> => {
    const response = await chatInstance.get(`/chat/room/${roomId}/messages`);
    return response.data;
  },

  // 채팅방 입장: POST /api/chat/chat/room/{roomId}/enter
  enterRoom: async (roomId: string): Promise<void> => {
    await chatInstance.post(`/chat/room/${roomId}/enter`);
  },

  // 🆕 채팅방 임시 나가기: POST /api/chat/chat/room/{roomId}/leave-temporarily
  // ESC 키로 채팅방 목록으로 돌아갈 때 사용
  temporarilyLeaveRoom: async (roomId: string): Promise<void> => {
    await chatInstance.post(`/chat/room/${roomId}/leave-temporarily`);
  },

  // 📝 기존 exitRoom은 완전 나가기로 유지
  // 채팅방을 아예 나가고 싶을 때 사용 (채팅방 설정에서 "나가기" 버튼 등)
  exitRoom: async (roomId: string): Promise<void> => {
    await chatInstance.post(`/chat/room/${roomId}/exit`);
  },

  // 메시지 읽음 처리: POST /api/chat/chat/room/{roomId}/read
  markAsRead: async (roomId: string): Promise<void> => {
    await chatInstance.post(`/chat/room/${roomId}/read`);
  },

  // 안 읽은 메시지 수 조회: GET /api/chat/chat/rooms/unread-counts
  getUnreadCounts: async () => {
    const response = await chatInstance.get('/chat/rooms/unread-counts');
    return response.data;
  }
};
