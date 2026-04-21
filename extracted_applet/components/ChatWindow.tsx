import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  onShareMessage: (content: string, email: string) => void; // New prop
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onShareMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto flex flex-col items-stretch bg-gray-50 scroll-smooth">
      {messages.map((message) => (
        <Message key={message.id} message={message} onShareMessage={onShareMessage} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;