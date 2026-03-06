import React from 'react';
import { JapaneseYen, Home, User } from 'lucide-react';

export function BottomNav({ active, onNavigate }: { active: string, onNavigate: (page: string) => void }) {
  return (
    <div className="bg-white border-t border-slate-100 pb-4 pt-2 px-6 flex justify-between items-center h-[68px] w-full">
      <button 
        onClick={() => onNavigate('analysis')}
        className="flex flex-col items-center gap-1 w-16"
      >
        <JapaneseYen className={`w-6 h-6 ${active === 'analysis' ? 'text-indigo-600' : 'text-slate-300'}`} />
        <span className={`text-[10px] ${active === 'analysis' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>分析</span>
      </button>
      
      <button 
        onClick={() => onNavigate('home')}
        className="flex flex-col items-center gap-1 w-16"
      >
        <Home className={`w-6 h-6 ${active === 'home' ? 'text-indigo-600' : 'text-slate-300'}`} />
        <span className={`text-[10px] ${active === 'home' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>首页</span>
      </button>
      
      <button 
        onClick={() => onNavigate('user')}
        className="flex flex-col items-center gap-1 w-16"
      >
        <User className={`w-6 h-6 ${active === 'user' ? 'text-indigo-600' : 'text-slate-300'}`} />
        <span className={`text-[10px] ${active === 'user' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>我的</span>
      </button>
    </div>
  );
}
