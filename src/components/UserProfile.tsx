import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  ChevronRight, 
  Globe, 
  Moon, 
  MessageSquare, 
  Info,
  AlertTriangle
} from 'lucide-react';

export function UserProfile() {
  const [toastMsg, setToastMsg] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleNotImplemented = () => {
    showToast('该功能正在开发中~');
  };

  const handleExport = () => {
    try {
      const data = {
        assetsData: localStorage.getItem('assetsData'),
        cashflowData: localStorage.getItem('cashflowData'),
        investmentData: localStorage.getItem('investmentData'),
        mentalAccounts: localStorage.getItem('mentalAccounts'),
        insuranceList: localStorage.getItem('insuranceList'),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'My_Finance_Backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('导出成功');
    } catch (e) {
      showToast('导出失败');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          if (data.assetsData) localStorage.setItem('assetsData', data.assetsData);
          if (data.cashflowData) localStorage.setItem('cashflowData', data.cashflowData);
          if (data.investmentData) localStorage.setItem('investmentData', data.investmentData);
          if (data.mentalAccounts) localStorage.setItem('mentalAccounts', data.mentalAccounts);
          if (data.insuranceList) localStorage.setItem('insuranceList', data.insuranceList);
          
          showToast('数据恢复成功，即将刷新...');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (error) {
        showToast('文件格式错误或解析失败');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('assetsData');
    localStorage.removeItem('cashflowData');
    localStorage.removeItem('investmentData');
    localStorage.removeItem('mentalAccounts');
    localStorage.removeItem('insuranceList');
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F6F8] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-8 shadow-sm rounded-b-3xl mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
              我
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">首席财务官</h1>
              <p className="text-sm text-slate-400 mt-1">理财记账第 1 天</p>
            </div>
          </div>
          <button onClick={handleNotImplemented} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Card 1: Data Management */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">数据安全与管理</h2>
          </div>
          
          <button onClick={handleExport} className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-slate-700 font-medium text-sm">导出财务数据</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button onClick={handleImportClick} className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Upload className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-slate-700 font-medium text-sm">导入财务数据</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImportChange}
          />

          <button onClick={() => setShowClearModal(true)} className="w-full flex items-center justify-between px-4 py-4 hover:bg-red-50 active:bg-red-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-red-500 font-medium text-sm">清空所有数据</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-200" />
          </button>
        </div>

        {/* Card 2: Basic Settings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">基础设置</h2>
          </div>
          
          <button onClick={handleNotImplemented} className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="text-slate-700 font-medium text-sm">货币单位</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">人民币 (CNY)</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>

          <button onClick={handleNotImplemented} className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Moon className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-slate-700 font-medium text-sm">主题设置</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">跟随系统</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>
        </div>

        {/* Card 3: About & Support */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">关于与支持</h2>
          </div>
          
          <button onClick={handleNotImplemented} className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-slate-700 font-medium text-sm">问题反馈</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button onClick={handleNotImplemented} className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-teal-500" />
              </div>
              <span className="text-slate-700 font-medium text-sm">关于我们</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">v1.0.0</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Modal */}
      <AnimatePresence>
        {showClearModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 max-w-md mx-auto"
              onClick={() => setShowClearModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[320px] bg-white rounded-3xl p-6 z-50 shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">清空所有数据</h3>
                <p className="text-sm text-slate-500 mb-6">
                  警告：这将永久删除您设备上的所有记账与配置数据。确定吗？
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleClearData}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
                  >
                    确定清空
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
