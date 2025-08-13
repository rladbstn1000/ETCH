import { useEffect, useMemo, useRef, useState } from "react";
import ChatMessageList from "../../organisms/chat/chatMessageList";
import ChatInputArea from "../../organisms/chat/chatInputArea";
import type { ChatMessageItemProps } from "../../atoms/listItem";
import { enterChatRoom, exitChatRoom, getChatMessages } from "../../../api/chat/chatApi";
import { createStompClient } from "../../../lib/chat/stompClient";
import useUserStore from "../../../store/userStore";

interface ChatRoomPageProps {
  roomId: string;
  roomName: string;
}

export default function ChatRoomPage({ roomId }: ChatRoomPageProps) {
  const { memberInfo } = useUserStore();
  const [messages, setMessages] = useState<ChatMessageItemProps[]>([]);
  const [ , setConnected] = useState(false);
  const clientRef = useRef<ReturnType<typeof createStompClient> | null>(null);

  const token = useMemo(() => localStorage.getItem("access_token") || "", []);

  useEffect(() => {
    let isUnmounted = false;
    async function connectFlow() {
      try {
        // 이전 메시지 내역 로딩
        try {
          const history = await getChatMessages(roomId);
          if (!isUnmounted) {
            const mapped: ChatMessageItemProps[] = (history.data || []).map((m: any) => ({
              id: String(m.id),
              message: m.message,
              sender: memberInfo && m.senderId === memberInfo.id ? "me" : "other",
              time: m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : "",
              senderName: m.senderNickname,
            }));
            setMessages(mapped);
          }
        } catch (e) {
          console.error("이전 메시지 로드 실패", e);
        }

        await enterChatRoom(roomId);
        if (isUnmounted) return;
        const client = createStompClient({
          token,
          roomId,
          enterSenderId: memberInfo?.id,
          enterSenderName: memberInfo?.nickname,
          onMessage: (msg) => {
            const data = JSON.parse(msg.body) as {
              type: "ENTER" | "TALK";
              roomId: string;
              senderId: number;
              sender: string;
              message: string;
            };

            setMessages((prev) => [
              ...prev,
              {
                id: `${Date.now()}-${prev.length}`,
                message: data.type === "ENTER" ? `${data.sender} 님이 입장했습니다.` : data.message,
                sender: memberInfo && data.senderId === memberInfo.id ? "me" : "other",
                time: new Date().toLocaleTimeString(),
                senderName: data.sender,
              },
            ]);
          },
          onConnected: () => setConnected(true),
          onError: () => setConnected(false),
        });

        clientRef.current = client;
        client.activate();
      } catch (e) {
        console.error("채팅 연결 실패", e);
      }
    }

    connectFlow();
    return () => {
      isUnmounted = true;
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      // 퇴장 처리
      exitChatRoom(roomId).catch(() => {});
    };
  }, [roomId, token, memberInfo]);

  const handleSendMessage = (message: string) => {
    if (!clientRef.current || !("publish" in clientRef.current)) return;
    const senderName = memberInfo?.nickname || "";
    const senderId = memberInfo?.id || 0;
    const body = JSON.stringify({
      type: "TALK",
      roomId,
      sender: senderName,
      message,
      senderId,
    });
    // @ts-ignore publish is available on underlying Client
    clientRef.current.publish({ destination: "/pub/chat/message", body });
  };

  const handleFileUpload = () => {};

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-2">
        <ChatMessageList messages={messages} />
      </div>
      <div className="border-t p-2">
        <ChatInputArea onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
}
