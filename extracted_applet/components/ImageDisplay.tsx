import React from 'react';

interface ImageDisplayProps {
  src?: string; // Optional because it might be loading
  alt: string;
  isLoading?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ src, alt, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow-inner mt-2 w-full h-48">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 italic">Conjuring a magical image for you...</p>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="p-4 bg-red-100 rounded-lg text-red-800 border border-red-200 mt-2">
        <p>The Clairvoyant tried to conjure an image, but it vanished! Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-pink-100 rounded-lg shadow-inner mt-2 max-w-full">
      <img src={src} alt={alt} className="max-w-full h-auto rounded-md shadow-md" />
      <p className="text-sm text-gray-800 italic p-2 text-center w-full">{alt}</p>
    </div>
  );
};

export default ImageDisplay;