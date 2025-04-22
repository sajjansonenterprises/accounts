// Transaction type definitions
export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  payee: string; // person involved in transaction
  type: TransactionType; // expense or income
  reason: string; // reason for the transaction
}

// Filter options for generating statements
export interface DateFilter {
  startDate: string;
  endDate: string;
}

// Filter options for transaction list
export interface TransactionFilter {
  type?: TransactionType;
  category?: string;
  payee?: string;
  startDate?: string;
  endDate?: string;
} 