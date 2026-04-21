
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChatMessage,
  MessageSender,
  TextContent,
  AudioContent,
  QuizContent,
  QuizQuestion,
  LiveTranscriptionContent,
  MessageContent,
  LearningProgress,
  ImageContent
} from './types';
import { 
  sendChatMessage, 
  generateAudio, 
  generateImage, 
  sendEmail, 
  ensureApiKeyAndInstantiateGoogleGenAI, 
  generateCaptionForImage, 
  transcribeAudio 
} from './services/geminiService';
import {
  GEMINI_LIVE_MODEL,
  LIVE_API_SPEECH_VOICE_NAME,
  TUTOR_SYSTEM_INSTRUCTION,
} from './constants';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import LiveVideoDisplay from './components/LiveVideoDisplay';
import LearningProgressDisplay from './components/LearningProgressDisplay';
import { decode, decodeAudioData, createBlob } from './utils/audioUtils';
import { LiveSession, Modality } from '@google/genai';

function App() {
  const messageIdCounter = useRef(Date.now());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [learningProgress, setLearningProgress] = useState<LearningProgress>({ topicsCovered: [] });
  const [showProgressModal, setShowProgressModal] = useState(false);
  
  const [isRecordingVoiceMessage, setIsRecordingVoiceMessage] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const liveSessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const localVideoStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const playingSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const isTheClairvoyantSpeakingRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('applesauceChatHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) { 
        setMessages([{ id: 'init', sender: MessageSender.AI, timestamp: new Date(), content: { type: 'text', value: "Hello Kristel! Ready for an adventure in Grade 5?" } }]);
      }
    } else {
      setMessages([{ id: 'init', sender: MessageSender.AI, timestamp: new Date(), content: { type: 'text', value: "Hello Kristel! I'm The Clairvoyant! What shall we discover today at Dominican Convent Primary? Grade 5 is going to be amazing!" } }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('applesauceChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const updateMessageContentInState = useCallback((id: string, newContent: MessageContent) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: newContent, timestamp: new Date() } : msg
      )
    );
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    const newUserMsg: ChatMessage = {
      id: `user-${messageIdCounter.current++}`,
      sender: MessageSender.User,
      timestamp: new Date(),
      content: { type: 'text', value: text },
    };
    setMessages(prev => [...prev, newUserMsg]);

    // Handle Image Generation Shortcut
    const imageMatch = text.match(/^(create|generate|show me) (an\s)?image of (.*)/i);
    if (imageMatch) {
      const prompt = imageMatch[3].trim();
      const imgMsgId = `ai-img-${messageIdCounter.current++}`;
      setMessages(prev => [...prev, { id: imgMsgId, sender: MessageSender.AI, timestamp: new Date(), content: { type: 'image', alt: prompt, isLoading: true } }]);
      try {
        const url = await generateImage(prompt);
        const caption = await generateCaptionForImage(prompt);
        updateMessageContentInState(imgMsgId, { type: 'image', src: url, alt: caption, isLoading: false });
      } catch (e) {
        updateMessageContentInState(imgMsgId, { type: 'text', value: "Oops! My magical ink ran out. Let's try another image!" });
      } finally { setIsLoading(false); }
      return;
    }

    try {
      const responseText = await sendChatMessage(text, [...messages, newUserMsg]);
      const aiMsgId = `ai-${messageIdCounter.current++}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: MessageSender.AI,
        timestamp: new Date(),
        content: { type: 'text', value: responseText },
      };
      setMessages(prev => [...prev, aiMsg]);
      setLearningProgress(p => ({ ...p, topicsCovered: Array.from(new Set([...p.topicsCovered, text.slice(0, 30)])) }));

      // Auto-generate audio if the tutor mentions "audio summary" or "audio overview"
      if (responseText.toLowerCase().includes("audio summary") || responseText.toLowerCase().includes("audio overview")) {
        try {
          const audioUrl = await generateAudio(responseText.slice(0, 500)); // Limit length for TTS
          setMessages(prev => [...prev, {
            id: `ai-audio-${messageIdCounter.current++}`,
            sender: MessageSender.AI,
            timestamp: new Date(),
            content: { type: 'audio', src: audioUrl, transcript: "Magical audio overview" }
          }]);
        } catch (err) { console.error("Auto-audio failed", err); }
      }
    } catch (e) {
      console.error(e);
    } finally { setIsLoading(false); }
  }, [messages, updateMessageContentInState]);

  const startLiveChat = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const ai = await ensureApiKeyAndInstantiateGoogleGenAI();
      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: GEMINI_LIVE_MODEL,
        callbacks: {
          onopen: () => {
            setIsLoading(false);
            setIsLiveSessionActive(true);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const script = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            script.onaudioprocess = (ev) => {
              if (liveSessionRef.current) {
                liveSessionRef.current.sendRealtimeInput({ media: createBlob(ev.inputBuffer.getChannelData(0)) });
              }
            };
            source.connect(script);
            script.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              isTheClairvoyantSpeakingRef.current = true;
              const buffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
              const srcNode = outputAudioContextRef.current.createBufferSource();
              srcNode.buffer = buffer;
              srcNode.connect(outputAudioContextRef.current.destination);
              srcNode.onended = () => {
                playingSourcesRef.current.delete(srcNode);
                if (playingSourcesRef.current.size === 0) isTheClairvoyantSpeakingRef.current = false;
              };
              srcNode.start(Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime));
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime) + buffer.duration;
              playingSourcesRef.current.add(srcNode);
            }
            if (msg.serverContent?.turnComplete) {
              isTheClairvoyantSpeakingRef.current = false;
              nextStartTimeRef.current = 0;
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_API_SPEECH_VOICE_NAME } } },
          systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const stopLiveChat = () => {
    liveSessionRef.current?.close();
    liveSessionRef.current = null;
    audioStreamRef.current?.getTracks().forEach(t => t.stop());
    setIsLiveSessionActive(false);
    setIsLoading(false);
  };

  const handleUploadAudio = async (file: File) => {
    setIsLoading(true);
    const url = URL.createObjectURL(file);
    const userAudioMsgId = `user-up-${messageIdCounter.current++}`;
    setMessages(prev => [...prev, { id: userAudioMsgId, sender: MessageSender.User, timestamp: new Date(), content: { type: 'audio', src: url, transcript: 'Analyzing your voice...' } }]);
    try {
      const transcript = await transcribeAudio(file);
      updateMessageContentInState(userAudioMsgId, { type: 'audio', src: url, transcript });
      handleSendMessage(transcript);
    } catch (e) {
      updateMessageContentInState(userAudioMsgId, { type: 'text', value: "I couldn't quite hear that! Try speaking a bit louder?" });
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      audioChunksRef.current = [];
      rec.ondataavailable = e => audioChunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        setRecordedAudioUrl(URL.createObjectURL(blob));
        setIsRecordingVoiceMessage(false);
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      mediaRecorderRef.current = rec;
      setIsRecordingVoiceMessage(true);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl relative max-w-4xl mx-auto border border-gray-100 overflow-hidden">
      <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl animate-bounce">🔮</div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">The Clairvoyant</h1>
            <p className="text-[10px] uppercase tracking-wider text-indigo-500 font-black">Kristel's Genius Hub</p>
          </div>
          </div>
          <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">5th Grade • Dominican Convent</div>
          </header>

      
      <ChatWindow messages={messages} onShareMessage={sendEmail} />
      
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isLiveSessionActive={isLiveSessionActive}
        onStartLiveChat={startLiveChat}
        onStopLiveChat={stopLiveChat}
        isCameraActive={isCameraActive}
        onToggleCamera={async () => {
          if (isCameraActive) {
            localVideoStreamRef.current?.getTracks().forEach(t => t.stop());
            localVideoStreamRef.current = null;
            setIsCameraActive(false);
          } else {
            const s = await navigator.mediaDevices.getUserMedia({ video: true });
            localVideoStreamRef.current = s;
            setIsCameraActive(true);
          }
        }}
        isMicActive={isLiveSessionActive || isRecordingVoiceMessage}
        onShowProgress={() => setShowProgressModal(true)}
        onExportNotes={() => alert("Notes exported to your magical library!")} 
        isRecordingVoiceMessage={isRecordingVoiceMessage}
        startRecording={startRecording}
        stopRecording={() => mediaRecorderRef.current?.stop()}
        recordedAudioUrl={recordedAudioUrl}
        sendRecordedVoiceMessage={async () => {
          if (recordedAudioBlob) {
            handleUploadAudio(new File([recordedAudioBlob], "rec.webm", { type: 'audio/webm' }));
            setRecordedAudioBlob(null); setRecordedAudioUrl(null);
          }
        }}
        clearRecordedAudio={() => { setRecordedAudioBlob(null); setRecordedAudioUrl(null); }}
        onUploadAudio={handleUploadAudio}
      />
      
      <LiveVideoDisplay
        localStream={localVideoStreamRef.current}
        isTheClairvoyantSpeaking={isTheClairvoyantSpeakingRef.current}
        onStreamReady={() => {}}
        isMicActive={isLiveSessionActive}
        isCameraActive={isCameraActive}
      />
      
      {showProgressModal && <LearningProgressDisplay progress={learningProgress} onClose={() => setShowProgressModal(false)} />}
    </div>
  );
}

export default App;
