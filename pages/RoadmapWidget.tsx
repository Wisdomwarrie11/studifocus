import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Map as MapIcon, Plus, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoadmapTask, SubGoal } from '../types';
import confetti from 'canvas-confetti';

const RoadmapWidget: React.FC = () => {
  const { user, roadmapTasks, addRoadmapTask, updateRoadmapProgress } = useApp();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskGoal, setNewTaskGoal] = useState('');
  const [tempGoals, setTempGoals] = useState<string[]>([]);

  const handleAddTempGoal = () => {
    if (newTaskGoal.trim()) {
      setTempGoals([...tempGoals, newTaskGoal.trim()]);
      setNewTaskGoal('');
    }
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim() && tempGoals.length > 0) {
      addRoadmapTask(newTaskTitle, newTaskDesc, tempGoals);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setTempGoals([]);
      setIsAddingTask(false);
    }
  };

  const handleToggleSubGoal = (taskId: string, goalId: string) => {
    updateRoadmapProgress(taskId, goalId);
    // Trigger confetti if task reached
    const task = roadmapTasks.find(t => t.id === taskId);
    if (task) {
        const completedCount = task.goals.filter(g => g.completed || g.id === goalId).length;
        if (completedCount === task.goals.length) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <MapIcon className="mr-2 text-indigo-600" size={24} /> Journey Roadmap
          </h2>
          <p className="text-sm text-gray-500">Break down big goals into small steps and track your avatar's progress.</p>
        </div>
        <button 
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-12 pr-2 custom-scrollbar">
        <AnimatePresence>
          {isAddingTask && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 space-y-4 mb-8"
            >
              <input 
                type="text" 
                placeholder="Main Task Title (e.g., Biology Finals)" 
                className="w-full p-3 bg-white rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />
              <textarea 
                placeholder="Short description..." 
                className="w-full p-3 bg-white rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-600 resize-none h-20"
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
              />
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Add a milestone goal..." 
                  className="flex-1 p-3 bg-white rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
                  value={newTaskGoal}
                  onChange={e => setNewTaskGoal(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddTempGoal()}
                />
                <button onClick={handleAddTempGoal} className="bg-indigo-600 text-white p-3 rounded-xl"><Plus size={20} /></button>
              </div>
              
              {tempGoals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tempGoals.map((g, i) => (
                    <span key={i} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-indigo-700 border border-indigo-100">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button onClick={() => setIsAddingTask(false)} className="px-4 py-2 text-gray-500 font-medium">Cancel</button>
                <button 
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle || tempGoals.length === 0}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50"
                >
                  Start Journey
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {roadmapTasks.map((task) => (
          <div key={task.id} className="space-y-6 relative pb-8 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-gray-800">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {Math.round(task.avatarPosition)}% Complete
                </span>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Target: {new Date(task.targetDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Gamified Track */}
            <div className="relative h-24 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center px-8">
              {/* The Path */}
              <div className="absolute h-1 left-8 right-8 bg-gray-200 rounded-full top-1/2 -translate-y-1/2">
                <motion.div 
                  className="h-full bg-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.avatarPosition}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Milestones on the path */}
              <div className="absolute left-8 right-8 flex justify-between top-1/2 -translate-y-1/2">
                {task.goals.map((goal, idx) => (
                  <div key={goal.id} className="relative">
                    <div className={`w-4 h-4 rounded-full border-4 ${goal.completed ? 'bg-indigo-600 border-indigo-200' : 'bg-white border-gray-300'} transition-colors duration-500`} />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-gray-400 rotate-12">
                       {idx === task.goals.length - 1 ? <Flag size={14} className="inline mr-1" /> : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* The Moving Avatar */}
              <motion.div 
                className="absolute z-10 top-1/2 -translate-y-1/2 -translate-x-1/2"
                initial={{ left: '8%' }}
                animate={{ left: `${8 + (task.avatarPosition * 0.84)}%` }} // Adjust for padding
                transition={{ duration: 1, type: "spring", stiffness: 50 }}
              >
                <div className="relative group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-2 border-white ring-4 ring-indigo-50">
                        {task.avatarPosition === 100 ? <Trophy size={20} /> : (user?.name?.[0] || 'S')}
                    </div>
                    {/* Hover tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Moving to target!
                    </div>
                </div>
              </motion.div>
            </div>

            {/* Goal List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {task.goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleToggleSubGoal(task.id, goal.id)}
                  disabled={goal.completed}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    goal.completed ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 ${goal.completed ? 'text-green-500' : 'text-gray-300'}`}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="text-sm font-medium">{goal.text}</span>
                  </div>
                  {!goal.completed && <ChevronRight size={16} className="text-gray-300" />}
                </button>
              ))}
            </div>
          </div>
        ))}

        {roadmapTasks.length === 0 && !isAddingTask && (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MapIcon className="text-gray-400" />
             </div>
             <p className="text-gray-500 font-medium italic">No active journeys yet. Create your first big roadmap!</p>
             <button onClick={() => setIsAddingTask(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Start Now</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapWidget;
