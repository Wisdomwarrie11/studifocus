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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        {showSoundControls && (
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 mb-4 w-80 animate-fade-in">
                <div className="flex justify-between items-center mb-5">
                    <h4 className="font-black text-deep-blue text-sm flex items-center tracking-tight">
                      <Music size={16} className="mr-2 text-brand-orange"/> Focus Soundscape
                    </h4>
                    <button onClick={() => setShowSoundControls(false)} className="text-gray-400 hover:text-deep-blue p-1 rounded-lg hover:bg-gray-100 transition-all"><X size={18}/></button>
                </div>
                
                <div className="flex bg-gray-50 rounded-2xl p-1 mb-5 shadow-inner">
                    <button 
                        onClick={() => setSoundType('white')}
                        className={`flex-1 text-xs py-2 rounded-xl font-black transition-all ${soundType === 'white' ? 'bg-white text-deep-blue shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Zen
                    </button>
                    <button 
                        onClick={() => setSoundType('pink')}
                        className={`flex-1 text-xs py-2 rounded-xl font-black transition-all ${soundType === 'pink' ? 'bg-white text-brand-orange shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Rain
                    </button>
                    <button 
                        onClick={() => setSoundType('custom')}
                        className={`flex-1 text-xs py-2 rounded-xl font-black transition-all ${soundType === 'custom' ? 'bg-white text-amber-500 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Library
                    </button>
                </div>

                {soundType === 'custom' && (
                  <div className="mb-5">
                    <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-orange-50/20 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-1 pb-1">
                        <Upload size={24} className="text-gray-300 group-hover:text-brand-orange transition-colors mb-2" />
                        <p className="text-xs text-gray-500 text-center">
                          {customSoundName ? <span className="text-brand-orange font-black">{customSoundName}</span> : "Select your audio file"}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="audio/*" onChange={handleCustomSoundUpload} />
                    </label>
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-6">
                    {soundVolume === 0 ? <VolumeX size={18} className="text-gray-400"/> : <Volume2 size={18} className="text-brand-orange" />}
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    />
                </div>

                <button 
                    onClick={() => setSoundPlaying(!isSoundPlaying)}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center transition-all shadow-lg ${
                      isSoundPlaying 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-red-100' 
                        : 'bg-brand-orange text-white hover:bg-brand-orange/90 shadow-orange-100'
                    }`}
                >
                    {isSoundPlaying ? 'Silence' : 'Start Soundscape'}
                </button>
            </div>
        )}
        <button 
            onClick={() => setShowSoundControls(!showSoundControls)}
            className={`p-5 rounded-3xl shadow-2xl transition-all hover:scale-110 active:scale-95 z-50 ${isSoundPlaying ? 'bg-brand-orange text-white animate-pulse ring-8 ring-orange-50' : 'bg-white text-deep-blue hover:shadow-orange-100 border border-gray-50'}`}
        >
            <Headphones size={28} />
        </button>
    </div>
  );
};

export default SoundController;
