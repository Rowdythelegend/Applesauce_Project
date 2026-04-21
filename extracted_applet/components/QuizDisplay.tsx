import React from 'react';
import { QuizQuestion } from '../types';

interface QuizDisplayProps {
  questions: QuizQuestion[];
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ questions }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 rounded-lg text-yellow-800 border border-yellow-200 mt-2">
        <p>The Clairvoyant tried to prepare a quiz, but couldn't find any questions!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg shadow-md mt-2 max-w-full overflow-x-auto">
      <h3 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-2">Your Quiz Time! 🧠</h3>
      {questions.map((q, index) => (
        <div key={q.id} className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-blue-100">
          <p className="font-semibold text-gray-800 mb-2">Q{index + 1}: {q.question}</p>
          {q.options && q.options.length > 0 && (
            <ul className="list-none space-y-1 pl-0">
              {q.options.map((option, optIndex) => (
                <li key={optIndex} className="text-sm text-gray-700">
                  <span className="font-medium mr-1">{String.fromCharCode(65 + optIndex)}.</span> {option}
                </li>
              ))}
            </ul>
          )}
          {/* For now, answers are expected to be typed in the chat. 
              Future enhancement: add input fields here and track answers. */}
          <p className="text-xs italic text-gray-500 mt-2">Type your answer in the chat!</p>
        </div>
      ))}
      <p className="text-blue-600 text-sm mt-4">Good luck, Applesauce! You can do it!</p>
    </div>
  );
};

export default QuizDisplay;