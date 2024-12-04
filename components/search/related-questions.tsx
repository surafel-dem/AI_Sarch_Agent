'use client';

import { Plus } from 'lucide-react';

interface RelatedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function RelatedQuestions({ questions, onQuestionClick }: RelatedQuestionsProps) {
  return (
    <div className="space-y-4 bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-lg font-medium text-white">Related Questions</h3>
      <div className="space-y-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              {question}
            </span>
            <Plus 
              size={16} 
              className="text-gray-500 group-hover:text-gray-300 transition-colors" 
            />
          </button>
        ))}
      </div>
    </div>
  );
}
