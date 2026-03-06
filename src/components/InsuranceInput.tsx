import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, Shield, Users, DollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalState } from '../context/GlobalStateContext';

const INSURANCE_TYPES = ['意外险', '医疗险', '重疾险', '寿险', '年金/储蓄险'];
const FAMILY_ROLES = ['我', '配偶', '父亲', '母亲', '子女'];
const COVERAGE_PERIODS = ['保1年', '保至70岁', '保至80岁', '保终身'];
const PAYMENT_TERMS = ['趸交(一次性)', '交10年', '交20年', '交30年'];

export function InsuranceInput({ onBack }: { onBack: () => void }) {
  const { insuranceList, setInsuranceList } = useGlobalState();
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    type: '重疾险',
    productName: '',
    policyholder: '我',
    insuredPerson: '我',
    beneficiary: '法定',
    sumInsured: '',
    annualPremium: '',
    coveragePeriod: '保终身',
    paymentTerm: '交20年',
    nextPaymentDate: ''
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let val = e.target.value;
    if (field === 'sumInsured' || field === 'annualPremium') {
      if (Number(val) < 0) return; // Prevent negative numbers
    }
    setFormData({ ...formData, [field]: val });
  };

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
  };

  const handleSave = () => {
    const newPolicy = { ...formData, id: Date.now().toString() };
    setInsuranceList([...insuranceList, newPolicy]);
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
              <span className="font-medium text-sm">保单添加成功！</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F5F6F8] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 active:bg-slate-200 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-800">添加家庭保单</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        {/* Block A: Basic Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-slate-800 text-sm">基础保单信息</h2>
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-2">险种类别</label>
            <div className="flex flex-wrap gap-2">
              {INSURANCE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    formData.type === type 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">保险公司与产品名称</label>
            <input 
              type="text"
              placeholder="如：平安福2021"
              value={formData.productName}
              onChange={handleChange('productName')}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Block B: Roles */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-slate-800 text-sm">家庭角色关联</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">投保人 (交钱的)</label>
              <div className="relative">
                <select 
                  value={formData.policyholder}
                  onChange={handleChange('policyholder')}
                  className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  {FAMILY_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">被保人 (受保障的)</label>
              <div className="relative">
                <select 
                  value={formData.insuredPerson}
                  onChange={handleChange('insuredPerson')}
                  className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  {FAMILY_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">受益人 (领钱的)</label>
            <input 
              type="text"
              placeholder="如：法定 / 配偶"
              value={formData.beneficiary}
              onChange={handleChange('beneficiary')}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Block C: Financial Data */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-slate-800 text-sm">核心财务数据</h2>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">基本保额 (最高赔付)</label>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0"
                min="0"
                value={formData.sumInsured}
                onChange={handleChange('sumInsured')}
                className="w-full bg-transparent py-3 pl-4 pr-10 text-slate-800 font-medium focus:outline-none text-sm"
              />
              <span className="absolute right-4 text-slate-400 text-xs">元</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">年交保费 (每年支出)</label>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent focus-within:bg-white transition-all overflow-hidden">
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0"
                min="0"
                value={formData.annualPremium}
                onChange={handleChange('annualPremium')}
                className="w-full bg-transparent py-3 pl-4 pr-16 text-slate-800 font-medium focus:outline-none text-sm"
              />
              <span className="absolute right-4 text-slate-400 text-xs">元/年</span>
            </div>
          </div>
        </div>

        {/* Block D: Time & Term */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-slate-800 text-sm">时间与期限</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">保障期限</label>
              <div className="relative">
                <select 
                  value={formData.coveragePeriod}
                  onChange={handleChange('coveragePeriod')}
                  className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  {COVERAGE_PERIODS.map(period => <option key={period} value={period}>{period}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">缴费期限</label>
              <div className="relative">
                <select 
                  value={formData.paymentTerm}
                  onChange={handleChange('paymentTerm')}
                  className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  {PAYMENT_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">下次缴费日</label>
            <input 
              type="date"
              value={formData.nextPaymentDate}
              onChange={handleChange('nextPaymentDate')}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F6F8] via-[#F5F6F8] to-transparent max-w-md mx-auto z-50">
        <button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all"
        >
          保存保单信息
        </button>
      </div>
    </div>
  );
}
