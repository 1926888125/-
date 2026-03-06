import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Home } from './components/Home';
import { AssetInput } from './components/AssetInput';
import { InsuranceInput } from './components/InsuranceInput';
import { CashFlowInput } from './components/CashFlowInput';
import { InvestmentInput } from './components/InvestmentInput';
import { MentalAccountInput } from './components/MentalAccountInput';
import { AIAdvisor } from './components/AIAdvisor';
import { UserProfile } from './components/UserProfile';
import { BottomNav } from './components/BottomNav';
import { GlobalStateProvider, useGlobalState } from './context/GlobalStateContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'home' | 'input' | 'insurance' | 'cashflow' | 'investment' | 'mental' | 'analysis' | 'user'>('home');
  const { isHydrated } = useGlobalState();

  if (!isHydrated) {
    return <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center text-slate-400 text-sm">加载中...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F6F8] font-sans text-slate-800 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full pb-[68px]"
            >
              <Home 
                onNavigate={() => setCurrentPage('input')} 
                onNavigateInsurance={() => setCurrentPage('insurance')}
                onNavigateCashFlow={() => setCurrentPage('cashflow')}
                onNavigateInvestment={() => setCurrentPage('investment')}
                onNavigateMental={() => setCurrentPage('mental')}
              />
            </motion.div>
          )}
          {currentPage === 'analysis' && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full pb-[68px]"
            >
              <AIAdvisor />
            </motion.div>
          )}
          {currentPage === 'user' && (
            <motion.div 
              key="user"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full pb-[68px]"
            >
              <UserProfile />
            </motion.div>
          )}
          {currentPage === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <AssetInput onBack={() => setCurrentPage('home')} />
            </motion.div>
          )}
          {currentPage === 'insurance' && (
            <motion.div 
              key="insurance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <InsuranceInput onBack={() => setCurrentPage('home')} />
            </motion.div>
          )}
          {currentPage === 'cashflow' && (
            <motion.div 
              key="cashflow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <CashFlowInput onBack={() => setCurrentPage('home')} />
            </motion.div>
          )}
          {currentPage === 'investment' && (
            <motion.div 
              key="investment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <InvestmentInput onBack={() => setCurrentPage('home')} />
            </motion.div>
          )}
          {currentPage === 'mental' && (
            <motion.div 
              key="mental"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <MentalAccountInput onBack={() => setCurrentPage('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Only show bottom nav on main pages */}
      <AnimatePresence>
        {(currentPage === 'home' || currentPage === 'analysis' || currentPage === 'user') && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
          >
            <BottomNav 
              active={currentPage} 
              onNavigate={(page) => setCurrentPage(page as any)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <GlobalStateProvider>
      <AppContent />
    </GlobalStateProvider>
  );
}
