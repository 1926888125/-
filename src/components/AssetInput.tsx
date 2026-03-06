import React, { useState } from 'react';
import { ChevronLeft, Wallet, Home as HomeIcon, TrendingUp, CreditCard, Landmark, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalState } from '../context/GlobalStateContext';

export function AssetInput({ onBack }: { onBack: () => void }) {
  const { assetsData, setAssetsData } = useGlobalState();
  const [showToast, setShowToast] = useState(false);
  const [localAssets, setLocalAssets] = useState(assetsData);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalAssets({ ...localAssets, [field as keyof typeof localAssets]: val === '' ? '' : Number(val) });
  };

  const liquid = Number(localAssets.liquid) || 0;
  const fixed = Number(localAssets.fixed) || 0;
  const investment = Number(localAssets.investment) || 0;
  const receivable = Number(localAssets.receivable) || 0;
  const liability = Number(localAssets.liability) || 0;

  const totalAssets = liquid + fixed + investment + receivable;
  const totalLiabilities = liability;
  const netWorth = totalAssets - totalLiabilities;

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleSave = () => {
    setAssetsData(localAssets);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onBack();
    }, 2000);
  };

  const inputModules = [
    { id: 'liquid', title: '流动资金', desc: '现金、活期、支付宝、微信等', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'fixed', title: '固定资产', desc: '房产估值、车辆估值等', icon: HomeIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'investment', title: '投资理财', desc: '股票、基金、定期理财等', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'receivable', title: '应收款', desc: '借给他人的钱、未报销款项等', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'liability', title: '负债', desc: '房贷、车贷、信用卡、花呗等', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-50' },
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
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-sm">🎉 保存成功！当前净资产为 ¥{formatMoney(netWorth)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F5F6F8] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 active:bg-slate-200 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-800">家庭资产记账</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Dashboard Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg text-white">
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm mb-2 font-medium">家庭净资产(元)</p>
            <h2 className="text-4xl font-bold tracking-tight">¥ {formatMoney(netWorth)}</h2>
          </div>
          <div className="flex justify-between border-t border-white/20 pt-4">
            <div className="text-center flex-1 border-r border-white/20">
              <p className="text-white/80 text-xs mb-1">总资产</p>
              <p className="font-semibold text-lg">¥ {formatMoney(totalAssets)}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-white/80 text-xs mb-1">总负债</p>
              <p className="font-semibold text-lg">¥ {formatMoney(totalLiabilities)}</p>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="space-y-3">
          {inputModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${mod.bg}`}>
                    <Icon className={`w-5 h-5 ${mod.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{mod.title}</h3>
                    <p className="text-[10px] text-slate-400">{mod.desc}</p>
                  </div>
                </div>
                <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
                  <span className="absolute left-4 text-slate-400 font-medium">¥</span>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    placeholder="0"
                    value={localAssets[mod.id as keyof typeof localAssets] === 0 ? '' : localAssets[mod.id as keyof typeof localAssets]}
                    onChange={handleChange(mod.id)}
                    className="w-full bg-transparent py-3 pl-8 pr-10 text-slate-800 font-semibold focus:outline-none"
                  />
                  <span className="absolute right-4 text-slate-400 text-sm">元</span>
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
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all"
        >
          保存并计算净资产
        </button>
      </div>
    </div>
  );
}
