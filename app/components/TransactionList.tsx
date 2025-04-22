import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Transaction, TransactionFilter } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit }) => {
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories and payees for filter dropdowns
  const categories = useMemo(() => {
    return [...new Set(transactions.map(t => t.category))];
  }, [transactions]);

  const payees = useMemo(() => {
    return [...new Set(transactions.map(t => t.payee))];
  }, [transactions]);

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by type
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }
      
      // Filter by category
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }
      
      // Filter by payee
      if (filters.payee && transaction.payee !== filters.payee) {
        return false;
      }
      
      // Filter by date range
      if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
        return false;
      }
      
      if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
        return false;
      }
      
      return true;
    });
  }, [transactions, filters]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({});
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium mb-3">Filter Transactions</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={filters.type || ''}
                onChange={(e) => setFilters({...filters, type: e.target.value as any || undefined})}
              >
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={filters.category || ''}
                onChange={(e) => setFilters({...filters, category: e.target.value || undefined})}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Person</label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={filters.payee || ''}
                onChange={(e) => setFilters({...filters, payee: e.target.value || undefined})}
              >
                <option value="">All People</option>
                {payees.map(payee => (
                  <option key={payee} value={payee}>{payee}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md text-sm"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({...filters, startDate: e.target.value || undefined})}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md text-sm"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({...filters, endDate: e.target.value || undefined})}
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className={transaction.type === 'expense' ? 'bg-red-50' : 'bg-green-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.type === 'expense' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {transaction.type === 'expense' ? 'Money Out' : 'Money In'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                    {transaction.type === 'expense' ? '-' : '+'} ${transaction.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.payee}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{transaction.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t">
        <p className="text-sm text-gray-500">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
      </div>
    </div>
  );
};

export default TransactionList; 