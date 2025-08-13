import { useState } from "react";
import ChatListPage from "../pages/chat/chatListPage";
import ChatRoomPage from "../pages/chat/chatRoomPage";
import ChatListHeader from "../molecules/modal/chatListHeader";
import ChatRoomHeader from "../molecules/modal/chatRoomHeader";

interface ChatModalContainerProps {
  onClose: () => void;
}

export default function ChatModalContainer({ onClose }: ChatModalContainerProps) {
  const [modalState, setModalState] = useState<'list' | 'room'>('list');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>('');

  const handleRoomSelect = (roomId: string, roomName: string) => {
    setSelectedRoomId(roomId);
    setSelectedRoomName(roomName);
    setModalState('room');
  };

  const handleBackToList = () => {
    setModalState('list');
    setSelectedRoomId(null);
    setSelectedRoomName('');
  };

  return (
    <div className="h-full flex flex-col">
      {modalState === 'list' && (
        <>
          <ChatListHeader onClose={onClose} />
          <div className="flex-1 overflow-hidden">
            <ChatListPage onRoomSelect={handleRoomSelect} />
          </div>
        </>
      )}
      
      {modalState === 'room' && selectedRoomId && (
        <>
          <ChatRoomHeader 
            roomName={selectedRoomName} 
            onBack={handleBackToList} 
          />
          <div className="flex-1 overflow-hidden">
            <ChatRoomPage roomId={selectedRoomId} roomName={selectedRoomName} />
          </div>
        </>
      )}
    </div>
  );
}