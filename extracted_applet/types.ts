export enum MessageSender {
  User = 'user',
  AI = 'ai',
}

export interface TextContent {
  type: 'text';
  value: string;
}

export interface AudioContent {
  type: 'audio';
  src: string; // Base64 encoded audio URL
  transcript?: string; // Optional transcript for the audio
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[]; // Optional for multiple choice
}

export interface QuizContent {
  type: 'quiz';
  questions: QuizQuestion[];
}

// New types for live transcription messages
export interface LiveTranscriptionContent {
  type: 'live-transcription';
  value: string;
  isUser: boolean;
  isFinal: boolean;
}

// New type to signal live video display (e.g., for AI avatar or user video placeholder)
export interface LiveVideoDisplayContent {
  type: 'live-video-display';
  id: string; // Unique ID for this live display element (e.g., 'user-video', 'ai-video')
  isSpeaking: boolean; // Indicates if the speaker associated with this display is currently speaking
  speakerName: string; // e.g., 'Professor Sparkle', 'Applesauce'
  avatarSrc?: string; // Optional: for AI avatar image
}

export interface ImageContent {
  type: 'image';
  src?: string; // Base64 encoded image URL, optional if still loading
  alt: string; // Alternative text for the image
  isLoading?: boolean; // Optional: for showing a loading spinner while image is being generated
}

export type MessageContent = TextContent | AudioContent | QuizContent | LiveTranscriptionContent | LiveVideoDisplayContent | ImageContent;

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  timestamp: Date;
  content: MessageContent;
}

// Gemini API related types
export interface GeminiConfig {
  model: string;
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
}

// New type for tracking learning progress
export interface LearningProgress {
  topicsCovered: string[];
  // Future enhancement: quizScores: QuizScore[];
}
