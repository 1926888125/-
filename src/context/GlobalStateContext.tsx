import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface AssetsData {
  liquid: string | number;
  fixed: string | number;
  investment: string | number;
  receivable: string | number;
  liability: string | number;
}

export interface CashflowData {
  stableIncome: string | number;
  flexibleIncome: string | number;
  stableExpense: string | number;
  flexibleExpense: string | number;
}

export interface InsurancePolicy {
  id: string;
  type: string;
  productName: string;
  policyholder: string;
  insuredPerson: string;
  beneficiary: string;
  sumInsured: string | number;
  annualPremium: string | number;
  coveragePeriod: string;
  paymentTerm: string;
  nextPaymentDate: string;
}

export interface InvestmentData {
  initialCapital: string | number;
  currentValue: string | number;
  startDate: string;
}

export interface MentalAccount {
  allocated: number;
  target: number;
}

export interface MentalAccountsData {
  emergency: MentalAccount;
  education: MentalAccount;
  travel: MentalAccount;
}

interface GlobalState {
  assetsData: AssetsData;
  setAssetsData: (data: AssetsData) => void;
  cashflowData: CashflowData;
  setCashflowData: (data: CashflowData) => void;
  insuranceList: InsurancePolicy[];
  setInsuranceList: (data: InsurancePolicy[]) => void;
  investmentData: InvestmentData;
  setInvestmentData: (data: InvestmentData) => void;
  mentalAccounts: MentalAccountsData;
  setMentalAccounts: (data: MentalAccountsData) => void;
  isHydrated: boolean;
}

const defaultAssets: AssetsData = { liquid: '', fixed: '', investment: '', receivable: '', liability: '' };
const defaultCashflow: CashflowData = { stableIncome: '', flexibleIncome: '', stableExpense: '', flexibleExpense: '' };
const defaultInvestment: InvestmentData = { 
  initialCapital: '', 
  currentValue: '', 
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
};
const defaultMental: MentalAccountsData = {
  emergency: { allocated: 0, target: 60000 },
  education: { allocated: 0, target: 200000 },
  travel: { allocated: 0, target: 50000 }
};

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
    setIsHydrated(true);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, isHydrated] as const;
}

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [assetsData, setAssetsData, hydrated1] = useLocalStorage<AssetsData>('finance_assets_data', defaultAssets);
  const [cashflowData, setCashflowData, hydrated2] = useLocalStorage<CashflowData>('finance_cashflow_data', defaultCashflow);
  const [insuranceList, setInsuranceList, hydrated3] = useLocalStorage<InsurancePolicy[]>('finance_insurance_list', []);
  const [investmentData, setInvestmentData, hydrated4] = useLocalStorage<InvestmentData>('finance_investment_data', defaultInvestment);
  const [mentalAccounts, setMentalAccounts, hydrated5] = useLocalStorage<MentalAccountsData>('finance_mental_accounts', defaultMental);

  const isHydrated = hydrated1 && hydrated2 && hydrated3 && hydrated4 && hydrated5;

  return (
    <GlobalStateContext.Provider value={{
      assetsData, setAssetsData,
      cashflowData, setCashflowData,
      insuranceList, setInsuranceList,
      investmentData, setInvestmentData,
      mentalAccounts, setMentalAccounts,
      isHydrated
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
