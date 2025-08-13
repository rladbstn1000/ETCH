import { chatAuthInstance } from "./chatInstances";

export async function enterChatRoom(roomId: string) {
  return chatAuthInstance.post(`/chat/room/${roomId}/enter`, {});
}

export async function exitChatRoom(roomId: string) {
  return chatAuthInstance.post(`/chat/room/${roomId}/exit`, {});
}

export async function getAllChatRooms() {
  return chatAuthInstance.get(`/chat/rooms`);
}

export async function getChatRoom(roomId: string) {
  return chatAuthInstance.get(`/chat/room/${roomId}`);
}

export async function getChatMessages(roomId: string) {
  return chatAuthInstance.get(`/chat/room/${roomId}/messages`);
}


