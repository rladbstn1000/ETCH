import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface StompConnectOptions {
  token: string;
  roomId: string;
  onMessage: (message: IMessage) => void;
  onConnected?: () => void;
  onError?: (error: unknown) => void;
  enterSenderId?: number;
  enterSenderName?: string;
}

export function createStompClient({ token, roomId, onMessage, onConnected, onError, enterSenderId, enterSenderName }: StompConnectOptions) {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8083/ws-stomp"),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      client.subscribe(`/sub/chat/room/${roomId}`, onMessage);
      if (enterSenderId && enterSenderName) {
        client.publish({
          destination: "/pub/chat/message",
          body: JSON.stringify({
            type: "ENTER",
            roomId,
            senderId: enterSenderId,
            sender: enterSenderName,
            message: "",
          }),
        });
      }
      onConnected?.();
    },
    onStompError: () => {
      onError?.(new Error("STOMP error"));
    },
  });

  return client;
}


