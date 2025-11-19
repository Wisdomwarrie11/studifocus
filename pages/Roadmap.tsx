
import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Lock, Unlock, BookOpen, ChevronRight, PlayCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Roadmap: React.FC = () => {
  const { weeks, user, assessments } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const getAssessmentForWeek = (weekId: string) => {
    return assessments.find(a => a.weekId === weekId);
  };

  const isTopicCompleted = (topicId: string) => {
    return user.completedTopics.includes(topicId);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Study Roadmap</h1>
        <p className="text-gray-500 mt-2">Track your journey from beginner to master.</p>
      </div>

      <div className="space-y-8 relative">
        {/* Connecting Line (Visual only, simplified for CSS) */}
        <div className="absolute left-8 top-10 bottom-10 w-1 bg-gray-200 hidden md:block -z-10"></div>

        {weeks.map((week, index) => {
          const assessment = getAssessmentForWeek(week.id);
          const assessmentScore = assessment ? user.assessmentScores[assessment.id] : undefined;
          const isPassed = assessmentScore && assessment && assessmentScore >= assessment.passingScore;
          
          // Calculate Progress
          const totalTopics = week.topics.length;
          const completedCount = week.topics.filter(t => isTopicCompleted(t.id)).length;
          const progressPercent = totalTopics === 0 ? 0 : (completedCount / totalTopics) * 100;

          return (
            <div key={week.id} className={`relative md:pl-24 ${!week.isUnlocked ? 'opacity-75 grayscale' : ''}`}>
              
              {/* Week Marker */}
              <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-white border-4 border-indigo-100 rounded-full items-center justify-center z-10 shadow-sm">
                {week.isUnlocked ? (
                  <span className="text-xl font-bold text-primary">{week.weekNumber}</span>
                ) : (
                  <Lock size={20} className="text-gray-400" />
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                {/* Week Header */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-800">{week.title}</h2>
                      {!week.isUnlocked && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Locked</span>}
                      {isPassed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Completed</span>}
                    </div>
                    <p className="text-sm text-gray-500">{completedCount} / {totalTopics} Topics Completed</p>
                  </div>
                  
                  {week.isUnlocked && (
                    <div className="w-full sm:w-48">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-xs text-gray-400 mt-1">{Math.round(progressPercent)}%</p>
                    </div>
                  )}
                </div>

                {/* Topics List */}
                <div className="divide-y divide-gray-50">
                  {week.topics.map((topic) => {
                    const isDone = isTopicCompleted(topic.id);
                    return (
                      <div key={topic.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 group">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {isDone ? <CheckCircle size={18} /> : <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            Day {topic.day}: {topic.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{topic.estimatedMinutes} min</span>
                            {topic.resources.length > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} /> {topic.resources.length} Resources
                              </span>
                            )}
                          </div>
                        </div>

                        {week.isUnlocked && (
                          <button 
                            onClick={() => navigate('/study')}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 p-2 rounded-lg hover:bg-primary hover:text-white hover:border-primary"
                          >
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Assessment Action */}
                {assessment && (
                  <div className="p-4 bg-indigo-50/30 border-t border-indigo-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{assessment.title}</p>
                        <p className="text-xs text-gray-500">Pass to unlock Week {week.weekNumber + 1}</p>
                      </div>
                    </div>
                    
                    {week.isUnlocked ? (
                      <button 
                        onClick={() => navigate('/assessment')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          isPassed 
                            ? 'bg-green-100 text-green-700 cursor-default' 
                            : 'bg-primary text-white hover:bg-indigo-700 shadow-sm'
                        }`}
                        disabled={isPassed}
                      >
                        {isPassed ? `Score: ${assessmentScore}%` : 'Start Quiz'}
                      </button>
                    ) : (
                      <div className="px-3 py-1 bg-gray-100 text-gray-400 text-xs rounded font-medium flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;
