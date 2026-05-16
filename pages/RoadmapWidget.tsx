import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Map as MapIcon, Plus, CheckCircle2, ChevronRight, Trophy, Trash2, Edit3, X as CloseIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoadmapTask, SubGoal } from '../types';
import confetti from 'canvas-confetti';

const RoadmapWidget: React.FC = () => {
  const { 
    user, 
    roadmapTasks, 
    addRoadmapTask, 
    updateRoadmapProgress, 
    deleteRoadmapTask, 
    updateRoadmapTask 
  } = useApp();
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
          <h2 className="text-2xl font-black text-deep-blue flex items-center tracking-tight">
            <MapIcon className="mr-2 text-brand-orange" size={24} /> Journey Roadmap
          </h2>
          <p className="text-sm text-gray-500">Break down big goals into small steps and track your progress.</p>
        </div>
        <button 
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="p-2 bg-orange-50 text-brand-orange rounded-xl hover:bg-orange-100 transition-colors shadow-sm"
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
              className="bg-orange-50 rounded-2xl p-6 border border-orange-100 space-y-4 mb-8"
            >
              <input 
                type="text" 
                placeholder="Main Task Title (e.g., Biology Finals)" 
                className="w-full p-3 bg-white rounded-xl border border-orange-100 outline-none focus:ring-2 focus:ring-brand-orange"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />
              <textarea 
                placeholder="Short description..." 
                className="w-full p-3 bg-white rounded-xl border border-orange-100 outline-none focus:ring-2 focus:ring-brand-orange resize-none h-20"
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
              />
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Add a milestone goal..." 
                  className="flex-1 p-3 bg-white rounded-xl border border-orange-100 outline-none focus:ring-2 focus:ring-brand-orange"
                  value={newTaskGoal}
                  onChange={e => setNewTaskGoal(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddTempGoal()}
                />
                <button onClick={handleAddTempGoal} className="bg-brand-orange text-white p-3 rounded-xl hover:bg-brand-orange/90 transition-all font-bold">
                  <Plus size={20} />
                </button>
              </div>
              
              {tempGoals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tempGoals.map((g, i) => (
                    <span key={i} className="bg-white px-3 py-1 rounded-full text-xs font-black text-brand-orange border border-orange-200">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button onClick={() => setIsAddingTask(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                <button 
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle || tempGoals.length === 0}
                  className="bg-deep-blue text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 shadow-lg"
                >
                  Start Journey
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {roadmapTasks.map((task) => (
          <div key={task.id} className="group space-y-6 relative pb-8 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-black text-deep-blue tracking-tight">{task.title}</h3>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        const newTitle = prompt('New Title:', task.title);
                        if (newTitle) updateRoadmapTask(task.id, { title: newTitle });
                      }}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete this roadmap?')) deleteRoadmapTask(task.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{task.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-brand-orange bg-orange-50 px-2 py-1 rounded">
                  {Math.round(task.avatarPosition)}%
                </span>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Target: {new Date(task.targetDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Gamified Track */}
            <div className="relative h-24 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center px-8">
              {/* The Path */}
              <div className="absolute h-1.5 left-8 right-8 bg-gray-200 rounded-full top-1/2 -translate-y-1/2">
                <motion.div 
                  className="h-full bg-brand-orange rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.avatarPosition}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Milestones on the path */}
              <div className="absolute left-8 right-8 flex justify-between top-1/2 -translate-y-1/2">
                {task.goals.map((goal, idx) => (
                  <div key={goal.id} className="relative">
                    <div className={`w-5 h-5 rounded-full border-4 ${goal.completed ? 'bg-brand-orange border-orange-200' : 'bg-white border-gray-300'} transition-all duration-500`} />
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-gray-400 rotate-12">
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
                    <div className="w-12 h-12 bg-deep-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-deep-blue/20 border-2 border-white ring-4 ring-orange-50">
                        {task.avatarPosition === 100 ? <Trophy size={20} className="text-brand-orange" /> : (user?.name?.[0] || 'S')}
                    </div>
                </div>
              </motion.div>
            </div>

            {/* Goal List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {task.goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    goal.completed ? 'bg-gray-50 border-gray-100 text-gray-300' : 'bg-white border-gray-200 text-deep-blue hover:border-brand-orange hover:shadow-md font-bold'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSubGoal(task.id, goal.id);
                      }}
                      disabled={goal.completed}
                      className={`mr-3 ${goal.completed ? 'text-green-500' : 'text-gray-300'}`}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <span className="text-sm font-bold">{goal.text}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(window.confirm('Delete this goal?')) {
                          const updatedGoals = task.goals.filter(g => g.id !== goal.id);
                          updateRoadmapTask(task.id, { goals: updatedGoals });
                        }
                      }}
                      className="text-gray-300 hover:text-red-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                    {!goal.completed && <ChevronRight size={16} className="text-brand-orange" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {roadmapTasks.length === 0 && !isAddingTask && (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MapIcon className="text-gray-400" />
             </div>
             <p className="text-gray-500 font-bold italic">No active journeys yet. Create your first big roadmap!</p>
             <button onClick={() => setIsAddingTask(true)} className="mt-4 text-brand-orange font-black hover:underline tracking-tight">Start Now</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapWidget;
