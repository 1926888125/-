import React, { useState, useMemo } from 'react';
import { ChevronLeft, CheckCircle2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useGlobalState } from '../context/GlobalStateContext';

export function InvestmentInput({ onBack }: { onBack: () => void }) {
  const { investmentData, setInvestmentData } = useGlobalState();
  const [showToast, setShowToast] = useState(false);
  
  const [data, setData] = useState(investmentData);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (field === 'startDate') {
      setData({ ...data, [field]: val });
    } else {
      setData({ ...data, [field as keyof typeof data]: val === '' ? '' : Number(val) });
    }
  };

  const initial = Number(data.initialCapital) || 0;
  const current = Number(data.currentValue) || 0;
  
  const start = new Date(data.startDate);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const daysInvested = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const totalProfit = current - initial;
  const totalReturnRate = initial > 0 ? (totalProfit / initial) * 100 : 0;

  let annualizedReturn = 0;
  let isShortTerm = false;

  if (initial > 0 && current > 0) {
    if (daysInvested < 7) {
      isShortTerm = true;
      // Simple linear extrapolation for very short term to avoid crazy compounding numbers
      annualizedReturn = totalReturnRate * (365 / daysInvested);
    } else {
      annualizedReturn = (Math.pow(current / initial, 365 / daysInvested) - 1) * 100;
    }
  }

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const chartData = useMemo(() => {
    if (initial === 0 && current === 0) {
      return Array.from({ length: 7 }).map((_, i) => ({ day: i, value: 0 }));
    }
    
    const points = 7;
    const result = [];
    const step = (current - initial) / (points - 1);
    
    for (let i = 0; i < points; i++) {
      let val = initial + step * i;
      // Add some random noise to middle points to make it look like a real chart
      if (i > 0 && i < points - 1) {
        const noise = (Math.random() - 0.5) * (initial * 0.02); // 2% noise
        val += noise;
      }
      result.push({
        day: `Day ${i + 1}`,
        value: Math.max(0, val)
      });
    }
    // Ensure the last point is exactly the current value
    result[points - 1].value = current;
    return result;
  }, [initial, current]);

  const handleSave = () => {
    setInvestmentData(data);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onBack();
    }, 2000);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700 z-50">
          <p className="font-mono">¥ {formatMoney(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

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
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-sm">投资记录已更新！</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F5F6F8] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 active:bg-slate-200 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-800">投资记账</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-5">
        {/* Dashboard Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm mb-1 font-medium flex items-center justify-center gap-1">
              年化收益率 (%)
              {isShortTerm && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">时间过短</span>}
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              {annualizedReturn > 0 ? '+' : ''}{annualizedReturn.toFixed(2)}%
            </h2>
          </div>
          <div className="flex justify-between border-t border-white/20 pt-4">
            <div className="text-center flex-1 border-r border-white/20">
              <p className="text-white/80 text-[10px] mb-1">累计盈亏</p>
              <p className={`font-semibold text-sm ${totalProfit < 0 ? 'text-rose-200' : 'text-white'}`}>
                {totalProfit > 0 ? '+' : ''}¥ {formatMoney(totalProfit)}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-white/80 text-[10px] mb-1">累计收益率</p>
              <p className={`font-semibold text-sm ${totalReturnRate < 0 ? 'text-rose-200' : 'text-white'}`}>
                {totalReturnRate > 0 ? '+' : ''}{totalReturnRate.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm">资产走势 (模拟)</h2>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">近 {daysInvested} 天</span>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Form Area */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="font-bold text-slate-800 text-sm">投资数据录入</h2>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">初始本金</label>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <span className="absolute left-4 text-slate-400 font-medium">¥</span>
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0"
                value={data.initialCapital === 0 ? '' : data.initialCapital}
                onChange={handleChange('initialCapital')}
                className="w-full bg-transparent py-3 pl-8 pr-12 text-slate-800 font-semibold focus:outline-none"
              />
              <span className="absolute right-4 text-slate-400 text-xs">元</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">当前市值</label>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <span className="absolute left-4 text-slate-400 font-medium">¥</span>
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0"
                value={data.currentValue === 0 ? '' : data.currentValue}
                onChange={handleChange('currentValue')}
                className="w-full bg-transparent py-3 pl-8 pr-12 text-slate-800 font-semibold focus:outline-none"
              />
              <span className="absolute right-4 text-slate-400 text-xs">元</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">投资起算日</label>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input 
                type="date" 
                value={data.startDate}
                onChange={handleChange('startDate')}
                className="w-full bg-transparent py-3 pl-10 pr-4 text-slate-800 font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent max-w-md mx-auto z-50">
        <button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
        >
          更新投资记录
        </button>
      </div>
    </div>
  );
}
