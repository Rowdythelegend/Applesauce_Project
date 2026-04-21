import React, { useState, useRef, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isLiveSessionActive: boolean;
  onStartLiveChat: () => Promise<void>;
  onStopLiveChat: () => void;
  isCameraActive: boolean;
  onToggleCamera: () => Promise<void>;
  isMicActive: boolean;
  onShowProgress: () => void;
  onExportNotes: () => void;
  isRecordingVoiceMessage: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  recordedAudioUrl: string | null;
  sendRecordedVoiceMessage: () => Promise<void>;
  clearRecordedAudio: () => void;
  onUploadAudio: (file: File) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  isLiveSessionActive,
  onStartLiveChat,
  onStopLiveChat,
  isCameraActive,
  onToggleCamera,
  isMicActive,
  onShowProgress,
  onExportNotes,
  isRecordingVoiceMessage,
  startRecording,
  stopRecording,
  recordedAudioUrl,
  sendRecordedVoiceMessage,
  clearRecordedAudio,
  onUploadAudio,
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (trimmedText && !isLoading) {
      onSendMessage(trimmedText);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAudio(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  let inputPlaceholder = 'Ask The Clairvoyant...';
  if (isLoading && !isLiveSessionActive && !isRecordingVoiceMessage) {
    inputPlaceholder = 'The Clairvoyant is peering into the future...';
  } else if (isLiveSessionActive) {
    inputPlaceholder = 'Listening...';
  } else if (isRecordingVoiceMessage) {
    inputPlaceholder = 'Recording...';
  }

  return (
    <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
      {/* Genius Quick-Actions */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => onSendMessage("Tell me about the million-dollar pilot program! Who is The Clairvoyant and what is BambanaTech?")}
          className="whitespace-nowrap px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-wider hover:bg-purple-100 transition-all"
        >
          🔮 World-Class Pilot Info
        </button>

        <button 
          onClick={() => onSendMessage("Can we do a fun Multiplication Tables quiz?")}
          className="whitespace-nowrap px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all"
        >
          🔢 Math Tables Quiz
        </button>
        <button 
          onClick={() => onSendMessage("Teach me a new Scientific Word and how to use it!")}
          className="whitespace-nowrap px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-600 text-[10px] font-black uppercase tracking-wider hover:bg-green-100 transition-all"
        >
          🔬 Science Vocab
        </button>
        <button 
          onClick={() => onSendMessage("Let's look at my Cambridge English resources together.")}
          className="whitespace-nowrap px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 transition-all"
        >
          🎓 Cambridge Review
        </button>
        <button 
          onClick={() => onSendMessage("Tell me a story in Ndebele to help me learn!")}
          className="whitespace-nowrap px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider hover:bg-orange-100 transition-all"
        >
          🇿🇼 Ndebele Story
        </button>
      </div>

      {recordedAudioUrl && (
        <div className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100 animate-clairvoyant-message">
          <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Review Your Voice Note</p>
          <AudioPlayer src={recordedAudioUrl} />
          <div className="flex gap-2 mt-1">
            <button
              onClick={sendRecordedVoiceMessage}
              disabled={isLoading}
              className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-bold shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-all"
            >
              Send Note
            </button>
            <button
              onClick={clearRecordedAudio}
              disabled={isLoading}
              className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-300 disabled:opacity-50 transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 shadow-sm focus-within:border-purple-300 focus-within:ring-1 focus-within:ring-purple-300 transition-all">
        <textarea
          ref={textareaRef}
          className="flex-1 p-2 bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-400 text-sm leading-relaxed"
          placeholder={inputPlaceholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={isLoading || isLiveSessionActive || isRecordingVoiceMessage || !!recordedAudioUrl}
          aria-label="Chat input"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || inputText.trim() === '' || isLiveSessionActive || isRecordingVoiceMessage || !!recordedAudioUrl}
          className="p-2 rounded-xl bg-purple-600 text-white disabled:bg-gray-300 hover:bg-purple-700 transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <button
          onClick={isLiveSessionActive ? onStopLiveChat : onStartLiveChat}
          disabled={isLoading || isRecordingVoiceMessage}
          className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            isLiveSessionActive 
            ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
            : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50'
          }`}
        >
          {isLiveSessionActive ? 'Stop Live' : 'Live Chat'}
        </button>

        <button
          onClick={isRecordingVoiceMessage ? stopRecording : startRecording}
          disabled={isLoading || isLiveSessionActive}
          className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            isRecordingVoiceMessage 
            ? 'bg-red-50 border-red-200 text-red-600' 
            : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          {isRecordingVoiceMessage ? 'Stop Rec' : 'Record'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isLiveSessionActive || isRecordingVoiceMessage}
          className="flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-bold bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />

        <button
          onClick={onToggleCamera}
          className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            isCameraActive ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isCameraActive ? 'Cam On' : 'Cam Off'}
        </button>
      </div>

      <div className="flex gap-2 justify-between items-center mt-1 pt-2 border-t border-gray-50">
        <button onClick={onShowProgress} className="text-[10px] font-bold text-purple-500 uppercase tracking-widest hover:text-purple-700 transition-colors">
          View Progress
        </button>
        <button onClick={onExportNotes} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-700 transition-colors">
          Export Notes
        </button>
      </div>
    </div>
  );
};

export default MessageInput;