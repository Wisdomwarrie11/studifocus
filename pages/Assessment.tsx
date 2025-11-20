import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const Assessment: React.FC = () => {
  const { assessments, submitAssessment } = useApp();
  const navigate = useNavigate();
  
  const [activeAssessmentId, setActiveAssessmentId] = useState(assessments[0]?.id);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> optionIndex
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const assessment = assessments.find(a => a.id === activeAssessmentId);

  if (!assessment) return <div className="p-8">No assessment found.</div>;

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    assessment.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    const finalScore = Math.round((correctCount / assessment.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    submitAssessment(assessment.id, finalScore);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-2xl font-bold text-gray-800">{assessment.title}</h1>
        <p className="text-gray-500 text-sm md:text-base">Test your retention to unlock next week.</p>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 md:px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
            <span className="text-sm font-medium text-indigo-600">Passing Score: {assessment.passingScore}%</span>
          </div>

          <div className="p-6 md:p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {assessment.questions[currentQuestionIndex].text}
            </h3>
            <div className="space-y-3">
              {assessment.questions[currentQuestionIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(assessment.questions[currentQuestionIndex].id, idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm md:text-base ${
                    answers[assessment.questions[currentQuestionIndex].id] === idx
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between gap-3">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto px-4 py-2 text-gray-500 disabled:opacity-50 font-medium hover:text-gray-700 text-center"
            >
              Previous
            </button>
            
            {currentQuestionIndex < assessment.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(assessment.questions.length - 1, prev + 1))}
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 shadow-lg shadow-green-200"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">
          <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${score >= assessment.passingScore ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {score >= assessment.passingScore ? <CheckCircle size={32} className="md:w-10 md:h-10" /> : <XCircle size={32} className="md:w-10 md:h-10" />}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{score}%</h2>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            {score >= assessment.passingScore 
              ? "Excellent work! You've unlocked the next module." 
              : "You didn't pass this time. Review the material and try again."}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Assessment;