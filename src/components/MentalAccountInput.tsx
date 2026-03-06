import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalState } from '../context/GlobalStateContext';

const CircularProgress = ({ percentage, colorClass }: { percentage: number, colorClass: string }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-500 ease-out ${colorClass}`}
        />
      </svg>
      <span className={`absolute text-xs font-bold ${colorClass}`}>{Math.round(safePercentage)}%</span>
    </div>
  );
};

export function MentalAccountInput({ onBack }: { onBack: () => void }) {
  const { mentalAccounts, setMentalAccounts, assetsData, cashflowData } = useGlobalState();
  const [showToast, setShowToast] = useState(false);
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [tempTarget, setTempTarget] = useState('');
  const [accounts, setAccounts] = useState(mentalAccounts);

  const totalLiquidAssets = Number(assetsData.liquid) || 0;
  const monthlyStableExpenses = (Number(cashflowData.stableExpense) || 0) / 12;

  // Auto-calculate emergency fund target if it's not set or if monthly expenses changed
  useEffect(() => {
    const calculatedEmergencyTarget = monthlyStableExpenses * 6;
    if (accounts.emergency.target !== calculatedEmergencyTarget) {
      setAccounts((prev: any) => ({
        ...prev,
        emergency: { ...prev.emergency, target: calculatedEmergencyTarget }
      }));
    }
  }, [monthlyStableExpenses]);

  const totalAllocated = accounts.emergency.allocated + accounts.education.allocated + accounts.travel.allocated;
  const remaining = totalLiquidAssets - totalAllocated;
  const isOverAllocated = remaining < 0;

  const handleSliderChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setAccounts({
      ...accounts,
      [key]: { ...accounts[key as keyof typeof accounts], allocated: val }
    });
  };

  const handleTargetSave = (key: string) => {
    const val = Number(tempTarget);
    if (val > 0) {
      setAccounts({
        ...accounts,
        [key]: { ...accounts[key as keyof typeof accounts], target: val }
      });
    }
    setEditingTarget(null);
  };

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleSave = () => {
    setMentalAccounts(accounts);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onBack();
    }, 2000);
  };

  const accountConfigs = [
    {
      id: 'emergency',
      name: '备用金',
      desc: '防范失业或意外 (6个月生活费)',
      color: 'text-purple-600',
      accent: 'accent-purple-600',
      editable: false
    },
    {
      id: 'education',
      name: '子女教育',
      desc: '为孩子的未来投资',
      color: 'text-purple-400',
      accent: 'accent-purple-400',
      editable: true
    },
    {
      id: 'travel',
      name: '旅行资金',
      desc: '每年一次的家庭旅行',
      color: 'text-yellow-400',
      accent: 'accent-yellow-400',
      editable: true
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F6F8] pb-28 relative">
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-16 left-4 right-4 z-[60] flex justify-center"
          >
            <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-sm">账户配置已保存！</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F5F6F8] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 active:bg-slate-200 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-800">心理账户设置</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        {/* Dashboard Card */}
        <div className="bg-purple-50 rounded-2xl p-6 shadow-sm border border-purple-100/50 text-center">
          <p className="text-purple-800/60 text-xs mb-2 font-medium">当前可分配流动资金</p>
          <h2 className={`text-4xl font-bold tracking-tight mb-1 ${isOverAllocated ? 'text-rose-500' : 'text-purple-900'}`}>
            ¥ {formatMoney(remaining)}
          </h2>
          {isOverAllocated ? (
            <p className="text-[10px] text-rose-500 font-medium bg-rose-100 inline-block px-2 py-0.5 rounded-full">已超额分配！</p>
          ) : (
            <p className="text-[10px] text-purple-600/60 font-medium">总流动资金: ¥{formatMoney(totalLiquidAssets)}</p>
          )}
        </div>

        {/* Account Cards */}
        <div className="space-y-4">
          {accountConfigs.map((config) => {
            const acc = accounts[config.id];
            const percentage = acc.target > 0 ? (acc.allocated / acc.target) * 100 : 0;
            
            return (
              <div key={config.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{config.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{config.desc}</p>
                  </div>
                  <CircularProgress percentage={percentage} colorClass={config.color} />
                </div>
                
                <div className="space-y-3">
                  <input 
                    type="range" 
                    min="0" 
                    max={acc.target * 1.5} // Allow over-allocating up to 150% of target for flexibility
                    step="1000"
                    value={acc.allocated}
                    onChange={handleSliderChange(config.id)}
                    className={`w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer ${config.accent}`}
                  />
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">已分配</p>
                      <p className={`text-sm font-bold ${config.color}`}>¥ {formatMoney(acc.allocated)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 mb-0.5">目标</p>
                      {editingTarget === config.id ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            autoFocus
                            className="w-20 text-right text-sm font-bold text-slate-800 border-b border-purple-300 focus:outline-none bg-transparent"
                            value={tempTarget}
                            onChange={(e) => setTempTarget(e.target.value)}
                            onBlur={() => handleTargetSave(config.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTargetSave(config.id)}
                          />
                        </div>
                      ) : (
                        <div 
                          className={`flex items-center gap-1 justify-end ${config.editable ? 'cursor-pointer group' : ''}`}
                          onClick={() => {
                            if (config.editable) {
                              setTempTarget(acc.target.toString());
                              setEditingTarget(config.id);
                            }
                          }}
                        >
                          <p className="text-sm font-bold text-slate-800">¥ {formatMoney(acc.target)}</p>
                          {config.editable && <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-purple-500 transition-colors" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent max-w-md mx-auto z-50">
        <button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/30 active:scale-[0.98] transition-all"
        >
          保存账户配置
        </button>
      </div>
    </div>
  );
}
