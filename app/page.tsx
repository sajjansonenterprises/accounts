'use client';

import { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import StatementGenerator from './components/StatementGenerator';
import CategoryManager from './components/CategoryManager';
import { Transaction } from './types';
import { getTransactions, saveTransaction, deleteTransaction, updateTransaction } from './utils/storage';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'reports' | 'categories'>('transactions');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const storedTransactions = getTransactions();
    setTransactions(storedTransactions);
  }, []);

  const handleAddTransaction = (transaction: Transaction) => {
    saveTransaction(transaction);
    setTransactions([...transactions, transaction]);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    updateTransaction(updatedTransaction);
    setTransactions(transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
    setTransactionToEdit(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setTransactionToEdit(null);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    setTransactions(transactions.filter(t => t.id !== id));
    // If the transaction being edited is deleted, clear the edit state
    if (transactionToEdit && transactionToEdit.id === id) {
      setTransactionToEdit(null);
    }
  };

  // Handle category update - refresh form if needed
  const handleCategoryUpdate = () => {
    // This will force the TransactionForm to reload categories
    setTransactionToEdit(null);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Personal Accounting App</h1>
          <p className="mt-2">Track your daily expenses and income</p>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports & Statements
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
          </nav>
        </div>

        {activeTab === 'transactions' && (
          <div className="space-y-8">
            <TransactionForm 
              onAddTransaction={handleAddTransaction} 
              onUpdateTransaction={handleUpdateTransaction}
              transactionToEdit={transactionToEdit}
              onCancelEdit={handleCancelEdit}
            />
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDeleteTransaction} 
              onEdit={handleEditTransaction}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <StatementGenerator />
        )}

        {activeTab === 'categories' && (
          <CategoryManager onCategoryUpdate={handleCategoryUpdate} />
        )}
      </div>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>Personal Accounting App &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}
