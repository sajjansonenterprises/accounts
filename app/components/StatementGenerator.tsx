import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Transaction, DateFilter, TransactionFilter } from '../types';
import { getTransactionsByDateRange, getCategories } from '../utils/storage';

const StatementGenerator: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isGeneratingStatement, setIsGeneratingStatement] = useState(false);
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [categories, setCategories] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<DateFilter>();

  // Load categories
  useEffect(() => {
    setCategories(getCategories());
  }, []);

  // Get unique payees for filter dropdown
  const payees = useMemo(() => {
    if (transactions.length === 0) return [];
    return [...new Set(transactions.map(t => t.payee))];
  }, [transactions]);

  const onSubmit = (data: DateFilter) => {
    const fetchedTransactions = getTransactionsByDateRange(data.startDate, data.endDate);
    setTransactions(fetchedTransactions);
    applyFilters(fetchedTransactions, filters);
    setIsGeneratingStatement(true);
  };

  // Apply filters to transactions
  const applyFilters = (transactionsToFilter: Transaction[], currentFilters: TransactionFilter) => {
    const filtered = transactionsToFilter.filter(transaction => {
      // Filter by type
      if (currentFilters.type && transaction.type !== currentFilters.type) {
        return false;
      }
      
      // Filter by category
      if (currentFilters.category && transaction.category !== currentFilters.category) {
        return false;
      }
      
      // Filter by payee
      if (currentFilters.payee && transaction.payee !== currentFilters.payee) {
        return false;
      }
      
      return true;
    });
    
    setFilteredTransactions(filtered);
  };

  // Update filters and apply them
  const handleFilterChange = (key: keyof TransactionFilter, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    applyFilters(transactions, newFilters);
  };

  // Reset all report filters
  const resetFilters = () => {
    setFilters({});
    setFilteredTransactions(transactions);
  };

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md print:p-0 print:shadow-none">
      <h2 className="text-2xl font-bold mb-4 print:text-center print:mb-6">Generate Statement</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded-md"
              {...register('startDate', { required: 'Start date is required' })}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">End Date</label>
            <input 
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-md"
              {...register('endDate', { required: 'End date is required' })}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
          </div>
        </div>

        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Generate Statement
        </button>
      </form>

      {isGeneratingStatement && (
        <div className="mt-6 print:mt-2">
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h3 className="text-xl font-semibold">Statement Results</h3>
            <div className="text-sm">
              <button 
                onClick={() => window.print()}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
              >
                Print
              </button>
            </div>
          </div>

          {/* Filters for the report */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 print:hidden">
            <h4 className="font-medium mb-2">Filter Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
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
                  onChange={(e) => handleFilterChange('category', e.target.value)}
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
                  onChange={(e) => handleFilterChange('payee', e.target.value)}
                >
                  <option value="">All People</option>
                  {payees.map(payee => (
                    <option key={payee} value={payee}>{payee}</option>
                  ))}
                </select>
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

          {/* Print-only header */}
          <div className="hidden print:block mb-4">
            <h3 className="text-xl font-semibold text-center">Financial Statement</h3>
            <p className="text-center text-sm text-gray-600">
              {filteredTransactions.length > 0 && 
                `From ${format(new Date(filteredTransactions[0].date), 'MMM dd, yyyy')} to 
                ${format(new Date(filteredTransactions[filteredTransactions.length - 1].date), 'MMM dd, yyyy')}`
              }
            </p>
          </div>

          {filteredTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions found for the selected criteria</p>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3 print:gap-2">
                <div className="bg-green-50 p-4 rounded-lg print:border print:border-gray-200">
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg print:border print:border-gray-200">
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
                </div>
                <div className={`p-4 rounded-lg print:border print:border-gray-200 ${balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                    ${balance.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Filter summary for print */}
              <div className="hidden print:block mb-4 text-sm">
                <p>
                  <strong>Filters:</strong> 
                  {filters.type ? ` Type: ${filters.type}` : ' All Types'} | 
                  {filters.category ? ` Category: ${filters.category}` : ' All Categories'} | 
                  {filters.payee ? ` Person: ${filters.payee}` : ' All People'}
                </p>
              </div>

              {/* Mobile-friendly table */}
              <div className="md:hidden space-y-4 print:hidden">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className={`p-4 rounded-lg ${transaction.type === 'expense' ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'expense' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.type === 'expense' ? 'Money Out' : 'Money In'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">
                        <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                          {transaction.type === 'expense' ? '-' : '+'} ${transaction.amount.toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="mb-1"><span className="font-medium">To/From:</span> {transaction.payee}</div>
                      <div className="mb-1"><span className="font-medium">Reason:</span> {transaction.reason}</div>
                      <div><span className="font-medium">Category:</span> {transaction.category}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop and print table */}
              <div className="hidden md:block print:block">
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="min-w-full divide-y divide-gray-200 print:w-full">
                    <thead className="bg-gray-50 print:bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2">Person</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2">Category</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className={transaction.type === 'expense' ? 'bg-red-50 print:bg-white' : 'bg-green-50 print:bg-white'}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 print:px-2 print:py-2">
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm print:px-2 print:py-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === 'expense' 
                                ? 'bg-red-100 text-red-800 print:bg-white print:text-red-600 print:border print:border-red-200' 
                                : 'bg-green-100 text-green-800 print:bg-white print:text-green-600 print:border print:border-green-200'
                            }`}>
                              {transaction.type === 'expense' ? 'Money Out' : 'Money In'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium print:px-2 print:py-2">
                            <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                              {transaction.type === 'expense' ? '-' : '+'} ${transaction.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 print:px-2 print:py-2">{transaction.payee}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 print:px-2 print:py-2">{transaction.reason}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 print:px-2 print:py-2">{transaction.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500 print:hidden">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatementGenerator;