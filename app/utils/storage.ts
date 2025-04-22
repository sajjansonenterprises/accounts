import { Transaction } from '../types';

const STORAGE_KEY = 'accounting_transactions';

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