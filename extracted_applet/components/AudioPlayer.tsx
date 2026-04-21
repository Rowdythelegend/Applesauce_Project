import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  src: string; // Base64 encoded audio URL
  transcript?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, transcript }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Volume from 0 to 1

  useEffect(() => {
    // Reset play state when source changes
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.load(); // Reload audio element to ensure new src is used
    }
  }, [src]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolume(newVolume);
  };

  if (!src) return null;

  return (
    <div className="flex flex-col items-start gap-2 p-3 bg-purple-100 rounded-lg shadow-inner mt-2 max-w-full">
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={togglePlayPause}
          className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <audio
          ref={audioRef}
          src={src}
          className="hidden" // Hide the default audio controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          volume={volume}
        >
          Your browser does not support the audio element.
        </audio>
        <div className="flex items-center flex-1 gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 6.343a1 1 0 01.707 1.414L13.293 10l2.071 2.071a1 1 0 01-1.414 1.414L11.88 10l-2.071 2.071a1 1 0 11-1.414-1.414L10.466 10 8.395 7.929a1 1 0 011.414-1.414L11.88 10l2.071-2.071a1 1 0 01.706-.293z" clipRule="evenodd" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer range-sm accent-purple-500"
            aria-label="Volume control"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l1.707 1.707A2 2 0 018 14.172V15a2 2 0 104 0v-1.828a2 2 0 01.586-1.414L16 11.586V8a6 6 0 00-6-6zM11 14.5a1 1 0 10-2 0v.5a1 1 0 102 0v-.5zm-.15-9.14a.75.75 0 10-1.25 1.047l.107.135a4 4 0 013.197 3.197l.135.107a.75.75 0 001.047-1.25l-.135-.107a5.502 5.002 0 00-4.398-4.398z" />
          </svg>
        </div>
      </div>
      {transcript && (
        <p className="text-sm text-gray-700 italic max-w-full overflow-hidden text-ellipsis">
          <span className="font-semibold">Transcript:</span> {transcript}
        </p>
      )}
    </div>
  );
};

export default AudioPlayer;