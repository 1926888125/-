import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalState } from '../context/GlobalStateContext';

export function CashFlowInput({ onBack }: { onBack: () => void }) {
  const { cashflowData, setCashflowData } = useGlobalState();
  const [showToast, setShowToast] = useState(false);
  const [data, setData] = useState(cashflowData);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setData({ ...data, [field as keyof typeof data]: val === '' ? '' : Number(val) });
  };

  const stableIncome = Number(data.stableIncome) || 0;
  const flexibleIncome = Number(data.flexibleIncome) || 0;
  const stableExpense = Number(data.stableExpense) || 0;
  const flexibleExpense = Number(data.flexibleExpense) || 0;

  const totalIncome = stableIncome + flexibleIncome;
  const totalExpense = stableExpense + flexibleExpense;
  const annualSurplus = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (annualSurplus / totalIncome) * 100 : 0;

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleSave = () => {
    setCashflowData(data);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onBack();
    }, 2000);
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
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-sm">预算保存成功，请努力保持结余！</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F5F6F8] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 active:bg-slate-200 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-800">现金流计算器</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-5">
        {/* Dashboard Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm mb-2 font-medium">年度结余 (元)</p>
            <h2 className={`text-4xl font-bold tracking-tight ${annualSurplus < 0 ? 'text-rose-200' : 'text-white'}`}>
              ¥ {formatMoney(annualSurplus)}
            </h2>
          </div>
          <div className="flex justify-between border-t border-white/20 pt-4">
            <div className="text-center flex-1 border-r border-white/20">
              <p className="text-white/80 text-[10px] mb-1">总收入</p>
              <p className="font-semibold text-sm">¥ {formatMoney(totalIncome)}</p>
            </div>
            <div className="text-center flex-1 border-r border-white/20">
              <p className="text-white/80 text-[10px] mb-1">总支出</p>
              <p className="font-semibold text-sm">¥ {formatMoney(totalExpense)}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-white/80 text-[10px] mb-1">结余率</p>
              <p className="font-semibold text-sm">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <h2 className="font-bold text-slate-800 text-sm">年度收入录入</h2>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">稳定收入</label>
              <span className="text-[10px] text-slate-400">工资、固定租金等</span>
            </div>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <span className="absolute left-4 text-slate-400 font-medium">¥</span>
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0"
                value={data.stableIncome === 0 ? '' : data.stableIncome}
                onChange={handleChange('stableIncome')}
                className="w-full bg-transparent py-3 pl-8 pr-16 text-slate-800 font-semibold focus:outline-none"
              />
              <span className="absolute right-4 text-slate-400 text-xs">元/年</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">弹性收入</label>
              <span className="text-[10px] text-slate-400">年终奖、副业等</span>
            </div>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <span className="absolute left-4 text-slate-400 font-medium">¥</span>
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0"
                value={data.flexibleIncome === 0 ? '' : data.flexibleIncome}
                onChange={handleChange('flexibleIncome')}
                className="w-full bg-transparent py-3 pl-8 pr-16 text-slate-800 font-semibold focus:outline-none"
              />
              <span className="absolute right-4 text-slate-400 text-xs">元/年</span>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="font-bold text-slate-800 text-sm">年度支出录入</h2>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">稳定支出</label>
              <span className="text-[10px] text-slate-400">房贷、基础伙食、保费等刚性支出</span>
            </div>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <span className="absolute left-4 text-slate-400 font-medium">¥</span>
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0"
                value={data.stableExpense === 0 ? '' : data.stableExpense}
                onChange={handleChange('stableExpense')}
                className="w-full bg-transparent py-3 pl-8 pr-16 text-slate-800 font-semibold focus:outline-none"
              />
              <span className="absolute right-4 text-slate-400 text-xs">元/年</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">弹性支出</label>
              <span className="text-[10px] text-slate-400">旅游、换电子产品、娱乐等</span>
            </div>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <span className="absolute left-4 text-slate-400 font-medium">¥</span>
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0"
                value={data.flexibleExpense === 0 ? '' : data.flexibleExpense}
                onChange={handleChange('flexibleExpense')}
                className="w-full bg-transparent py-3 pl-8 pr-16 text-slate-800 font-semibold focus:outline-none"
              />
              <span className="absolute right-4 text-slate-400 text-xs">元/年</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent max-w-md mx-auto z-50">
        <button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all"
        >
          保存年度预算
        </button>
      </div>
    </div>
  );
}
