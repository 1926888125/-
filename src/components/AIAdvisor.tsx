import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useGlobalState } from '../context/GlobalStateContext';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "YOUR_API_KEY_HERE";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function AIAdvisor() {
  const { assetsData, cashflowData, investmentData, mentalAccounts, insuranceList } = useGlobalState();
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate financial metrics for the prompt
  const liquid = Number(assetsData.liquid) || 0;
  const fixed = Number(assetsData.fixed) || 0;
  const investment = Number(assetsData.investment) || 0;
  const receivable = Number(assetsData.receivable) || 0;
  const liability = Number(assetsData.liability) || 0;
  const totalAssets = liquid + fixed + investment + receivable;
  const netWorth = totalAssets - liability;

  const stableIncome = Number(cashflowData.stableIncome) || 0;
  const flexibleIncome = Number(cashflowData.flexibleIncome) || 0;
  const stableExpense = Number(cashflowData.stableExpense) || 0;
  const flexibleExpense = Number(cashflowData.flexibleExpense) || 0;
  const totalIncome = stableIncome + flexibleIncome;
  const totalExpense = stableExpense + flexibleExpense;
  const annualBalance = totalIncome - totalExpense;
  const balanceRate = totalIncome > 0 ? (annualBalance / totalIncome) * 100 : 0;

  const totalAnnualPremium = insuranceList.reduce((sum, policy) => sum + (Number(policy.annualPremium) || 0), 0);
  const emergencyFund = mentalAccounts.emergency.allocated;
  const emergencyTarget = mentalAccounts.emergency.target;

  const systemPrompt = `你是一个顶级的私人财富管理专家。请基于以下用户的真实财务数据，用专业、客观、富有同理心且接地气的语言回答用户的理财问题。如果数据存在隐患（如负债过高、结余率为负、备用金不足），请直接指出并给出可执行的建议。

用户数据：
- 资产负债表：总资产 ¥${totalAssets}，总负债 ¥${liability}，净资产 ¥${netWorth}。
- 现金流状态：总收入 ¥${totalIncome}，总支出 ¥${totalExpense}，结余率 ${balanceRate.toFixed(1)}%。
- 各项资产占比：流动资金 ¥${liquid}，投资理财 ¥${investment}，固定资产 ¥${fixed}。
- 保单与心理账户：每年刚性保费支出 ¥${totalAnnualPremium}，备用金储备 ¥${emergencyFund} (目标 ¥${emergencyTarget})。`;

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    // Initial greeting if chat is empty
    if (chatHistory.length === 0) {
      const greeting = `您好！我是您的专属 AI 财务顾问。我刚刚查看了您的财务健康度：目前您的净资产为 ¥${new Intl.NumberFormat('en-US').format(netWorth)}，结余率达到了 ${balanceRate.toFixed(1)}%，${balanceRate > 20 ? '财务状况非常健康！' : balanceRate > 0 ? '财务状况良好，但还有提升空间。' : '目前处于负现金流状态，需要注意了！'}请问今天想聊点什么？是想优化您的投资组合，还是评估近期的消费计划？`;
      setChatHistory([{ role: 'assistant', content: greeting }]);
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: inputValue.trim() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare messages for API (including system prompt)
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...newHistory.map(m => ({ role: m.role, content: m.content }))
      ];

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: apiMessages,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiMsgContent = data.choices[0].message.content;
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiMsgContent }]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，我现在暂时无法连接到服务器。请检查您的 API Key 或稍后再试。' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F6F8]">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-center shadow-sm z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="font-bold text-slate-800 text-lg">私人财富顾问</h1>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        <AnimatePresence initial={false}>
          {chatHistory.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
                <div 
                  className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-md' 
                      : 'bg-white text-slate-700 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[85%] gap-2 flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="px-4 py-4 bg-white rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[68px] left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 p-3 z-20">
        <div className="flex items-center gap-2 bg-[#F5F6F8] rounded-full p-1 border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问问关于理财的任何问题..."
            className="flex-1 bg-transparent py-2 px-4 text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`p-2 rounded-full flex items-center justify-center transition-colors ${
              inputValue.trim() && !isLoading 
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
