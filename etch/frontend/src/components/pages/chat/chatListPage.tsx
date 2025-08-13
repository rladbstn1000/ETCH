import { useEffect, useMemo, useState } from "react";
import ChatRoomList from "../../organisms/chat/chatRoomList";
import { mockChatRooms } from "../../../types/mock/mockChatRoomData";
import { getAllChatRooms } from "../../../api/chat/chatApi";
import useUserStore from "../../../store/userStore";
import type { ChatRoomItemProps } from "../../atoms/listItem";

interface ChatListPageProps {
  onRoomSelect?: (roomId: string, roomName: string) => void;
}

function ChatListPage({ onRoomSelect }: ChatListPageProps) {
  const { isLoggedIn } = useUserStore();
  const [rooms, setRooms] = useState<ChatRoomItemProps[]>([]);

  useEffect(() => {
    let mounted = true;
    async function fetchRooms() {
      if (!isLoggedIn) {
        // 비로그인: 지정된 예시 방만 노출
        setRooms([
          {
            id: "a86c56d8-cc0b-429c-9321-f66af42e7101",
            name: "Sample Room",
            lastMessage: "예시 방입니다",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        try {
          // 로그인 사용자는 전체 방 목록에서 본인 방만 필터링해야 하지만,
          // 현재 명세에 참여자 기반 목록 API가 없으므로 일단 전체 방을 보여줌
          const res = await getAllChatRooms();
          if (!mounted) return;
          const list: ChatRoomItemProps[] = (res.data || []).map((r: any) => ({
            id: r.roomId,
            name: r.roomName ?? r.roomId,
            lastMessage: "",
            time: "",
          }));
          setRooms(list);
        } catch (e) {
          console.error("채팅방 목록 로드 실패", e);
          setRooms([]);
        }
      }
    }
    fetchRooms();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);
  const handleRoomClick = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (onRoomSelect && room) {
      onRoomSelect(roomId, room.name);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {rooms.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          진행 중인 채팅이 없습니다.
        </div>
      ) : (
        <ChatRoomList chatRooms={rooms} onRoomClick={handleRoomClick} />
      )}
    </div>
  );
}
export default ChatListPage;
