import React from 'react';
import { LearningProgress } from '../types';

interface LearningProgressDisplayProps {
  progress: LearningProgress;
  onClose: () => void;
}

const LearningProgressDisplay: React.FC<LearningProgressDisplayProps> = ({ progress, onClose }) => {
  const focusAreas = [
    { subject: "Mathematics", goal: "Master Multiplication Tables & Word Problems", tip: "Practice tables daily for faster recall!" },
    { subject: "Ndebele", goal: "Improve Language Comprehension", tip: "Read language structures carefully." },
    { subject: "Science & Tech", goal: "Use Scientific Vocabulary", tip: "Use accurate terms in your writing!" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col relative transform scale-95 animate-scale-in">
        <h2 className="text-2xl font-extrabold text-indigo-800 mb-4 border-b-2 border-indigo-300 pb-2 flex items-center gap-2">
          <span role="img" aria-label="Rocket">🚀</span> Kristel's Genius Log!
        </h2>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-2">Target Focus Areas</h3>
            <div className="space-y-2">
              {focusAreas.map((area, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                  <p className="text-xs font-bold text-indigo-400">{area.subject}</p>
                  <p className="text-sm font-bold text-gray-800">{area.goal}</p>
                  <p className="text-[10px] italic text-gray-500 mt-1">💡 {area.tip}</p>
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-2">Discovery History</h3>
          {progress.topicsCovered.length === 0 ? (
            <p className="text-indigo-700 text-sm italic text-center py-4">
              No topics explored yet! ✨
            </p>
          ) : (
            <ul className="list-none space-y-2 pl-0">
              {progress.topicsCovered.map((topic, index) => (
                <li
                  key={index}
                  className="bg-indigo-50 bg-opacity-80 p-2 rounded-md shadow-sm flex items-center gap-3 text-indigo-900 text-sm"
                >
                  <span className="text-indigo-400 font-bold">#{index + 1}</span>
                  <span className="font-medium">{topic}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-yellow-700 mb-1">Cambridge Corner</h3>
            <p className="text-xs text-yellow-800 font-medium">User: nslegend8@gmail.com</p>
            <p className="text-xs text-yellow-800 font-medium">Pass: KrisKrossApplesauce15</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-300 active:bg-indigo-800"
          aria-label="Close learning progress display"
        >
          Back to Learning
        </button>
      </div>
    </div>
  );
};

export default LearningProgressDisplay;