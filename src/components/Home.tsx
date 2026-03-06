import React, { useMemo, useState } from 'react';
import { ChevronRight, Settings, Download, Trash2, X } from 'lucide-react';
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts';
import { useGlobalState } from '../context/GlobalStateContext';
import { AnimatePresence, motion } from 'motion/react';

const COLORS: Record<string, string> = {
  '负债': '#f43f5e', // rose-500
  '净资产': '#8b5cf6', // violet-500
  '总资产': '#6366f1', // indigo-500
  '流动资金': '#3b82f6', // blue-500
  '投资理财': '#d946ef', // fuchsia-500
  '固定资产': '#10b981', // emerald-500
  '应收款': '#f59e0b', // amber-500
};

const CustomNode = (props: any) => {
  const { x, y, width, height, index, payload } = props;
  
  let textAnchor: 'start' | 'middle' | 'end' = 'start';
  let textX = x + width + 8;
  let textY = y + height / 2;
  
  // Adjust label position based on x coordinate to fit 3 columns
  if (x > 200) {
    textAnchor = 'end';
    textX = x - 8;
  } else if (x > 50 && x < 200) {
    textAnchor = 'middle';
    textX = x + width / 2;
    textY = y - 10;
  }

  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={COLORS[payload.name] || '#cbd5e1'}
        fillOpacity="1"
        radius={4}
      />
      <text
        textAnchor={textAnchor}
        x={textX}
        y={textY}
        fontSize="10"
        fill="#475569"
        dominantBaseline={textAnchor === 'middle' ? 'text-after-edge' : 'central'}
        className="font-medium"
      >
        {payload.name}
      </text>
    </Layer>
  );
};

const CustomLink = (props: any) => {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload } = props;
  
  const gradientId = `linkGradient${index}`;
  
  return (
    <Layer key={`CustomLink${index}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS[payload.source.name] || '#cbd5e1'} stopOpacity={0.25} />
          <stop offset="100%" stopColor={COLORS[payload.target.name] || '#cbd5e1'} stopOpacity={0.25} />
        </linearGradient>
      </defs>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
        `}
        stroke={`url(#${gradientId})`}
        strokeWidth={Math.max(linkWidth, 1)}
        fill="none"
        className="hover:stroke-opacity-50 transition-all duration-200 cursor-pointer"
      />
    </Layer>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isLink = data.source !== undefined;
    
    return (
      <div className="bg-slate-800/95 backdrop-blur-sm text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700 z-50">
        {isLink ? (
          <p className="text-slate-300 mb-1">{`${data.source.name} → ${data.target.name}`}</p>
        ) : (
          <p className="font-bold text-slate-200 mb-1">{data.name}</p>
        )}
        <p className="font-mono text-sm">¥ {new Intl.NumberFormat('en-US').format(data.value)}</p>
      </div>
    );
  }
  return null;
};

export function Home({ 
  onNavigate, 
  onNavigateInsurance, 
  onNavigateCashFlow, 
  onNavigateInvestment, 
  onNavigateMental
}: { 
  onNavigate: () => void, 
  onNavigateInsurance: () => void, 
  onNavigateCashFlow: () => void, 
  onNavigateInvestment: () => void, 
  onNavigateMental: () => void
}) {
  const { assetsData, investmentData, mentalAccounts } = useGlobalState();
  const [showSettings, setShowSettings] = useState(false);

  const liquid = Number(assetsData.liquid) || 0;
  const fixed = Number(assetsData.fixed) || 0;
  const investment = Number(assetsData.investment) || 0;
  const receivable = Number(assetsData.receivable) || 0;
  const liability = Number(assetsData.liability) || 0;

  const totalAssets = liquid + fixed + investment + receivable;
  const totalLiabilities = liability;
  const netWorth = totalAssets - totalLiabilities;
  const hasData = totalAssets > 0 || totalLiabilities > 0;

  // Calculate investment return
  const initial = Number(investmentData.initialCapital) || 0;
  const current = Number(investmentData.currentValue) || 0;
  const start = new Date(investmentData.startDate);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const daysInvested = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  let investmentReturn: number | null = null;
  if (initial > 0 && current > 0) {
    if (daysInvested < 7) {
      const totalReturnRate = (current - initial) / initial * 100;
      investmentReturn = totalReturnRate * (365 / daysInvested);
    } else {
      investmentReturn = (Math.pow(current / initial, 365 / daysInvested) - 1) * 100;
    }
  }

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleExport = () => {
    const data = {
      assetsData: JSON.parse(localStorage.getItem('finance_assets_data') || '{}'),
      cashflowData: JSON.parse(localStorage.getItem('finance_cashflow_data') || '{}'),
      insuranceList: JSON.parse(localStorage.getItem('finance_insurance_list') || '[]'),
      investmentData: JSON.parse(localStorage.getItem('finance_investment_data') || '{}'),
      mentalAccounts: JSON.parse(localStorage.getItem('finance_mental_accounts') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_finance_data.json';
    a.click();
    URL.revokeObjectURL(url);
    setShowSettings(false);
  };

  const handleClear = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      localStorage.removeItem('finance_assets_data');
      localStorage.removeItem('finance_cashflow_data');
      localStorage.removeItem('finance_insurance_list');
      localStorage.removeItem('finance_investment_data');
      localStorage.removeItem('finance_mental_accounts');
      window.location.reload();
    }
  };

  const sankeyData = useMemo(() => {
    if (!hasData) return null;

    const nodes: any[] = [];
    const links: any[] = [];
    
    let nodeIndex = 0;
    const nodeMap = new Map<string, number>();
    
    const addNode = (name: string) => {
      if (!nodeMap.has(name)) {
        nodeMap.set(name, nodeIndex++);
        nodes.push({ name });
      }
      return nodeMap.get(name)!;
    };
    
    if (liability > 0) {
      links.push({ source: addNode('负债'), target: addNode('总资产'), value: liability });
    }
    if (netWorth > 0) {
      links.push({ source: addNode('净资产'), target: addNode('总资产'), value: netWorth });
    }
    
    if (liquid > 0) {
      links.push({ source: addNode('总资产'), target: addNode('流动资金'), value: liquid });
    }
    if (investment > 0) {
      links.push({ source: addNode('总资产'), target: addNode('投资理财'), value: investment });
    }
    if (fixed > 0) {
      links.push({ source: addNode('总资产'), target: addNode('固定资产'), value: fixed });
    }
    if (receivable > 0) {
      links.push({ source: addNode('总资产'), target: addNode('应收款'), value: receivable });
    }
    
    if (links.length === 0) return null;
    
    return { nodes, links };
  }, [liability, netWorth, liquid, investment, fixed, receivable, hasData]);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">数据管理</h3>
                <button onClick={() => setShowSettings(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <button 
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出我的数据
                </button>
                <button 
                  onClick={handleClear}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium py-3 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  ⚠️ 清空所有数据
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-2 px-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800">早上好</h1>
          <p className="text-xs text-slate-500 mt-0.5">今天也是努力搞钱的一天</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Card 1: Family Asset */}
      <div 
        onClick={onNavigate}
        className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-indigo-950">家庭资产记账</h2>
            <p className="text-xs text-slate-400 mt-1">每月3分钟，掌握家庭资产变化</p>
          </div>
          {hasData && (
            <div className="text-right">
              <p className="text-[10px] text-slate-400 mb-0.5">净资产(元)</p>
              <p className="text-lg font-bold text-indigo-600">¥{formatMoney(netWorth)}</p>
            </div>
          )}
        </div>
        
        {/* Sankey Chart */}
        <div className="mt-6 h-48 relative">
          {sankeyData ? (
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankeyData}
                node={<CustomNode />}
                link={<CustomLink />}
                nodePadding={16}
                margin={{ top: 20, right: 10, bottom: 10, left: 10 }}
                nodeWidth={12}
              >
                <Tooltip content={<CustomTooltip />} />
              </Sankey>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400">暂无数据</p>
              <p className="text-[10px] text-slate-300 mt-1">点击卡片开始记账</p>
            </div>
          )}
        </div>
      </div>

      {/* Card 2 & 3: Row */}
      <div className="flex gap-3">
        {/* Investment */}
        <div 
          onClick={onNavigateInvestment}
          className="flex-1 bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <h3 className="font-bold text-slate-800 text-sm">投资记账</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">记录每一笔收益</p>
          <div className="h-12 mt-3 flex items-end">
            <svg viewBox="0 0 100 40" className="w-full h-full stroke-blue-500 fill-blue-50/50">
              <path d="M0 40 L0 30 L20 25 L40 35 L60 15 L80 20 L100 5 L100 40 Z" stroke="none" />
              <path d="M0 30 L20 25 L40 35 L60 15 L80 20 L100 5" fill="none" strokeWidth="2" />
            </svg>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-medium">
            年化收益率 <span className={`font-bold ${investmentReturn !== null ? (investmentReturn >= 0 ? 'text-blue-600' : 'text-rose-500') : 'text-blue-600'}`}>
              {investmentReturn !== null ? `${investmentReturn > 0 ? '+' : ''}${investmentReturn.toFixed(2)}%` : '+5.2%'}
            </span>
          </div>
        </div>

        {/* Cashflow */}
        <div 
          onClick={onNavigateCashFlow}
          className="flex-1 bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <h3 className="font-bold text-slate-800 text-sm">现金流计算器</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">规划未来现金流</p>
          <div className="mt-4 flex flex-col gap-1.5">
            <div className="text-[10px] px-2 py-1.5 rounded bg-purple-50 text-purple-600 text-center font-medium">稳定支出</div>
            <div className="text-[10px] px-2 py-1.5 rounded bg-emerald-50 text-emerald-600 text-center font-medium">弹性支出</div>
            <div className="text-[10px] px-2 py-1.5 rounded border border-dashed border-slate-300 text-slate-500 text-center font-medium">年度结余</div>
          </div>
        </div>
      </div>

      {/* Card 4: Policy */}
      <div 
        onClick={onNavigateInsurance}
        className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <h3 className="font-bold text-slate-800 text-sm w-16 leading-tight">家庭保单<br/>管理</h3>
        <div className="flex gap-1.5 flex-1 justify-center">
          {['意外', '医疗', '重疾', '寿险'].map((tag, i) => (
            <span key={i} className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-1 rounded font-medium">{tag}</span>
          ))}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>

      {/* Card 5: Mental Accounting */}
      <div 
        onClick={onNavigateMental}
        className="mt-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <h3 className="font-bold text-slate-800 text-sm mb-2 px-1">心理账户</h3>
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 shadow-sm flex items-center">
          <div className="w-1/2 relative h-24">
            {/* Stacked cards */}
            <div className="absolute left-4 top-4 w-24 h-16 bg-yellow-50 rounded-xl shadow-sm border border-yellow-100/30 rotate-6 flex items-center justify-center z-10">
              <div className="text-center">
                <span className="text-[10px] font-medium text-yellow-600/60 block">旅行资金</span>
                <span className="text-xs font-bold text-yellow-600">{mentalAccounts.travel.target > 0 ? Math.round((mentalAccounts.travel.allocated / mentalAccounts.travel.target) * 100) : 0}%</span>
              </div>
            </div>
            <div className="absolute left-2 top-2 w-24 h-16 bg-purple-100 rounded-xl shadow-sm border border-purple-200/50 -rotate-3 flex items-center justify-center z-20">
              <div className="text-center">
                <span className="text-[10px] font-medium text-purple-700/80 block">子女教育</span>
                <span className="text-xs font-bold text-purple-700">{mentalAccounts.education.target > 0 ? Math.round((mentalAccounts.education.allocated / mentalAccounts.education.target) * 100) : 0}%</span>
              </div>
            </div>
            <div className="absolute left-0 top-0 w-24 h-16 bg-purple-600 rounded-xl shadow-md border border-purple-500 flex items-center justify-center z-30">
              <div className="text-center">
                <span className="text-[10px] font-medium text-purple-200 block">备用金</span>
                <span className="text-xs font-bold text-white">{mentalAccounts.emergency.target > 0 ? Math.round((mentalAccounts.emergency.allocated / mentalAccounts.emergency.target) * 100) : 0}%</span>
              </div>
            </div>
          </div>
          <div className="w-1/2 pl-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-900 leading-relaxed">
                按用途设置<br/>心理账户
              </p>
              <p className="text-[10px] text-indigo-900/60 mt-2">
                汇总管理账户资产
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
