import React from 'react';
import { ChatMessage, MessageSender, TextContent, AudioContent, QuizContent, LiveTranscriptionContent, ImageContent } from '../types';
import AudioPlayer from './AudioPlayer';
import QuizDisplay from './QuizDisplay';
import ImageDisplay from './ImageDisplay';

interface MessageProps {
  message: ChatMessage;
  onShareMessage?: (content: string, email: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onShareMessage }) => {
  if (message.content.type === 'live-video-display') {
    return null;
  }

  const isUser = message.sender === MessageSender.User;
  const messageClass = isUser
    ? 'bg-blue-50 self-end border-blue-100 rounded-tr-none'
    : 'bg-white self-start border-gray-100 rounded-tl-none shadow-md';
  const avatar = isUser ? '🍎' : '🔮';
  const timestamp = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleShareClick = (contentToShare: string) => {
    const email = window.prompt("Enter the email address to share this message with:");
    if (email && onShareMessage) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      onShareMessage(contentToShare, email);
    }
  };

  const renderContent = (content: ChatMessage['content']) => {
    switch (content.type) {
      case 'text':
        const textContent = content as TextContent;
        const formattedText = textContent.value
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-900 font-bold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="text-gray-700 italic">$1</em>')
          .replace(/^- (.*)/gm, '<li class="ml-4 list-disc text-gray-800">$1</li>')
          .replace(/\n/g, '<br />');
        return <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedText }}></div>;
      case 'audio':
        const audioContent = content as AudioContent;
        return (
          <div className="flex flex-col items-start w-full gap-2">
            <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Audio Message</p>
            <AudioPlayer src={audioContent.src} transcript={audioContent.transcript} />
          </div>
        );
      case 'quiz':
        return <QuizDisplay questions={(content as QuizContent).questions} />;
      case 'live-transcription':
        const lt = content as LiveTranscriptionContent;
        return <p className={`text-sm ${lt.isFinal ? 'text-gray-800' : 'text-gray-400 italic'}`}>{lt.value}</p>;
      case 'image':
        const img = content as ImageContent;
        return <ImageDisplay src={img.src} alt={img.alt} isLoading={img.isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col gap-1 p-4 max-w-[90%] sm:max-w-[80%] rounded-2xl border ${messageClass} my-3 transition-all animate-clairvoyant-message`}>
      <div className="flex justify-between items-center mb-1">
        <span className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-tighter">
          <span className="text-lg">{avatar}</span>
          {isUser ? 'Applesauce' : 'The Clairvoyant'}
        </span>
        <span className="text-[10px] text-gray-400">{timestamp}</span>
      </div>
      
      {renderContent(message.content)}

      {message.sender === MessageSender.AI && message.content.type === 'text' && onShareMessage && (
        <button
          onClick={() => handleShareClick((message.content as TextContent).value)}
          className="mt-3 text-[10px] font-bold text-blue-400 hover:text-blue-600 uppercase self-end tracking-widest"
        >
          Share Note
        </button>
      )}
    </div>
  );
};

export default Message;