import React from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../types';

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Transaction, 'id'>>();

  const onSubmit = (data: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...data,
      id: uuidv4(),
      amount: Number(data.amount),
    };
    onAddTransaction(transaction);
    reset();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Add New Transaction</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Transaction Type</label>
            <select 
              className="w-full p-2 border rounded-md"
              {...register('type', { required: 'Type is required' })}
            >
              <option value="expense">Expense (Money Out)</option>
              <option value="income">Income (Money In)</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-md"
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Amount</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded-md"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' } 
              })}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Category</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              {...register('category', { required: 'Category is required' })}
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Person Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              placeholder="Who paid/received money"
              {...register('payee', { required: 'Person name is required' })}
            />
            {errors.payee && <p className="text-red-500 text-sm mt-1">{errors.payee.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Reason</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              placeholder="Reason for transaction"
              {...register('reason', { required: 'Reason is required' })}
            />
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Description (Optional)</label>
          <textarea 
            className="w-full p-2 border rounded-md"
            rows={2}
            {...register('description')}
          />
        </div>

        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm; 