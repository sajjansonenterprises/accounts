import { Transaction } from '../types';

const STORAGE_KEY = 'accounting_transactions';
const CATEGORIES_STORAGE_KEY = 'accounting_categories';

// Get all transactions from local storage
export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  const storedTransactions = localStorage.getItem(STORAGE_KEY);
  return storedTransactions ? JSON.parse(storedTransactions) : [];
};

// Save a new transaction
export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

// Update an existing transaction
export const updateTransaction = (updatedTransaction: Transaction): void => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === updatedTransaction.id);
  if (index !== -1) {
    transactions[index] = updatedTransaction;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
};

// Delete a transaction
export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const updatedTransactions = transactions.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
};

// Get transactions filtered by date range
export const getTransactionsByDateRange = (startDate: string, endDate: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate >= new Date(startDate) &&
      transactionDate <= new Date(endDate)
    );
  });
};

// Category management
export const getCategories = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
  return storedCategories ? JSON.parse(storedCategories) : [
    'Food', 'Transportation', 'Utilities', 'Rent', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Salary', 'Gifts', 'Other'
  ];
};

export const addCategory = (category: string): void => {
  const categories = getCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }
};

export const deleteCategory = (category: string): void => {
  const categories = getCategories();
  const updatedCategories = categories.filter(c => c !== category);
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
}; 