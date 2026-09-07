import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FolderPlus, Laptop, Cloud, ArrowRight, FolderOpen } from 'lucide-react';
import { get, set } from 'idb-keyval';
import { verifyPermission } from '../lib/fileSystem';

interface SetupScreenProps {
  onComplete: (mode: 'virtual' | 'local', handle?: any) => void;
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const [savedHandle, setSavedHandle] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('showDirectoryPicker' in window);
    
    // Check if we have a saved directory handle
    get('workspace-dir-handle').then(handle => {
      if (handle) {
        setSavedHandle(handle);
      }
      setChecking(false);
    });
  }, []);

  const handleOpenLocal = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      await set('workspace-dir-handle', handle);
      onComplete('local', handle);
    } catch (e) {
      console.log('User cancelled or error', e);
    }
  };

  const handleResumeLocal = async () => {
    try {
      const hasPermission = await verifyPermission(savedHandle, true);
      if (hasPermission) {
        onComplete('local', savedHandle);
      }
    } catch (e) {
      console.log('Failed to resume handle', e);
    }
  };

  if (checking) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[#121212] flex items-center justify-center p-6 text-slate-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-[#1e1e1e] border border-white/10 rounded-3xl p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Welcome to your Workspace</h2>
          <p className="text-slate-400">Choose where to save your code.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Local Folder Option */}
          <div className="flex flex-col h-full bg-black/20 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Laptop className="w-24 h-24 text-blue-500" />
            </div>
            
            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Local Folder</h3>
              <p className="text-sm text-slate-400 mb-6">
                Create a folder on your computer. All files will be saved directly to your hard drive. 
                Auto-saves and persists across sessions.
              </p>
            </div>
            
            <div className="relative z-10 mt-auto">
              {!isSupported ? (
                <div className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg">
                  Not supported on mobile or this browser. Please use Virtual Workspace.
                </div>
              ) : savedHandle ? (
                <div className="space-y-3">
                  <button 
                    onClick={handleResumeLocal}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Open Recent Folder
                  </button>
                  <button 
                    onClick={handleOpenLocal}
                    className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    Choose Different Folder
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleOpenLocal}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  Select Folder
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Virtual Workspace Option */}
          <div className="flex flex-col h-full bg-black/20 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cloud className="w-24 h-24 text-purple-500" />
            </div>
            
            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Virtual Workspace</h3>
              <p className="text-sm text-slate-400 mb-6">
                Run entirely in the browser memory. Great for quick testing. Files are not saved to your hard drive permanently.
              </p>
            </div>
            
            <div className="relative z-10 mt-auto">
              <button 
                onClick={() => onComplete('virtual')}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Start Virtual Project
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
