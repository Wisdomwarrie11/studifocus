import React, { useState, useEffect, useRef } from 'react';
import { Music, Upload, Volume2, VolumeX, Headphones, X } from 'lucide-react';

// --- Soundscape Generator Hook ---
const useSoundscape = (customAudioUrl: string | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [type, setType] = useState<'white' | 'pink' | 'custom'>('white');
  const [volume, setVolume] = useState(0.5);
  
  // Refs for Web Audio API (Noise)
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Ref for Custom Audio File
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Volume Changes without restarting audio
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (customAudioRef.current) {
      customAudioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Cleanup function to stop current sounds before starting new ones or when unmounting
    const cleanup = () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
        sourceRef.current = null;
      }
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
    };

    cleanup();

    if (isPlaying) {
      if (type === 'custom') {
        // Handle Custom Audio
        if (customAudioUrl) {
          if (!customAudioRef.current || customAudioRef.current.src !== customAudioUrl) {
            customAudioRef.current = new Audio(customAudioUrl);
            customAudioRef.current.loop = true;
          }
          customAudioRef.current.volume = volume;
          customAudioRef.current.play().catch(e => console.error("Custom audio play error:", e));
        }
      } else {
        // Handle White/Pink Noise (Web Audio API)
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if(ctx && ctx.state === 'suspended') ctx.resume();

        if (ctx) {
            const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            } else if (type === 'pink') {
            // Pink Noise approximation
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.075076;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                data[i] *= 0.11; 
                b6 = white * 0.115926;
            }
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            
            if (!gainNodeRef.current) {
                gainNodeRef.current = ctx.createGain();
                gainNodeRef.current.connect(ctx.destination);
            }
            
            gainNodeRef.current.gain.value = volume;
            source.connect(gainNodeRef.current);
            source.start();
            sourceRef.current = source;
        }
      }
    }

    return cleanup;
  }, [isPlaying, type, customAudioUrl]);

  return { isPlaying, setIsPlaying, type, setType, volume, setVolume };
};

const SoundController: React.FC = () => {
  const [customSoundUrl, setCustomSoundUrl] = useState<string | null>(null);
  const [customSoundName, setCustomSoundName] = useState<string | null>(null);
  const [showSoundControls, setShowSoundControls] = useState(false);
  
  const { 
    isPlaying: isSoundPlaying, 
    setIsPlaying: setSoundPlaying, 
    type: soundType, 
    setType: setSoundType, 
    volume: soundVolume, 
    setVolume: setSoundVolume 
  } = useSoundscape(customSoundUrl);

  const handleCustomSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomSoundUrl(url);
      setCustomSoundName(file.name);
      setSoundType('custom');
      if (!isSoundPlaying) setSoundPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {showSoundControls && (
            <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 mb-4 w-72 animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-700 text-sm flex items-center">
                      <Music size={14} className="mr-2 text-indigo-500"/> Focus Sounds
                    </h4>
                    <button onClick={() => setShowSoundControls(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                </div>
                
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                    <button 
                        onClick={() => setSoundType('white')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'white' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        White
                    </button>
                    <button 
                        onClick={() => setSoundType('pink')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'pink' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Rain
                    </button>
                    <button 
                        onClick={() => setSoundType('custom')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'custom' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Custom
                    </button>
                </div>

                {soundType === 'custom' && (
                  <div className="mb-4">
                    <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-1 pb-1">
                        <Upload size={20} className="text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 text-center">
                          {customSoundName ? <span className="text-indigo-600 font-semibold">{customSoundName}</span> : "Upload audio (mp3, wav)"}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="audio/*" onChange={handleCustomSoundUpload} />
                    </label>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-4">
                    {soundVolume === 0 ? <VolumeX size={16} className="text-gray-400"/> : <Volume2 size={16} className="text-gray-400" />}
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <button 
                    onClick={() => setSoundPlaying(!isSoundPlaying)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                      isSoundPlaying 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    }`}
                >
                    {isSoundPlaying ? 'Pause Audio' : 'Play Soundscape'}
                </button>
            </div>
        )}
        <button 
            onClick={() => setShowSoundControls(!showSoundControls)}
            className={`p-4 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isSoundPlaying ? 'bg-indigo-600 text-white animate-pulse ring-4 ring-indigo-100' : 'bg-white text-gray-600 hover:text-indigo-600'}`}
        >
            <Headphones size={24} />
        </button>
    </div>
  );
};

export default SoundController;
