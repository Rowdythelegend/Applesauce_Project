import React, { useEffect, useRef, useState, useCallback } from 'react';
import { THE_CLAIRVOYANT_AVATAR_URL } from '../constants';

interface LiveVideoDisplayProps {
  localStream: MediaStream | null; // User's local video stream
  isTheClairvoyantSpeaking: boolean; // Controls Clairvoyant's avatar animation
  onStreamReady: (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => void;
  isMicActive: boolean; // Indicates if user's microphone is active
  isCameraActive: boolean; // Indicates if user's camera is active
}

const LiveVideoDisplay: React.FC<LiveVideoDisplayProps> = ({
  localStream,
  isTheClairvoyantSpeaking,
  onStreamReady,
  isMicActive,
  isCameraActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  const offset = useRef({ x: 0, y: 0 });

  // Set initial position after component mounts and window dimensions are stable
  useEffect(() => {
    // Calculate a default bottom-right position
    // Component width approx 150px, height approx 240px. Add some padding.
    const componentWidth = 150; 
    const componentHeight = 240;
    const padding = 16; // Corresponds to p-4 around the root div in index.html, and additional internal padding

    const initialX = window.innerWidth - componentWidth - padding; 
    const initialY = window.innerHeight - componentHeight - padding;
    setPosition({
      x: initialX,
      y: initialY,
    });
  }, []); // Run once on mount


  // Attach local stream to video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
      videoRef.current.play().catch(e => console.error("Error playing video stream:", e));
      // Notify parent when video and canvas are ready
      if (canvasRef.current) {
        onStreamReady(videoRef.current, canvasRef.current);
      }
    } else if (videoRef.current) {
      // Stop stream if localStream becomes null
      videoRef.current.srcObject = null;
    }
  }, [localStream, onStreamReady]);


  // Handle drag operations
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;

    // Keep within bounds of the viewport
    const componentWidth = 150; 
    const componentHeight = 240;
    const padding = 10; 

    const maxX = window.innerWidth - componentWidth - padding; 
    const maxY = window.innerHeight - componentHeight - padding; 
    const minX = padding;
    const minY = padding;

    setPosition({
      x: Math.max(minX, Math.min(newX, maxX)),
      y: Math.max(minY, Math.min(newY, maxY)),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  if (!localStream && !isTheClairvoyantSpeaking && !isCameraActive && !isMicActive) { // Only hide if absolutely nothing is active
    return null; 
  }

  // Determine what text to show when camera is not actively streaming
  let cameraStatusText = '';
  if (!isCameraActive) {
    cameraStatusText = 'Camera Off';
  } else if (isCameraActive && !localStream) {
    cameraStatusText = 'Getting camera...';
  }

  return (
    <div
      className="fixed z-50 p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-lg border-2 border-purple-300 flex flex-col gap-3"
      style={{ left: position.x, top: position.y }}
    >
      {/* Draggable handle */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        aria-label="Drag to reposition video feeds"
        role="slider" // For accessibility to indicate draggable handle
      ></div>

      {/* The Clairvoyant's Avatar */}
      <div className="relative w-32 h-32 bg-white rounded-full mx-auto flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
        <img
          src={THE_CLAIRVOYANT_AVATAR_URL}
          alt="The Clairvoyant Avatar"
          className="w-full h-full object-cover"
        />
        {isTheClairvoyantSpeaking && (
          <div className="absolute inset-0 bg-purple-500 opacity-20 animate-pulse rounded-full flex items-center justify-center">
            <span className="text-white text-2xl animate-bounce">🔮</span>
          </div>
        )}
        <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
            ${isTheClairvoyantSpeaking ? 'bg-green-500' : 'bg-gray-500'}`}
          title={isTheClairvoyantSpeaking ? "The Clairvoyant is speaking" : "The Clairvoyant is idle"}>
          {isTheClairvoyantSpeaking ? '🔊' : '...'}
        </div>
      </div>

      {/* User's Local Video Feed */}
      <div className="relative w-32 h-24 mx-auto bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-300 shadow-inner">
        {localStream && isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Mute local preview to avoid echo
            className="w-full h-full object-cover transform scaleX(-1)" // Flip horizontally
            aria-label="Your camera feed"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300 text-center text-sm p-2">
            {cameraStatusText}
          </div>
        )}
         {/* Mic and Camera status indicators */}
         <div className="absolute top-1 left-1 flex gap-1">
            <span className={`w-3 h-3 rounded-full ${isMicActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} title={isMicActive ? "Microphone Active" : "Microphone Inactive"}></span>
            <span className={`w-3 h-3 rounded-full ${isCameraActive ? 'bg-blue-500' : 'bg-gray-500'}`} title={isCameraActive ? "Camera Active" : "Camera Inactive"}></span>
          </div>
      </div>

      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true"></canvas>
    </div>
  );
};

export default LiveVideoDisplay;